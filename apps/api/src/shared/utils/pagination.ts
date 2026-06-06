import type { PaginationMeta } from 'shared-types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface Pagination {
  page: number;
  limit: number;
  /** Rows to skip — feed to Prisma `skip` / Mongoose `.skip()`. */
  skip: number;
  /** Rows to take — feed to Prisma `take` / Mongoose `.limit()`. */
  take: number;
}

/**
 * Parses `page`/`limit` from a raw query object into safe, clamped values.
 * Invalid/negative input falls back to defaults; `limit` is capped at `maxLimit`.
 */
export const getPagination = (
  query: { page?: unknown; limit?: unknown },
  opts: { defaultLimit?: number; maxLimit?: number } = {},
): Pagination => {
  const maxLimit = opts.maxLimit ?? MAX_LIMIT;

  const pageNum = Number(query.page);
  const page = Number.isFinite(pageNum) && pageNum >= 1 ? Math.floor(pageNum) : DEFAULT_PAGE;

  const limitNum = Number(query.limit);
  const rawLimit =
    Number.isFinite(limitNum) && limitNum >= 1
      ? Math.floor(limitNum)
      : opts.defaultLimit ?? DEFAULT_LIMIT;
  const limit = Math.min(rawLimit, maxLimit);

  return { page, limit, skip: (page - 1) * limit, take: limit };
};

/** Builds the meta block consumed by `ApiResponse.paginated`. */
export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number,
): PaginationMeta => {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
