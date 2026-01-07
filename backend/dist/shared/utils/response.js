export function successResponse(data, meta) {
    return {
        success: true,
        data,
        ...(meta && { meta }),
    };
}
export function errorResponse(message, code, errors) {
    return {
        success: false,
        error: {
            message,
            ...(code && { code }),
            ...(errors && { errors }),
        },
    };
}
export function sendSuccess(res, data, statusCode = 200, meta) {
    res.status(statusCode).json(successResponse(data, meta));
}
export function sendError(res, message, statusCode = 500, code, errors) {
    res.status(statusCode).json(errorResponse(message, code, errors));
}
export function sendPaginated(res, data, page, limit, total) {
    res.status(200).json(successResponse(data, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    }));
}
//# sourceMappingURL=response.js.map