import { HttpErrorResponse } from "@angular/common/http";
import { Injector, Signal, computed, inject, runInInjectionContext } from "@angular/core";
import { tapResponse } from "@ngrx/component-store";
import { SignalStoreFeature, patchState, signalStoreFeature, withComputed, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { StateSignal } from "@ngrx/signals/src/state-signal";
import { Observable, pipe, switchMap, tap } from "rxjs";

export enum HttpRequestStates {
  EMPTY = 'EMPTY',
  FETCHING = 'FETCHING',
  FETCHED ='FETCHED'
}

export type HttpRequestState =
  HttpRequestStates |
  { readonly errorMessage: string };

export function getHttpRequestStateError(httpRequestState: HttpRequestState): string | undefined {
  return (typeof(httpRequestState) === 'object' && httpRequestState?.errorMessage) || undefined;
}

// ---

export function capitalize(str: string): string {
  return str.length > 1 ? str[0].toUpperCase() + str.substring(1) : str.toUpperCase();
}

export function getWithDataServiceKeys(config: { prefix: string }) {
  const prefix = config.prefix;
  return {
    requestStateKey: `${prefix}RequestState`,
    emptyKey: `is${capitalize(prefix)}Empty`,
    fetchingKey: `is${capitalize(prefix)}Fetching`,
    fetchedKey: `is${capitalize(prefix)}Fetched`,
    errorKey: `has${capitalize(prefix)}Error`,
    fetchKey: prefix,
  };
}

export type WithDataServiceSlice<Collection extends string> = {
  [K in Collection as `${K}RequestState`]: HttpRequestState;
};

export type WithDataServiceSignals<Prefix extends string> =
  {
    [K in Prefix as `is${Capitalize<K>}Empty`]: Signal<boolean>;
  } & {
  [K in Prefix as `is${Capitalize<K>}Fetching`]: Signal<boolean>;
  } & {
    [K in Prefix as `is${Capitalize<K>}Fetched`]: Signal<boolean>;
  } & {
    [K in Prefix as `has${Capitalize<K>}Error`]: Signal<string | undefined>;
  };

export type WithDataServiceMethods<Prefix extends string> =
  {
    [K in Prefix as `${K}`]: (param: any) => void;
  }

export function setEmpty<Prefix extends string>(
  prefix: Prefix
): WithDataServiceSlice<Prefix> {
  return { [`${prefix}RequestState`]: HttpRequestStates.EMPTY } as WithDataServiceSlice<Prefix>;
}

export function withDataService<Prefix extends string, RxParams, Response, State extends object>(options: {
  prefix: Prefix;
  service$: (params: RxParams) => Observable<Response>;
  transformResponseFn: (response: Response) => any, //Partial<State>
}): SignalStoreFeature<
  { state: State, signals: {}, methods: {} },
  {
    state: WithDataServiceSlice<Prefix>,
    signals: WithDataServiceSignals<Prefix>,
    methods: WithDataServiceMethods<Prefix>
  }
> {
    const { requestStateKey, emptyKey, errorKey, fetchedKey, fetchingKey, fetchKey } =
  getWithDataServiceKeys(options);

  const { prefix, service$, transformResponseFn } = options;

  // @ts-ignore
  return signalStoreFeature(
    withState({ [requestStateKey]: HttpRequestStates.EMPTY }),
    withComputed((state: Record<string, Signal<unknown>>) => {
      const requestState = state[requestStateKey] as Signal<HttpRequestState>;

      return {
        [emptyKey]: computed(() => requestState() === HttpRequestStates.EMPTY),
        [fetchingKey]: computed(() => requestState() === HttpRequestStates.FETCHING),
        [fetchedKey]: computed(() => requestState() === HttpRequestStates.FETCHED),
        [errorKey]: computed(() => {
          const s = requestState();
          return typeof s === 'object' && s.errorMessage ? s.errorMessage : undefined;
        })
      }
    }),
    withMethods((store: Record<string, unknown> & StateSignal<object>, injector = inject(Injector)) => {
      return {
          [fetchKey]: rxMethod<RxParams>(
            pipe(
              tap(() => patchState(store, setFetching(prefix))),
              switchMap((params) => runInInjectionContext(injector, () => service$(params))),
              tapResponse(
                (response) => {
                  patchState(store, setFetched(prefix), transformResponseFn(response));
                },
                (errorResponse: HttpErrorResponse) => {
                  setError(prefix, 'Request error');
                }
              )
            )
          )
      };
    })
  );
}

export function setFetching<Prefix extends string>(
  prefix: Prefix
): WithDataServiceSlice<Prefix> {
  return { [`${prefix}RequestState`]: HttpRequestStates.FETCHING } as WithDataServiceSlice<Prefix>;
}

export function setFetched<Prefix extends string>(
  prefix: Prefix
): WithDataServiceSlice<Prefix> {
  return { [`${prefix}RequestState`]: HttpRequestStates.FETCHED } as WithDataServiceSlice<Prefix>;
}

export function setError<Prefix extends string>(
  prefix: Prefix, errorMessage: string
): WithDataServiceSlice<Prefix> {
  return { [`${prefix}RequestState`]: { errorMessage } } as WithDataServiceSlice<Prefix>;
}
