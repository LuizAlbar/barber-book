import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { CreateAppointmentInput, UpdateAppointmentStatusInput, createAppointmentSchema, updateAppointmentStatusSchema } from '../schemas/appointment.schema.js';

export async function create(
  request: FastifyRequest<{ Body: CreateAppointmentInput }>,
  reply: FastifyReply
) {
  try {
    const validation = createAppointmentSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: validation.error.errors
      });
    }
    
    const { employeeId, serviceId, clientName, clientContact, datetime } = validation.data;

    const employee = await prisma.employee.findFirst({
      where: { id: employeeId },
      include: { barbershop: true }
    });

    if (!employee || employee.barbershop.ownerId !== request.userId) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Not authorized to create appointments for this employee'
      });
    }

    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        barbershopId: employee.barbershopId
      }
    });

    if (!service) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Service not found for this barbershop'
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientName,
        clientContact,
        datetime: new Date(datetime),
        employeeId,
        serviceId
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        service: true
      }
    });

    return reply.status(201).send({ appointment });
  } catch (error) {
    console.error('Create appointment error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to create appointment'
    });
  }
}

export async function list(
  request: FastifyRequest<{ Querystring: { barbershopId: string; date?: string; page?: string } }>,
  reply: FastifyReply
) {
  try {
    const { barbershopId, date, page: pageQuery } = request.query;
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
        message: 'Not authorized to view appointments from this barbershop'
      });
    }

    let dateFilter = {};
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      dateFilter = {
        datetime: {
          gte: startOfDay,
          lte: endOfDay
        }
      };
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          employee: {
            barbershopId
          },
          ...dateFilter
        },
        skip,
        take: limit,
        orderBy: { datetime: 'asc' },
        include: {
          employee: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          service: true
        }
      }),
      prisma.appointment.count({
        where: {
          employee: {
            barbershopId
          },
          ...dateFilter
        }
      })
    ]);

    return reply.send({
      appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('List appointments error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to list appointments'
    });
  }
}

export async function updateStatus(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateAppointmentStatusInput }>,
  reply: FastifyReply
) {
  try {
    const validation = updateAppointmentStatusSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: validation.error.errors
      });
    }
    
    const { status } = validation.data;
    const appointment = await prisma.appointment.findFirst({
      where: { id: request.params.id },
      include: {
        employee: {
          include: {
            barbershop: true
          }
        },
        service: true,
        capital: true
      }
    });

    if (!appointment || appointment.employee.barbershop.ownerId !== request.userId) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Appointment not found'
      });
    }

    if (status === 'COMPLETED' && appointment.status !== 'COMPLETED') {
      const capital = await prisma.capital.create({
        data: {
          value: appointment.service.price,
          type: 'PROFIT',
          description: `Serviço: ${appointment.service.name} - Cliente: ${appointment.clientName}`,
          barbershopId: appointment.employee.barbershopId
        }
      });

      const updated = await prisma.appointment.update({
        where: { id: request.params.id },
        data: {
          status,
          capitalId: capital.id
        },
        include: {
          employee: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          service: true
        }
      });

      return reply.send({ appointment: updated });
    }

    if (status !== 'COMPLETED' && appointment.status === 'COMPLETED' && appointment.capitalId) {
      await prisma.capital.delete({
        where: { id: appointment.capitalId }
      });
    }

    const updated = await prisma.appointment.update({
      where: { id: request.params.id },
      data: {
        status,
        capitalId: status !== 'COMPLETED' ? null : appointment.capitalId
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        service: true
      }
    });

    return reply.send({ appointment: updated });
  } catch (error) {
    console.error('Update appointment status error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to update appointment status'
    });
  }
}
