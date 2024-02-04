import { Provider, ProviderToken, Signal, WritableSignal, isSignal, untracked, signal } from "@angular/core";
import { getState, patchState } from "@ngrx/signals";
import { StateSignal } from "@ngrx/signals/src/state-signal";
import { SinonSpy, fake } from "sinon";
import { FakeRxMethod, RxMethod, newMockRxMethod } from "@gergelyszerovay/fake-rx-method";

/**
 * Constructor type.
*/
interface Constructor<ClassType> {
  new (...args: never[]): ClassType;
}

/**
 * Function type.
*/
type Method<T extends readonly any[] = any[]> = (...args: T) => unknown;

/**
 * Type for a mocked singalStore:
 *
 * - Signals are replaced by WritableSignals.
 * - RxMethods are replaced by FakeRxMethods.
 * - functions are replaced by Sinon mocks.
*/
export type MockSignalStore<T> = {
  [K in keyof T]: T[K] extends Signal<infer V>
    ? WritableSignal<V>
    : T[K] extends RxMethod<infer R>
    ? FakeRxMethod<R>
    : T[K] extends Method<infer U>
    ? SinonSpy<U>
    : T[K];
};

/**
 * Type for the state of the singlaStore.
 */
type InitialState<T> = T extends StateSignal<infer U> ? U : never;

/**
 * Given a type T, determines the keys of the signal properties.
 */
type SignalKeys<T> = {
  // -? makes the key required, opposite of ?
  [K in keyof T]-?: T[K] extends Signal<unknown> ? K : never;
}[keyof T];

/**
 * Type to extract the wrapped type from a Signal type.
 *
 * @template T - The original Signal type.
 * @returns The unwrapped type if T is a Signal, otherwise, 'never'.
 */
type UnwrapSignal<T> = T extends Signal<infer U> ? U : never;

/**
 * Parameters for providing a mock signal store.
 *
 * @template T The type of the original signal store.
 * @param initialStatePatch A partial initial state to override the original initial state.
 * @param initialComputedValues Initial values for computed signals.
 * @param mockComputedSignals Flag to mock computed signals (default is true).
 * @param mockMethods Flag to mock methods (default is true).
 * @param mockRxMethods Flag to mock RxMethods (default is true).
 * @param debug Flag to enable debug mode (default is false).
 */
export type ProvideMockSignalStoreParams<T> = {
  initialStatePatch?: Partial<InitialState<T>>,
  initialComputedValues?: Omit<{
    [K in SignalKeys<T>]?: UnwrapSignal<T[K]>;
  }, keyof InitialState<T>>,
  mockComputedSignals?: boolean, // true by default
  mockMethods?: boolean, // true by default
  mockRxMethods?: boolean, // true by default
  debug?: boolean // false by default
}

/**
 * Provides a mock version of signal store.
 *
 * @template ClassType The class type that extends StateSignal<object>.
 * @param classConstructor The constructor function for the class.
 * @param params Optional parameters for providing the mock signal store.
 * @returns The provider for the mock signal store.
 *
 * Usage:
 *
 * ```typescript
 * // component:
 *
 * export const ArticleListSignalStore = signalStore(...);
 *
 * @Component(...)
 * export class ArticleListComponent_SS {
 *   readonly store = inject(ArticleListSignalStore);
 *   // ...
 * }
 *
 * // test:
 *
 * let store: UnwrapProvider<typeof ArticleListSignalStore>;
 * let mockStore: MockSignalStore<typeof store>;
 *
 * await TestBed.configureTestingModule({
 *   imports: [
 *     ArticleListComponent_SS,
 *     MockComponent(UiArticleListComponent)
 *   ]
 * })
 * .overrideComponent(
 *   ArticleListComponent_SS,
 *   {
 *     set: {
 *       providers: [
 *         MockProvider(ArticlesService), // injected in ArticleListSignalStore
 *         provideMockSignalStore(ArticleListSignalStore, {
 *           initialComputedValues: {
 *             totalPages: 0,
 *             pagination: { selectedPage: 0, totalPages: 0 }
 *           }
 *         })
 *       ]
 *     }
 *   }
 * )
 * .compileComponents();
 *
 * store = component.store;
 * mockStore = asMockSignalStore(store);
 *
 * ```
 */

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

      if (params?.mockMethods !== false) {
        methods.forEach(k => {
          // @ts-ignore
          store[k] = fake();
        });
      }

      if (params?.mockRxMethods !== false) {
        rxMethods.forEach(k => {
          // @ts-ignore
          store[k] = newMockRxMethod<unknown>();
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

/**
 * Type to extract the type of a signal store.
 *
 * The signalStore() function returns a provider for the generated signal store.
 */
export type UnwrapProvider<T> = (T) extends ProviderToken<infer U> ? U : never;

export function asMockSignalStore<T>(s: T): MockSignalStore<T> {
  return s as MockSignalStore<T>;
}

export function asSinonSpy<TArgs extends readonly any[] = any[], TReturnValue = any>(
  fn: (...x: TArgs) => TReturnValue): SinonSpy<TArgs, TReturnValue> {
  return fn as unknown as SinonSpy<TArgs, TReturnValue>;
}