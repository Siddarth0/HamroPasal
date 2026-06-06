import { Response } from "express";

interface SuccessPayload<T> {
    success: true;
    message?: string;
    data?: T;
    meta?: object;
}

interface ErrorPayload {
    success: false;
    message: string;
    errors?: object;
}

export class ApiResponse {
    static success<T>(
        res: Response,
        data?: T,
        message = "Success",
        statusCode = 200
    ): void {
        const payload: SuccessPayload<T> = {success: true, message};
        if (data !== undefined) payload.data = data;
        res.status(statusCode).json(payload);
    }

    static created<T>(
        res: Response,
        data: T,
        message = "Created"
    ): void{
        ApiResponse.success(res, data, message, 201);
    }

    static pagination<T>(
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
    ): void {
        res.status(200).json({ success: true, message, data, meta});
    }

    static error(
        res: Response,
        message: string,
        statusCode = 400,
        errors?: object
    ): void {
        const payload: ErrorPayload = { success: false, message};
        if(errors) payload.errors = errors;
        res.status(statusCode).json(payload);
    }

    static notFound(
        res: Response,
        message = 'Not Found'
    ): void{
        ApiResponse.error(res, message, 404);
    }

    static unauthorized(
        res: Response,
        message = 'Unauthorized'
    ): void {
        ApiResponse.error(res, message, 401)
    }

    static forbidden(res: Response, message = 'Forbidden'): void {
        ApiResponse.error(res, message, 403);
    }
}