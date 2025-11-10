import { z } from 'zod';

export const createAppointmentSchema = z.object({
  clientName: z.string().min(2),
  clientContact: z.string().min(10),
  datetime: z.string().datetime(),
  employeeId: z.string().uuid(),
  serviceId: z.string().uuid()
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED'])
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
