import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * BaseAPI - Foundation class for all API helpers.
 * Similar to BasePage in POM, but for API interactions.
 *
 * Wraps Playwright's APIRequestContext with convenient methods.
 */
export class BaseAPI {
  constructor(protected request: APIRequestContext) {}

  /**
   * Send a GET request
   * @param endpoint - API endpoint (relative to baseURL)
   * @param params - Optional query parameters
   */
  async get(
    endpoint: string,
    params?: Record<string, string | number>
  ): Promise<APIResponse> {
    return await this.request.get(endpoint, { params });
  }

  /**
   * Send a POST request with JSON body
   * @param endpoint - API endpoint
   * @param data - Request body object (auto-serialized to JSON)
   */
  async post(endpoint: string, data: object): Promise<APIResponse> {
    return await this.request.post(endpoint, { data });
  }

  /**
   * Send a PUT request (full resource replacement)
   * @param endpoint - API endpoint
   * @param data - Complete resource data
   */
  async put(endpoint: string, data: object): Promise<APIResponse> {
    return await this.request.put(endpoint, { data });
  }

  /**
   * Send a PATCH request (partial update)
   * @param endpoint - API endpoint
   * @param data - Partial resource data to update
   */
  async patch(endpoint: string, data: object): Promise<APIResponse> {
    return await this.request.patch(endpoint, { data });
  }

  /**
   * Send a DELETE request
   * @param endpoint - API endpoint
   */
  async delete(endpoint: string): Promise<APIResponse> {
    return await this.request.delete(endpoint);
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
      params?: Record<string, string | number>;
    }
  ): Promise<APIResponse> {
    const requestOptions: any = {};

    if (options.headers) requestOptions.headers = options.headers;
    if (options.data) requestOptions.data = options.data;
    if (options.params) requestOptions.params = options.params;

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
        return await this.request.delete(endpoint);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }
}
