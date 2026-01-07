import { AppError } from './AppError.js';
export declare class ValidationError extends AppError {
    readonly errors: Record<string, string[]>;
    constructor(errors: Record<string, string[]>);
}
//# sourceMappingURL=ValidationError.d.ts.map