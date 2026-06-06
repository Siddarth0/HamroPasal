import { Response } from "express";

export class ApiResponse {
  static success = <T>(
    res: Response,
    data?: T,
    message = "Success",
    statusCode = 200
  ): void => {
    const payload: Record<string, unknown> = { success: true, message };
    if (data !== undefined) payload.data = data;
    res.status(statusCode).json(payload);
  };

  static created = <T>(res: Response, data: T, message = "Created"): void => {
    ApiResponse.success(res, data, message, 201);
  };

  static paginated = <T>(
    res: Response,
    data: T[],
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    },
    message = "Success"
  ): void => {
    res.status(200).json({ success: true, message, data, meta });
  };

  static error = (res: Response, message: string, statusCode = 400): void => {
    res.status(statusCode).json({ success: false, message });
  };
}