import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { CreateScheduleInput, createScheduleSchema } from '../schemas/schedule.schema.js';
import { formatZodError } from '../utils/validation.js';
import { hasAccessToBarbershop } from '../utils/barbershop.js';

export async function create(
  request: FastifyRequest<{ Body: CreateScheduleInput }>,
  reply: FastifyReply
) {
  try {
    const validation = createScheduleSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send(formatZodError(validation.error));
    }
    
    const { breakingTimes, ...scheduleData } = validation.data;

    const hasAccess = await hasAccessToBarbershop(request.userId!, scheduleData.barbershopId);
    if (!hasAccess) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Not authorized'
      });
    }

    // Deletar schedule existente se houver
    await prisma.barberSchedule.deleteMany({
      where: { barbershopId: scheduleData.barbershopId }
    });

    const schedule = await prisma.barberSchedule.create({
      data: {
        ...scheduleData,
        breakingTimes: breakingTimes ? {
          create: breakingTimes
        } : undefined
      },
      include: {
        breakingTimes: true
      }
    });

    return reply.status(201).send({ schedule });
  } catch (error) {
    console.error('Create schedule error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to create schedule'
    });
  }
}

export async function list(
  request: FastifyRequest<{ Querystring: { barbershopId: string } }>,
  reply: FastifyReply
) {
  try {
    const { barbershopId } = request.query;

    const hasAccess = await hasAccessToBarbershop(request.userId!, barbershopId);
    if (!hasAccess) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Not authorized'
      });
    }

    const schedules = await prisma.barberSchedule.findMany({
      where: { barbershopId },
      include: {
        breakingTimes: true
      }
    });

    return reply.send({ schedules });
  } catch (error) {
    console.error('List schedules error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to list schedules'
    });
  }
}
