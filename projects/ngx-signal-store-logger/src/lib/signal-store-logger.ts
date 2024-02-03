import { EffectRef, Signal, effect, isSignal } from '@angular/core';
import { getState } from '@ngrx/signals';
import { STATE_SIGNAL, StateSignal } from '@ngrx/signals/src/state-signal';
import { getDiff } from 'recursive-diff';

declare const ngDevMode: boolean;

declare const beforeEach: unknown;
declare const afterEach: unknown;
declare const describe: unknown;

const ngTestMode =
  (typeof(beforeEach) === 'function') &&
  (typeof(afterEach) === 'function') &&
  (typeof(describe) === 'function');

let storeId = 0;

export type DebugToolLogLevel = 'log' | 'info' | 'debug' | 'trace' | 'off' | undefined;

interface LoggerParams {
  logLevel?: DebugToolLogLevel;
  freeze?: boolean;
}

export function LogSignal(
  groupMessage: string,
  s: Signal<unknown> | (() => object),
  logLevel: DebugToolLogLevel = 'log'):
  EffectRef | undefined {
  if (ngDevMode && !ngTestMode) {
    if (!logLevel || logLevel === 'off' || ngTestMode) {
      return undefined;
    }

    const logFn = console[logLevel];

    let lastState = s();

    console.group(groupMessage + ' INITIAL');
    logFn(lastState);
    console.groupEnd();

    return effect(() => {
      const state = s();

      if (state === lastState) {
        return;
      }

      const stateClone = structuredClone(state);

      const diff = getDiff(lastState, state);
      const o: Record<string, string> = Object.fromEntries(
        diff.filter(diffResult => diffResult.path).map(diffResult =>
          [diffResult.op.toUpperCase() + ': ' + diffResult.path.join('.'), diffResult.val]
        )
      );

      console.group(groupMessage);
      logFn(stateClone);
      if (Object.keys(o).length) {
        logFn(o);
      }
      console.groupEnd();

      lastState = stateClone;
    });
  }
  else {
    return undefined;
  }
}

export function LogSignalStoreState<T extends object>(
  message: string,
  store: object,
  logLevel: DebugToolLogLevel = 'log'): EffectRef | undefined {
  storeId ++;
  const storeIdString = message + '[' +  ("#000" + storeId).slice(-4) + ']';
  if (ngDevMode && !ngTestMode) {
    if (!(!logLevel || logLevel === 'off')) {
      // @ts-ignore
      return LogSignal(`${storeIdString}.state$`, () => getState(store), logLevel);
    }
  }
  return undefined;
}
