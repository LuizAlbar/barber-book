import { z } from 'zod';

export const createScheduleSchema = z.object({
  daysOfWeek: z.string(),
  openTime: z.number().int().min(0).max(1440),
  closeTime: z.number().int().min(0).max(1440),
  barbershopId: z.string().uuid(),
  breakingTimes: z.array(z.object({
    startingTime: z.number().int().min(0).max(1440),
    endingTime: z.number().int().min(0).max(1440)
  })).optional()
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
