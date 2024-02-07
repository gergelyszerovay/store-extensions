import { HttpErrorResponse } from "@angular/common/http";
import { Injector, Signal, computed, inject, runInInjectionContext } from "@angular/core";
import { tapResponse } from "@ngrx/component-store";
import { PartialStateUpdater, SignalStoreFeature, patchState, signalStoreFeature, withComputed, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { Observable, pipe, switchMap, tap } from "rxjs";
import { DeepReadonly } from "ts-essentials";

// import { RxMethod, SignalStoreFeatureResult, SignalStoreSlices } from "./ngrx-signals.model";
import { StateSignal } from "@ngrx/signals/src/state-signal";
import { RxMethod } from "@gergelyszerovay/fake-rx-method";
import { SignalStoreFeatureResult, SignalStoreSlices } from "@ngrx/signals/src/signal-store-models";
import { HttpRequestError, HttpRequestState, HttpRequestStates } from "./http-request-state.model";

function capitalize(str: string): string {
  return str.length > 1 ? str[0].toUpperCase() + str.substring(1) : str.toUpperCase();
}

function getWithDataServiceKeys(config: { actionName: string }) {
  const actionName = config.actionName;
  return {
    requestStateKey: `${actionName}RequestState`,
    inititalKey: `is${capitalize(actionName)}Initial`,
    fetchingKey: `is${capitalize(actionName)}Fetching`,
    fetchedKey: `is${capitalize(actionName)}Fetched`,
    errorKey: `get${capitalize(actionName)}Error`,
    fetchKey: actionName,
  };
}

type WithDataServiceSlice<Collection extends string> = {
  [K in Collection as `${K}RequestState`]: HttpRequestState;
};

type WithDataServiceSignals<ActionName extends string> =
  {
    [K in ActionName as `is${Capitalize<K>}Initial`]: Signal<boolean>;
  } & {
  [K in ActionName as `is${Capitalize<K>}Fetching`]: Signal<boolean>;
  } & {
    [K in ActionName as `is${Capitalize<K>}Fetched`]: Signal<boolean>;
  } & {
    [K in ActionName as `get${Capitalize<K>}Error`]: Signal<HttpRequestError | undefined>;
  };

type WithDataServiceMethods<ActionName extends string, RxParams> =
  {
    [K in ActionName as `${K}`]: RxMethod<RxParams>;
  }

// function setInitial<ActionName extends string>(
//   actionName: ActionName
// ): WithDataServiceSlice<ActionName> {
//   return { [`${actionName}RequestState`]: HttpRequestStates.INITIAL } as WithDataServiceSlice<ActionName>;
// }

export function withDataService<
  Input extends SignalStoreFeatureResult,
  ActionName extends string, RxParams = void>(options: {
    actionName: ActionName;
    service: (
      store: SignalStoreSlices<Input['state']> & Input['signals'] & Input['methods'] & StateSignal<{}>, rxParams: RxParams) =>
        Observable<Array<
        Partial<Input['state'] & {}> |
        PartialStateUpdater<Input['state']>
      >>,
    extractHttpErrorMessageFn?: (error: DeepReadonly<HttpErrorResponse>) => HttpRequestError
}): SignalStoreFeature<
  Input,
  {
    state: WithDataServiceSlice<ActionName>,
    signals: WithDataServiceSignals<ActionName>,
    methods: WithDataServiceMethods<ActionName, RxParams>
  }
> {
    const { requestStateKey, inititalKey, errorKey, fetchedKey, fetchingKey, fetchKey } =
  getWithDataServiceKeys(options);

  const { actionName, service } = options;
  const extractHttpErrorMessageFn = options.extractHttpErrorMessageFn ?? extractHttpErrorMessage;

  // @ts-ignore
  return signalStoreFeature(
    withState({ [requestStateKey]: HttpRequestStates.INITIAL }),
    withComputed((state: Record<string, Signal<unknown>>) => {
      const requestState = state[requestStateKey] as Signal<HttpRequestState>;

      return {
        [inititalKey]: computed(() => requestState() === HttpRequestStates.INITIAL),
        [fetchingKey]: computed(() => requestState() === HttpRequestStates.FETCHING),
        [fetchedKey]: computed(() => requestState() === HttpRequestStates.FETCHED),
        [errorKey]: computed(() => {
          const s = requestState();
          return typeof s === 'object' ? s : undefined;
        })
      }
    }),
    withMethods((store, injector = inject(Injector)) => {
      return {
          [fetchKey]: rxMethod<RxParams>(
            pipe(
              tap(() => patchState(store, setFetching(actionName))),
              // @ts-ignore
              switchMap((rxParams) => runInInjectionContext(injector, () => service(store, rxParams))),
              tapResponse(
                (response) => {
                  patchState(store, setFetched(actionName), ...response);
                },
                (errorResponse: HttpErrorResponse) => {
                  patchState(store, setError(actionName, extractHttpErrorMessageFn(errorResponse)));
                }
              )
            )
          )
      };
    })
  );
}

function setFetching<ActionName extends string>(
  actionName: ActionName
): WithDataServiceSlice<ActionName> {
  return { [`${actionName}RequestState`]: HttpRequestStates.FETCHING } as WithDataServiceSlice<ActionName>;
}

function setFetched<ActionName extends string>(
  actionName: ActionName
): WithDataServiceSlice<ActionName> {
  return { [`${actionName}RequestState`]: HttpRequestStates.FETCHED } as WithDataServiceSlice<ActionName>;
}

function setError<ActionName extends string>(
  actionName: ActionName, error: HttpRequestError
): WithDataServiceSlice<ActionName> {
  return { [`${actionName}RequestState`]: error } as WithDataServiceSlice<ActionName>;
}

/**
 * Extracts the error message from Angular's HttpErrorResponse.
 *
 * @param error The HttpErrorResponse to extract the message from.
 * @returns The extracted error message or a default message if none is found.
 */
export function extractHttpErrorMessage(
  error: DeepReadonly<HttpErrorResponse>
): HttpRequestError {
  // If the error has a user-friendly message, return it
  if (error.error?.message) {
    return { errorMessage: error.error.message, errorCode: 1 };
  }
  if (error.message) {
    return { errorMessage: error.message, errorCode: 1 };
  }

  // If all else fails, return a default error message
  return { errorMessage: 'Cannot connect to the server', errorCode: 1 };
}
