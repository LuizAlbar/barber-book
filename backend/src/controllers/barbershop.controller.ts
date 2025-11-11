import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { CreateBarbershopInput, UpdateBarbershopInput, createBarbershopSchema, updateBarbershopSchema } from '../schemas/barbershop.schema.js';
import { formatZodError } from '../utils/validation.js';

export async function create(
  request: FastifyRequest<{ Body: CreateBarbershopInput }>,
  reply: FastifyReply
) {
  try {
    const validation = createBarbershopSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send(formatZodError(validation.error));
    }
    
    const barbershop = await prisma.barbershop.create({
      data: {
        ...validation.data,
        ownerId: request.userId!
      }
    });

    return reply.status(201).send({ barbershop });
  } catch (error) {
    console.error('Create barbershop error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to create barbershop'
    });
  }
}

export async function list(
  request: FastifyRequest<{ Querystring: { page?: string } }>,
  reply: FastifyReply
) {
  try {
    const page = parseInt(request.query.page || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    const [barbershops, total] = await Promise.all([
      prisma.barbershop.findMany({
        where: { ownerId: request.userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.barbershop.count({
        where: { ownerId: request.userId }
      })
    ]);

    return reply.send({
      barbershops,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('List barbershops error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to list barbershops'
    });
  }
}

export async function getById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const barbershop = await prisma.barbershop.findFirst({
      where: {
        id: request.params.id,
        ownerId: request.userId
      },
      include: {
        services: true,
        employees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        barberSchedules: {
          include: {
            breakingTimes: true
          }
        }
      }
    });

    if (!barbershop) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Barbershop not found'
      });
    }

    return reply.send({ barbershop });
  } catch (error) {
    console.error('Get barbershop error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to get barbershop'
    });
  }
}

export async function update(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateBarbershopInput }>,
  reply: FastifyReply
) {
  try {
    const validation = updateBarbershopSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send(formatZodError(validation.error));
    }
    
    const barbershop = await prisma.barbershop.findFirst({
      where: {
        id: request.params.id,
        ownerId: request.userId
      }
    });

    if (!barbershop) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Barbershop not found'
      });
    }

    const updated = await prisma.barbershop.update({
      where: { id: request.params.id },
      data: validation.data
    });

    return reply.send({ barbershop: updated });
  } catch (error) {
    console.error('Update barbershop error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to update barbershop'
    });
  }
}

export async function remove(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const barbershop = await prisma.barbershop.findFirst({
      where: {
        id: request.params.id,
        ownerId: request.userId
      }
    });

    if (!barbershop) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Barbershop not found'
      });
    }

    await prisma.barbershop.delete({
      where: { id: request.params.id }
    });

    return reply.status(204).send();
  } catch (error) {
    console.error('Delete barbershop error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to delete barbershop'
    });
  }
}
