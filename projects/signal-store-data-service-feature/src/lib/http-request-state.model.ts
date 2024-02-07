
export enum HttpRequestStates {
  /**
   * State when no request has been made.
   */
  INITIAL = 'INITIAL',
  /**
   * State when a request is started, and we're waiting for the server's response.
   */
  FETCHING = 'FETCHING',
  /**
   * State when a request has been successfully fetched.
   */
  FETCHED ='FETCHED'
}

/**
 * Represents an HTTP request error.
 */
export type HttpRequestError = {
  /**
   * A message describing the error.
   */
  readonly errorMessage: string,
  /**
   * An optional error code.
   */
  readonly errorCode?: number
  /**
   * Optional custom error related data
   */
  readonly errorData?: unknown;
}

/**
 * Represents the state of an HTTP request, which can be one of the defined states
 * in the HttpRequestStates enum, or an HttpRequestError error object if the request fails.
 */
export type HttpRequestState = HttpRequestStates | HttpRequestError;
