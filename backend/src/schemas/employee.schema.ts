import { z } from 'zod';

export const createEmployeeSchema = z.object({
  phoneNumber: z.string().min(10),
  role: z.enum(['BARBEIRO', 'ATENDENTE']),
  userId: z.string().uuid(),
  barbershopId: z.string().uuid()
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
