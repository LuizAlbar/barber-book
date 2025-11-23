import { z } from 'zod';

export const createEmployeeSchema = z.object({
  role: z.enum(['BARBEIRO', 'ATENDENTE']),
  userEmail: z.string().email(),
  barbershopId: z.string().uuid()
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
