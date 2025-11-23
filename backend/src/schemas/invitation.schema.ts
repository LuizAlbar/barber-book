import { z } from 'zod';

export const createInvitationSchema = z.object({
  userEmail: z.string().email(),
  role: z.enum(['BARBEIRO', 'ATENDENTE']),
  barbershopId: z.string().uuid()
});

export const acceptInvitationSchema = z.object({});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;

