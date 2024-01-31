import { HttpErrorResponse } from "@angular/common/http";
import { Injector, Signal, computed, inject, runInInjectionContext } from "@angular/core";
import { tapResponse } from "@ngrx/component-store";
import { SignalStoreFeature, patchState, signalStoreFeature, withComputed, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
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

export type WithDataServiceMethods<Prefix extends string, RxParams> =
  {
    [K in Prefix as `${K}`]: (param: RxParams | Observable<RxParams>) => void;
  }

export function setEmpty<Prefix extends string>(
  prefix: Prefix
): WithDataServiceSlice<Prefix> {
  return { [`${prefix}RequestState`]: HttpRequestStates.EMPTY } as WithDataServiceSlice<Prefix>;
}

export function withDataService<
  Input extends SignalStoreFeatureResult,
  Prefix extends string, RxParams = void>(options: {
  prefix: Prefix;
  service$: (store: SignalStoreSlices<Input['state']> & Input['signals'] & Input['methods'], rxParams: RxParams) => Observable<Partial<Input['state']>>;
}): SignalStoreFeature<
  Input,
  {
    state: WithDataServiceSlice<Prefix>,
    signals: WithDataServiceSignals<Prefix>,
    methods: WithDataServiceMethods<Prefix, RxParams>
  }
> {
    const { requestStateKey, emptyKey, errorKey, fetchedKey, fetchingKey, fetchKey } =
  getWithDataServiceKeys(options);

  const { prefix, service$ } = options;

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
    withMethods((store, injector = inject(Injector)) => {
      return {
          [fetchKey]: rxMethod<RxParams>(
            pipe(
              tap(() => patchState(store, setFetching(prefix))),
              // @ts-ignore
              switchMap((rxParams) => runInInjectionContext(injector, () => service$(store, rxParams))),
              tapResponse(
                (response) => {
                  patchState(store, setFetched(prefix), response);
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

// ---
// https://github.com/ngrx/platform/blob/main/modules/signals/src/ts-helpers.ts

type Prettify<T> = { [K in keyof T]: T[K] } & {};

type IsRecord<T> = T extends object
  ? T extends unknown[]
    ? false
    : T extends Set<unknown>
    ? false
    : T extends Map<unknown, unknown>
    ? false
    : T extends Function
    ? false
    : true
  : false;

type IsUnknownRecord<T> = string extends keyof T
  ? true
  : number extends keyof T
  ? true
  : false;

type IsKnownRecord<T> = IsRecord<T> extends true
  ? IsUnknownRecord<T> extends true
    ? false
    : true
  : false;

// ---
// https://github.com/ngrx/platform/blob/main/modules/signals/src/deep-signal.ts

type DeepSignal<T> = Signal<T> &
  (IsKnownRecord<T> extends true
    ? Readonly<{
        [K in keyof T]: IsKnownRecord<T[K]> extends true
          ? DeepSignal<T[K]>
          : Signal<T[K]>;
      }>
    : unknown);

// ---
// https://github.com/ngrx/platform/blob/main/modules/signals/src/signal-store-models.ts

type SignalsDictionary = Record<string, Signal<unknown>>;

type MethodsDictionary = Record<string, (...args: any[]) => unknown>;

type SignalStoreFeatureResult = {
  state: object;
  signals: SignalsDictionary;
  methods: MethodsDictionary;
};

type SignalStoreSlices<State> = IsKnownRecord<
Prettify<State>
> extends true
? {
    [Key in keyof State]: IsKnownRecord<State[Key]> extends true
      ? DeepSignal<State[Key]>
      : Signal<State[Key]>;
  }
: {};
