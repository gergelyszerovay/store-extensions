/*
 * Public API Surface of ngx-signal-store-data-service-feature
 */

export {
  HttpRequestStates, HttpRequestError, HttpRequestState,
} from './lib/http-request-state.model';

export {
  withDataService,
  extractHttpErrorMessage
} from './lib/with-data-service.feature';
