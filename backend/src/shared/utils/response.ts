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

export function successResponse<T>(data: T, meta?: ApiResponse['meta']): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

export function errorResponse(
  message: string,
  code?: string,
  errors?: Record<string, string[]>
): ApiResponse {
  return {
    success: false,
    error: {
      message,
      ...(code && { code }),
      ...(errors && { errors }),
    },
  };
}

export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200, meta?: ApiResponse['meta']): void {
  res.status(statusCode).json(successResponse(data, meta));
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  code?: string,
  errors?: Record<string, string[]>
): void {
  res.status(statusCode).json(errorResponse(message, code, errors));
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number
): void {
  res.status(200).json(
    successResponse(data, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  );
}
