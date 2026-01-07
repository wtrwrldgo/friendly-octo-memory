import { AppError } from './AppError.js';
export class ForbiddenError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403, true, 'FORBIDDEN');
    }
}
//# sourceMappingURL=ForbiddenError.js.map