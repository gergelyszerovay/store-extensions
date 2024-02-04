// import { Signal } from "@angular/core";
// import { Observable, Unsubscribable } from "rxjs";

// // Source: https://github.com/ngrx/platform/blob/main/modules/signals/src/ts-helpers.ts

// type Prettify<T> = { [K in keyof T]: T[K] } & {};

// type IsRecord<T> = T extends object
//   ? T extends unknown[]
//     ? false
//     : T extends Set<unknown>
//     ? false
//     : T extends Map<unknown, unknown>
//     ? false
//     : T extends Function
//     ? false
//     : true
//   : false;

// type IsUnknownRecord<T> = string extends keyof T
//   ? true
//   : number extends keyof T
//   ? true
//   : false;

// type IsKnownRecord<T> = IsRecord<T> extends true
//   ? IsUnknownRecord<T> extends true
//     ? false
//     : true
//   : false;

// // Source: https://github.com/ngrx/platform/blob/main/modules/signals/src/deep-signal.ts

// type DeepSignal<T> = Signal<T> &
//   (IsKnownRecord<T> extends true
//     ? Readonly<{
//         [K in keyof T]: IsKnownRecord<T[K]> extends true
//           ? DeepSignal<T[K]>
//           : Signal<T[K]>;
//       }>
//     : unknown);

// // Source: https://github.com/ngrx/platform/blob/main/modules/signals/src/signal-store-models.ts

// type SignalsDictionary = Record<string, Signal<unknown>>;

// type MethodsDictionary = Record<string, (...args: any[]) => unknown>;

// export type SignalStoreFeatureResult = {
//   state: object;
//   signals: SignalsDictionary;
//   methods: MethodsDictionary;
// };

// export type SignalStoreSlices<State> = IsKnownRecord<
// Prettify<State>
// > extends true
// ? {
//     [Key in keyof State]: IsKnownRecord<State[Key]> extends true
//       ? DeepSignal<State[Key]>
//       : Signal<State[Key]>;
//   }
// : {};


// /**
//  * Type of an rxMethod, @ngrx/signals/rxjs-interop doesn't export it.
// */
// type RxMethodInput<Input> = Input | Observable<Input> | Signal<Input>;
// export type RxMethod<Input> = ((input: RxMethodInput<Input>) => Unsubscribable) & Unsubscribable;
