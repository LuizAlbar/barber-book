import { ZodError } from 'zod';

export function formatZodError(error: ZodError) {
  const fieldErrors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }));

  return {
    error: 'Validation Error',
    message: 'Campos inválidos',
    fields: fieldErrors
  };
}