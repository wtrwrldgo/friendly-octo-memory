import { AppError } from './AppError.js';
export class ValidationError extends AppError {
    errors;
    constructor(errors) {
        super('Validation failed', 400, true, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}
//# sourceMappingURL=ValidationError.js.map