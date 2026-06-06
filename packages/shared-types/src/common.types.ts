/**
 * Shared wire-format contracts used by every app.
 *
 * Note on types: these describe the JSON sent over the wire, so dates are ISO
 * `string`s and money fields are `number` (the Prisma schema uses `Float`, which
 * serializes to a plain JSON number).
 */

/** Mirrors `ApiResponse.success` / `ApiResponse.created`. */
export interface ApiSuccess<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

/** Mirrors `ApiResponse.error` and the global error handler envelope. */
export interface ApiFailure {
  success: false;
  message: string;
}

export type ApiResult<T = unknown> = ApiSuccess<T> | ApiFailure;

/** Mirrors the `meta` block from `ApiResponse.paginated`. */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

/** Common offset-pagination query params. */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}
