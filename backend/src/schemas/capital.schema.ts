import { z } from 'zod';

export const createCapitalSchema = z.object({
  value: z.number().positive(),
  type: z.enum(['PROFIT', 'COST']),
  description: z.string().optional(),
  barbershopId: z.string().uuid()
});

export type CreateCapitalInput = z.infer<typeof createCapitalSchema>;
