import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { CreateCapitalInput, createCapitalSchema } from '../schemas/capital.schema.js';

export async function create(
  request: FastifyRequest<{ Body: CreateCapitalInput }>,
  reply: FastifyReply
) {
  try {
    const validation = createCapitalSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: validation.error.errors
      });
    }
    
    const barbershop = await prisma.barbershop.findFirst({
      where: {
        id: validation.data.barbershopId,
        ownerId: request.userId
      }
    });

    if (!barbershop) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Not authorized'
      });
    }

    const capital = await prisma.capital.create({
      data: validation.data
    });

    return reply.status(201).send({ capital });
  } catch (error) {
    console.error('Create capital error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to create capital entry'
    });
  }
}

export async function list(
  request: FastifyRequest<{ Querystring: { barbershopId: string; page?: string; type?: string } }>,
  reply: FastifyReply
) {
  try {
    const { barbershopId, type, page: pageQuery } = request.query;
    const page = parseInt(pageQuery || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

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

    const where: any = { barbershopId };
    if (type === 'PROFIT' || type === 'COST') {
      where.type = type;
    }

    const [capital, total] = await Promise.all([
      prisma.capital.findMany({
        where,
        skip,
        take: limit,
        orderBy: { datetime: 'desc' }
      }),
      prisma.capital.count({ where })
    ]);

    return reply.send({
      capital,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('List capital error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to list capital'
    });
  }
}
