import { z } from 'zod';

export const createScheduleSchema = z.object({
  daysOfWeek: z.array(z.number().int().min(0).max(6)),
  openTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  closeTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  barbershopId: z.string().uuid(),
  breakingTimes: z.array(z.object({
    startingTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endingTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
  })).optional()
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
