import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  timeTaken: z.number().int().positive(),
  barbershopId: z.string().uuid()
});

export const updateServiceSchema = createServiceSchema.partial().omit({ barbershopId: true });

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
