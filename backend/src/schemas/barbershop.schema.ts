import { z } from 'zod';

export const createBarbershopSchema = z.object({
  name: z.string().min(2),
  fullAddress: z.string().min(5),
  neighborhood: z.string().min(2),
  referencePoint: z.string().optional()
});

export const updateBarbershopSchema = createBarbershopSchema.partial();

export type CreateBarbershopInput = z.infer<typeof createBarbershopSchema>;
export type UpdateBarbershopInput = z.infer<typeof updateBarbershopSchema>;
