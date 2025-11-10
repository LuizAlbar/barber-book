import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { CreateServiceInput, UpdateServiceInput, createServiceSchema, updateServiceSchema } from '../schemas/service.schema.js';

export async function create(
  request: FastifyRequest<{ Body: CreateServiceInput }>,
  reply: FastifyReply
) {
  try {
    const validation = createServiceSchema.safeParse(request.body);
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
        message: 'Not authorized to add services to this barbershop'
      });
    }

    const service = await prisma.service.create({
      data: validation.data
    });

    return reply.status(201).send({ service });
  } catch (error) {
    console.error('Create service error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to create service'
    });
  }
}

export async function list(
  request: FastifyRequest<{ Querystring: { barbershopId: string; page?: string } }>,
  reply: FastifyReply
) {
  try {
    const { barbershopId, page: pageQuery } = request.query;
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
        message: 'Not authorized to view services from this barbershop'
      });
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where: { barbershopId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.service.count({ where: { barbershopId } })
    ]);

    return reply.send({
      services,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('List services error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to list services'
    });
  }
}

export async function update(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateServiceInput }>,
  reply: FastifyReply
) {
  try {
    const validation = updateServiceSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: validation.error.errors
      });
    }
    
    const service = await prisma.service.findFirst({
      where: { id: request.params.id },
      include: { barbershop: true }
    });

    if (!service || service.barbershop.ownerId !== request.userId) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Service not found'
      });
    }

    const updated = await prisma.service.update({
      where: { id: request.params.id },
      data: validation.data
    });

    return reply.send({ service: updated });
  } catch (error) {
    console.error('Update service error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to update service'
    });
  }
}

export async function remove(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const service = await prisma.service.findFirst({
      where: { id: request.params.id },
      include: { barbershop: true }
    });

    if (!service || service.barbershop.ownerId !== request.userId) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Service not found'
      });
    }

    await prisma.service.delete({
      where: { id: request.params.id }
    });

    return reply.status(204).send();
  } catch (error) {
    console.error('Delete service error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to delete service'
    });
  }
}
