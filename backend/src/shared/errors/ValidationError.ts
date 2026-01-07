import { AppError } from './AppError.js';

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>) {
    super('Validation failed', 400, true, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}
