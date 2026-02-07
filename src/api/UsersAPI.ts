import { BaseAPI } from './BaseAPI';

// ──────────────────────────────────────────────
// TypeScript Interfaces for API Data Types
// ──────────────────────────────────────────────

/** Payload for creating or updating a user */
export interface UserPayload {
  name: string;
  job: string;
}

/** Response from POST /api/users (create) */
export interface CreateUserResponse {
  name: string;
  job: string;
  id: string;
  createdAt: string;
}

/** Response from PUT/PATCH /api/users/:id (update) */
export interface UpdateUserResponse {
  name?: string;
  job?: string;
  updatedAt: string;
}

/** Single user data from GET /api/users/:id */
export interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

/** Response wrapper for single user */
export interface SingleUserResponse {
  data: UserData;
  support: {
    url: string;
    text: string;
  };
}

/** Response wrapper for user list */
export interface UserListResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: UserData[];
  support: {
    url: string;
    text: string;
  };
}

/** Login response */
export interface LoginResponse {
  token: string;
}

/** Error response */
export interface ErrorResponse {
  error: string;
}

// ──────────────────────────────────────────────
// UsersAPI Class - Domain-Specific API Methods
// ──────────────────────────────────────────────

/**
 * UsersAPI - API helper for the Users resource.
 *
 * This is the API equivalent of a Page Object class.
 * Instead of wrapping page interactions, it wraps API calls.
 *
 * Pattern: BasePage → LoginPage, InventoryPage (UI)
 *          BaseAPI  → UsersAPI, AuthAPI      (API)
 */
export class UsersAPI extends BaseAPI {
  private basePath = '/api/users';

  // ──────────────── READ Operations ────────────────

  /**
   * Get a paginated list of users
   * GET /api/users?page={page}
   */
  async getUsers(page: number = 1) {
    return await this.get(this.basePath, { page });
  }

  /**
   * Get a single user by ID
   * GET /api/users/{id}
   */
  async getUserById(id: number) {
    return await this.get(`${this.basePath}/${id}`);
  }

  // ──────────────── CREATE Operations ────────────────

  /**
   * Create a new user
   * POST /api/users
   */
  async createUser(payload: UserPayload) {
    return await this.post(this.basePath, payload);
  }

  // ──────────────── UPDATE Operations ────────────────

  /**
   * Fully update a user (all fields required)
   * PUT /api/users/{id}
   */
  async updateUser(id: number, payload: UserPayload) {
    return await this.put(`${this.basePath}/${id}`, payload);
  }

  /**
   * Partially update a user (only changed fields)
   * PATCH /api/users/{id}
   */
  async patchUser(id: number, payload: Partial<UserPayload>) {
    return await this.patch(`${this.basePath}/${id}`, payload);
  }

  // ──────────────── DELETE Operations ────────────────

  /**
   * Delete a user
   * DELETE /api/users/{id}
   */
  async deleteUser(id: number) {
    return await this.delete(`${this.basePath}/${id}`);
  }

  // ──────────────── AUTH Operations ────────────────

  /**
   * Login to get auth token
   * POST /api/login
   */
  async login(email: string, password: string) {
    return await this.post('/api/login', { email, password });
  }

  /**
   * Register a new account
   * POST /api/register
   */
  async register(email: string, password: string) {
    return await this.post('/api/register', { email, password });
  }

  // ──────────────── Helper Methods ────────────────

  /**
   * Get user list and parse response
   * Convenience method that combines request + parsing
   */
  async getUserList(page: number = 1): Promise<UserListResponse> {
    const response = await this.getUsers(page);
    return await this.getResponseBody<UserListResponse>(response);
  }

  /**
   * Get single user and parse response
   */
  async getUser(id: number): Promise<SingleUserResponse> {
    const response = await this.getUserById(id);
    return await this.getResponseBody<SingleUserResponse>(response);
  }
}
