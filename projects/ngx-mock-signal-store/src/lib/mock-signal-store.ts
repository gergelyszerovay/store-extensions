import { Provider, ProviderToken, Signal, WritableSignal, isSignal, untracked, signal } from "@angular/core";
import { getState, patchState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { StateSignal } from "@ngrx/signals/src/state-signal";
import { tap } from "rxjs";
import sinon from "sinon";
import { SinonSpy } from "sinon";

export interface Constructor<ClassType> {
  new (...args: never[]): ClassType;
}

type RxMethod<Input> = ReturnType<typeof rxMethod<Input>>;

type Method<T extends readonly any[] = any[]> = (...args: T) => void;

export const FAKE = Symbol("FAKE");

type FakeRxMethod<T> = RxMethod<T> & { [FAKE]: SinonSpy<[T]> };

function newMockRxMethod(): FakeRxMethod<unknown> {
  const fake = sinon.fake<[unknown]>();
  const r = rxMethod(tap((x) => fake(x))) as FakeRxMethod<unknown>;
  r[FAKE] = fake;
  return r;
}

export type MockSignalStore<T> = {
  [K in keyof T]: T[K] extends Signal<infer V>
    ? WritableSignal<V>
    : T[K] extends RxMethod<infer R>
    ? FakeRxMethod<R>
    : T[K] extends Method<infer U>
    ? SinonSpy<U>
    : T[K];
};

type InitialState<T> = T extends StateSignal<infer U> ? Partial<U> : never;

// -? makes the key required, opposite of ?
export type SignalKeys<T> = {
  [K in keyof T]-?: T[K] extends Signal<unknown> ? K : never;
}[keyof T];

type UnwrapSignal<T> = T extends Signal<infer U> ? U : never;

export type UnwrapSignalStoreProvider<T> = T extends ProviderToken<infer U> ? U : never;

type ProvideMockSignalStoreParams<T> = {
  initialStatePatch?: InitialState<T>,
  initialComputedValues?: Omit<{
    [K in SignalKeys<T>]?: UnwrapSignal<T[K]>;
  }, keyof InitialState<T>>,
  mockComputedSignals?: boolean | 'initialComputedValues', // true by default
  mockMethods?: boolean, // true by default
  mockRxMethods?: boolean, // true by default
  debug?: boolean // false by default
}

export function provideMockSignalStore<ClassType extends StateSignal<object>>(
  classConstructor: Constructor<ClassType>,
  params?: ProvideMockSignalStoreParams<ClassType>
): Provider {
  let cachedStore: ClassType | undefined = undefined;
  return {
    provide: classConstructor,
    useFactory: () => {
      // use the cached instance of the store to work around Angular
      // attaching created items to certain nodes.
      if (cachedStore) {
        return cachedStore as MockSignalStore<ClassType>;
      }
      const store = Reflect.construct(classConstructor, []);
      cachedStore = store;

      const keys = Object.keys(store) as Array<keyof ClassType>;

      const pluckerSignals = keys.filter((k) => isSignal(store[k]) && k in getState(store));
      const combinedSignals = keys.filter((k) => isSignal(store[k]) && !pluckerSignals.includes(k));
      const rxMethods = keys.filter((k) => typeof(store[k]) === 'function' && !isSignal(store[k]) && 'unsubscribe' in (store[k] as object));
      const methods = keys.filter((k) => typeof(store[k]) === 'function' && !isSignal(store[k]) && !rxMethods.includes(k));

      if (params?.debug === true) {
        console.log('pluckerSignals', pluckerSignals);
        console.log('combinedSignals', combinedSignals);
        console.log('rxMethods', rxMethods);
        console.log('methods', methods);
      }

      if (params?.mockComputedSignals !== false) {
        if (params?.mockComputedSignals === 'initialComputedValues') {
          if (typeof(params?.initialComputedValues) === 'object') {
            Object.keys(params?.initialComputedValues).forEach((k) => {
              if (!(combinedSignals as Array<string>).includes(k)) {
                throw new Error(`${String(k)} should be a computed signal`);
              }
              // @ts-ignore
              store[k] = signal(params?.initialComputedValues?.[k]);
            });
          }
          else {
            throw new Error('initialComputedValues should be set');
          }
        }
        else {
          combinedSignals.forEach((k) => {
            if (params?.initialComputedValues && k in params?.initialComputedValues) {
              // @ts-ignore
              store[k] = signal(params?.initialComputedValues?.[k]);
            }
            else {
              throw new Error(`${String(k)} should have an initial value`);
            }
          });
        }
      }

      if (params?.mockMethods !== false) {
        methods.forEach(k => {
          // @ts-ignore
          store[k] = sinon.fake();
        });
      }

      if (params?.mockRxMethods !== false) {
        rxMethods.forEach(k => {
          // @ts-ignore
          store[k] = newMockRxMethod();
        });
      }

      if (params?.initialStatePatch) {
        untracked(() => {
          patchState(store, s => ({...s, ...params.initialStatePatch }));
        });
      }

      if (params?.debug === true) {
        console.log('Mocked store:', store)
      }

      return store as MockSignalStore<ClassType>;;
    }
  };
}

export function asMockSignalStore<T>(s: T): MockSignalStore<T> {
  return s as MockSignalStore<T>;
}
