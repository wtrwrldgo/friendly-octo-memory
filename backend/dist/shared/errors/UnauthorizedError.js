import { AppError } from './AppError.js';
export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401, true, 'UNAUTHORIZED');
    }
}
//# sourceMappingURL=UnauthorizedError.js.map