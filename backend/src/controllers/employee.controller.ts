import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { CreateEmployeeInput, UpdateEmployeeInput, createEmployeeSchema } from '../schemas/employee.schema.js';
import { formatZodError } from '../utils/validation.js';

export async function create(
  request: FastifyRequest<{ Body: CreateEmployeeInput }>,
  reply: FastifyReply
) {
  try {
    const validation = createEmployeeSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send(formatZodError(validation.error));
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

    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: validation.data.userEmail }
    });

    if (!user) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Usuário com este email não encontrado'
      });
    }

    const employee = await prisma.employee.create({
      data: {
        phoneNumber: validation.data.phoneNumber,
        role: validation.data.role,
        userId: user.id,
        barbershopId: validation.data.barbershopId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return reply.status(201).send({ employee });
  } catch (error) {
    console.error('Create employee error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to create employee'
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
        message: 'Not authorized'
      });
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where: { barbershopId },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.employee.count({ where: { barbershopId } })
    ]);

    return reply.send({
      employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('List employees error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to list employees'
    });
  }
}

export async function remove(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const employee = await prisma.employee.findFirst({
      where: { id: request.params.id },
      include: { barbershop: true }
    });

    if (!employee || employee.barbershop.ownerId !== request.userId) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Employee not found'
      });
    }

    await prisma.employee.delete({
      where: { id: request.params.id }
    });

    return reply.status(204).send();
  } catch (error) {
    console.error('Delete employee error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to delete employee'
    });
  }
}
