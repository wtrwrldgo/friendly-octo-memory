import { AppError } from './AppError.js';
export class BadRequestError extends AppError {
    constructor(message, code) {
        super(message, 400, true, code || 'BAD_REQUEST');
    }
}
//# sourceMappingURL=BadRequestError.js.map