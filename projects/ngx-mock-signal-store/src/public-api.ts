/*
 * Public API Surface of ngx-mock-signal-store
 */

export {
  MockSignalStore, ProvideMockSignalStoreParams,
  provideMockSignalStore,
  UnwrapProvider,
  asMockSignalStore, asSinonSpy
} from './lib/mock-signal-store';

export {
  RxMethod, FakeRxMethod, FAKE_RX_SS,
  newMockRxMethod,
  asFakeRxMethod, getRxMethodFake } from './lib/fake-rx-method';
