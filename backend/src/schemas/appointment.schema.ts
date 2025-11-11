import { z } from 'zod';

export const createAppointmentSchema = z.object({
  clientName: z.string().min(2, 'Nome do cliente deve ter pelo menos 2 caracteres'),
  clientContact: z.string().min(10, 'Contato deve ter pelo menos 10 caracteres'),
  datetime: z.string().datetime('Data e hora devem estar no formato ISO válido'),
  employeeId: z.string().uuid('ID do funcionário deve ser um UUID válido'),
  serviceId: z.string().uuid('ID do serviço deve ser um UUID válido')
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status deve ser PENDING, COMPLETED ou CANCELLED' })
  })
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
