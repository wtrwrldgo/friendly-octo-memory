import { AppError } from './AppError.js';
export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, true, 'NOT_FOUND');
    }
}
//# sourceMappingURL=NotFoundError.js.map