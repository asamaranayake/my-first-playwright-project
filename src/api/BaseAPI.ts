import { APIRequestContext, APIResponse } from '@playwright/test';

export type RequestHeaders = Record<string, string>;
export type QueryParams = Record<string, string | number | boolean>;

interface BaseRequestOptions {
  headers?: RequestHeaders;
  params?: QueryParams;
  data?: object;
}

/**
 * BaseAPI - Foundation class for all API helpers.
 * Similar to BasePage in POM, but for API interactions.
 *
 * Wraps Playwright's APIRequestContext with convenient methods.
 */
export class BaseAPI {
  constructor(
    protected request: APIRequestContext,
    private defaultHeaders: RequestHeaders = {}
  ) {}

  /**
   * Add or override headers used by all requests from this API helper.
   * Useful after login, when an auth token becomes available.
   */
  setDefaultHeaders(headers: RequestHeaders): void {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };
  }

  /**
   * Remove all helper-level default headers.
   */
  clearDefaultHeaders(): void {
    this.defaultHeaders = {};
  }

  private buildOptions(options: BaseRequestOptions = {}): BaseRequestOptions {
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    return {
      ...options,
      headers: Object.keys(headers).length ? headers : undefined,
    };
  }

  /**
   * Send a GET request
   * @param endpoint - API endpoint (relative to baseURL)
   * @param params - Optional query parameters
   * @param headers - Optional request headers
   */
  async get(
    endpoint: string,
    params?: QueryParams,
    headers?: RequestHeaders
  ): Promise<APIResponse> {
    return await this.request.get(endpoint, this.buildOptions({ params, headers }));
  }

  /**
   * Send a POST request with JSON body
   * @param endpoint - API endpoint
   * @param data - Request body object (auto-serialized to JSON)
   * @param headers - Optional request headers
   */
  async post(
    endpoint: string,
    data: object,
    headers?: RequestHeaders
  ): Promise<APIResponse> {
    return await this.request.post(endpoint, this.buildOptions({ data, headers }));
  }

  /**
   * Send a PUT request (full resource replacement)
   * @param endpoint - API endpoint
   * @param data - Complete resource data
   * @param headers - Optional request headers
   */
  async put(
    endpoint: string,
    data: object,
    headers?: RequestHeaders
  ): Promise<APIResponse> {
    return await this.request.put(endpoint, this.buildOptions({ data, headers }));
  }

  /**
   * Send a PATCH request (partial update)
   * @param endpoint - API endpoint
   * @param data - Partial resource data to update
   * @param headers - Optional request headers
   */
  async patch(
    endpoint: string,
    data: object,
    headers?: RequestHeaders
  ): Promise<APIResponse> {
    return await this.request.patch(endpoint, this.buildOptions({ data, headers }));
  }

  /**
   * Send a DELETE request
   * @param endpoint - API endpoint
   * @param headers - Optional request headers
   */
  async delete(endpoint: string, headers?: RequestHeaders): Promise<APIResponse> {
    return await this.request.delete(endpoint, this.buildOptions({ headers }));
  }

  /**
   * Parse response body as typed JSON
   * @param response - API response to parse
   * @returns Parsed JSON with type T
   */
  async getResponseBody<T>(response: APIResponse): Promise<T> {
    return (await response.json()) as T;
  }

  /**
   * Send a request with custom headers
   * @param method - HTTP method
   * @param endpoint - API endpoint
   * @param options - Request options including headers, data, params
   */
  async requestWithHeaders(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    options: {
      headers?: Record<string, string>;
      data?: object;
      params?: QueryParams;
    }
  ): Promise<APIResponse> {
    const requestOptions = this.buildOptions(options);

    switch (method) {
      case 'GET':
        return await this.request.get(endpoint, requestOptions);
      case 'POST':
        return await this.request.post(endpoint, requestOptions);
      case 'PUT':
        return await this.request.put(endpoint, requestOptions);
      case 'PATCH':
        return await this.request.patch(endpoint, requestOptions);
      case 'DELETE':
        return await this.request.delete(endpoint, requestOptions);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }
}
