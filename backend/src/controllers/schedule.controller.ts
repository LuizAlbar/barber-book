import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { CreateScheduleInput, createScheduleSchema } from '../schemas/schedule.schema.js';

export async function create(
  request: FastifyRequest<{ Body: CreateScheduleInput }>,
  reply: FastifyReply
) {
  try {
    const validation = createScheduleSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: validation.error.errors
      });
    }
    
    const { breakingTimes, ...scheduleData } = validation.data;

    const barbershop = await prisma.barbershop.findFirst({
      where: {
        id: scheduleData.barbershopId,
        ownerId: request.userId
      }
    });

    if (!barbershop) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Not authorized'
      });
    }

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

    const barbershop = await prisma.barbershop.findFirst({
      where: {
        id: barbershopId,
        ownerId: request.userId
      }
    });

    if (!barbershop) {
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
