import type { Response } from 'express';
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        errors?: Record<string, string[]>;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}
export declare function successResponse<T>(data: T, meta?: ApiResponse['meta']): ApiResponse<T>;
export declare function errorResponse(message: string, code?: string, errors?: Record<string, string[]>): ApiResponse;
export declare function sendSuccess<T>(res: Response, data: T, statusCode?: number, meta?: ApiResponse['meta']): void;
export declare function sendError(res: Response, message: string, statusCode?: number, code?: string, errors?: Record<string, string[]>): void;
export declare function sendPaginated<T>(res: Response, data: T[], page: number, limit: number, total: number): void;
//# sourceMappingURL=response.d.ts.map