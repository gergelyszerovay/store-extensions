import { Provider, Signal, WritableSignal, isSignal, signal } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { BehaviorSubject, Observable, ReplaySubject, isObservable, tap } from "rxjs";
import sinon from "sinon";
import { SinonSpy } from "sinon";

// ReplaySubject vs BehaviorSubject
// partial selector mocking

export const FAKE = Symbol("FAKE");

export interface Constructor<ClassType> {
  new (...args: never[]): ClassType;
}

type Method<T extends readonly any[] = any[]> = (...args: T) => void;

type RxMethod<Input> = ReturnType<typeof rxMethod<Input>>;

type FakeRxMethod<T> = RxMethod<T> & { [FAKE]: SinonSpy<[T]> };

function newMockRxMethod(): FakeRxMethod<unknown> {
  const fake = sinon.fake<[unknown]>();
  const r = rxMethod(tap((x) => fake(x))) as FakeRxMethod<unknown>;
  r[FAKE] = fake;
  return r;
}

export type MockComponentStore<T> = {
  [K in keyof T]: T[K] extends Signal<infer V>
    ? WritableSignal<V>
    : T[K] extends Observable<infer R>
    ? ReplaySubject<R>
    : T[K] extends Method<infer U>
    ? FakeRxMethod<U>
    : T[K];
};

type InitialState<T> = T extends ComponentStore<infer U> ? Partial<U> : never;

// -? makes the key required, opposite of ?
export type SignalKeys<T> = {
  [K in keyof T]-?: T[K] extends Signal<unknown> ? K : never;
}[keyof T];

export type SelectorKeys<T> = {
  // We don't care about the actual type of Observable, we just need the key
  [K in keyof T]-?: T[K] extends Observable<unknown> ? K : never;
}[keyof T];

type UnwrapObservable<T> = T extends Observable<infer U> ? U : never;

type UnwrapSignal<T> = T extends Signal<infer U> ? U : never;

type ProvideMockComponentStoreParams<T> = {
  initialState?: InitialState<T>,
  selectorInitialValues?: {
    [K in SelectorKeys<T>]?: UnwrapSignal<T[K]>;
  } & {
    [K in SignalKeys<T>]?: UnwrapSignal<T[K]>;
  },
  mockComputedSignals?: boolean, // true by default
  mockMethods?: boolean, // true by default
  mockObservables?: boolean, // true by default
  debug?: boolean // false by default
}


export function provideMockComponentStore<ClassType extends ComponentStore<object>>(
  classConstructor: Constructor<ClassType>,
  params?: ProvideMockComponentStoreParams<ClassType>
): Provider {
  let cachedStore: ClassType | undefined = undefined;
  return {
    provide: classConstructor,
    useFactory: () => {
      // use the cached instance of the store to work around Angular
      // attaching created items to certain nodes.
      if (cachedStore) {
        return cachedStore as MockComponentStore<ClassType>;
      }
      const store = Reflect.construct(classConstructor, []);
      cachedStore = store;

      const keys = Object.keys(store) as Array<keyof ClassType>;

      const combinedSignals = keys.filter((k) => isSignal(store[k]));
      const observables = keys.filter((k) => isObservable(store[k]));
      const methods = keys.filter((k) => typeof(store[k]) === 'function' && !combinedSignals.includes(k) && !observables.includes(k));

      if (params?.debug === true) {
        // console.log(store, keys.forEach(k => console.log(k, typeof(store[k]))));
        console.log('combinedSignals', combinedSignals);
        console.log('observables', observables);
        console.log('methods', methods);
      }

      if (params?.mockComputedSignals !== false) {
        combinedSignals.forEach((k) => {
          // @ts-ignore
          if (isSignal(store[k])) {
            // @ts-ignore
            store[k] = signal(params?.selectorInitialValues?.[k]);
          }
        });
      }

      if (params?.mockObservables !== false) {
        observables.forEach(k => {
          // @ts-ignore
          if (params?.selectorInitialValues?.[k]) {
            // @ts-ignore
            store[k] = new BehaviorSubject(params?.selectorInitialValues?.[k]);
          }
          else {
            // @ts-ignore
            store[k] = new BehaviorSubject(undefined);
          }
        });
      }

      if (params?.mockMethods !== false) {
        methods.forEach(k => {
          // @ts-ignore
          store[k] = newMockRxMethod();
        });
      }

      if (params?.initialState) {
        store.setState(params.initialState);
      }

      if (params?.debug === true) {
        console.log('Mocked store:', store)
      }
      return store as MockComponentStore<ClassType>;;
    }
  }
}

export function asMockComponentStore<T>(s: T): MockComponentStore<T> {
  return s as MockComponentStore<T>;
}
