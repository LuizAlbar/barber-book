import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { CreateInvitationInput, createInvitationSchema } from '../schemas/invitation.schema.js';
import { formatZodError } from '../utils/validation.js';
import { hasAccessToBarbershop } from '../utils/barbershop.js';

export async function create(
  request: FastifyRequest<{ Body: CreateInvitationInput }>,
  reply: FastifyReply
) {
  try {
    const validation = createInvitationSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send(formatZodError(validation.error));
    }
    
    const { userEmail, phoneNumber, role, barbershopId } = validation.data;

    // Verificar se o usuário é dono da barbearia
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

    // Verificar se já existe um convite pendente para este email e barbearia
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        userEmail,
        barbershopId,
        status: 'PENDING'
      }
    });

    if (existingInvitation) {
      return reply.status(409).send({
        error: 'Conflict',
        message: 'Já existe um convite pendente para este email'
      });
    }

    // Verificar se o usuário já é funcionário desta barbearia
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        employees: {
          where: { barbershopId }
        }
      }
    });

    if (user && user.employees.length > 0) {
      return reply.status(409).send({
        error: 'Conflict',
        message: 'Este usuário já é funcionário desta barbearia'
      });
    }

    // Criar convite
    const invitation = await prisma.invitation.create({
      data: {
        userEmail,
        phoneNumber,
        role,
        barbershopId
      },
      include: {
        barbershop: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return reply.status(201).send({ invitation });
  } catch (error) {
    console.error('Create invitation error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to create invitation'
    });
  }
}

export async function list(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Buscar convites pendentes para o email do usuário logado
    const user = await prisma.user.findUnique({
      where: { id: request.userId! },
      select: { email: true }
    });

    if (!user) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    const invitations = await prisma.invitation.findMany({
      where: {
        userEmail: user.email,
        status: 'PENDING'
      },
      include: {
        barbershop: {
          select: {
            id: true,
            name: true,
            neighborhood: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Verificar se o usuário já é funcionário das barbearias dos convites
    // e filtrar convites para barbearias onde o usuário já é funcionário
    const userId = request.userId!;
    const employees = await prisma.employee.findMany({
      where: {
        userId
      },
      select: {
        barbershopId: true
      }
    });

    const barbershopIdsWhereUserIsEmployee = new Set(employees.map(e => e.barbershopId));
    
    // Filtrar convites para barbearias onde o usuário já é funcionário
    const validInvitations = invitations.filter(inv => 
      !barbershopIdsWhereUserIsEmployee.has(inv.barbershopId)
    );

    return reply.send({ invitations: validInvitations });
  } catch (error) {
    console.error('List invitations error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to list invitations'
    });
  }
}

export async function accept(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const userId = request.userId!;

    console.log('Accept invitation - id:', id, 'userId:', userId);

    // Verificar se o convite existe e está pendente
    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: {
        barbershop: true
      }
    });

    if (!invitation) {
      console.log('Invitation not found:', id);
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Invitation not found'
      });
    }

    console.log('Invitation found:', {
      id: invitation.id,
      status: invitation.status,
      userEmail: invitation.userEmail,
      barbershopId: invitation.barbershopId
    });

    // Verificar se o email do convite corresponde ao email do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      console.log('User not found:', userId);
      return reply.status(404).send({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    console.log('User found:', {
      userId: user.email,
      invitationEmail: invitation.userEmail,
      match: user.email === invitation.userEmail
    });

    if (user.email !== invitation.userEmail) {
      console.log('Email mismatch:', {
        userEmail: user.email,
        invitationEmail: invitation.userEmail
      });
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Email does not match invitation'
      });
    }

    // Verificar se o usuário já é funcionário desta barbearia
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        userId,
        barbershopId: invitation.barbershopId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        barbershop: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Se o convite já foi aceito ou o usuário já é funcionário, retornar sucesso
    if (invitation.status === 'ACCEPTED' || existingEmployee) {
      console.log('Invitation already accepted or user is already an employee');
      
      // Se o convite não está como ACCEPTED mas o usuário já é funcionário, atualizar
      if (invitation.status !== 'ACCEPTED' && existingEmployee) {
        await prisma.invitation.update({
          where: { id },
          data: { status: 'ACCEPTED', userId }
        });
      }

      return reply.send({ 
        message: existingEmployee ? 'User is already an employee' : 'Invitation was already accepted',
        employee: existingEmployee || null,
        alreadyAccepted: true
      });
    }

    // Se o convite foi rejeitado, retornar erro
    if (invitation.status === 'REJECTED') {
      console.log('Invitation was rejected');
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'This invitation was rejected'
      });
    }

    // Se não está pendente e não foi aceito/rejeitado, retornar erro
    if (invitation.status !== 'PENDING') {
      console.log('Invitation is not pending, status:', invitation.status);
      return reply.status(400).send({
        error: 'Bad Request',
        message: `Invitation is not pending. Current status: ${invitation.status}`
      });
    }

    // Criar employee e atualizar convite
    console.log('Creating employee with data:', {
      phoneNumber: invitation.phoneNumber,
      role: invitation.role,
      userId,
      barbershopId: invitation.barbershopId
    });

    const employee = await prisma.employee.create({
      data: {
        phoneNumber: invitation.phoneNumber,
        role: invitation.role,
        userId,
        barbershopId: invitation.barbershopId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        barbershop: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('Employee created:', employee.id);

    await prisma.invitation.update({
      where: { id },
      data: { status: 'ACCEPTED', userId }
    });

    console.log('Invitation updated to ACCEPTED');

    return reply.send({ employee });
  } catch (error: any) {
    console.error('Accept invitation error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: error.message || 'Failed to accept invitation',
      details: error.meta
    });
  }
}

export async function reject(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;

    // Verificar se o convite existe e está pendente
    const invitation = await prisma.invitation.findUnique({
      where: { id }
    });

    if (!invitation) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Invitation not found'
      });
    }

    if (invitation.status !== 'PENDING') {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invitation is not pending'
      });
    }

    // Verificar se o email do convite corresponde ao email do usuário logado
    const user = await prisma.user.findUnique({
      where: { id: request.userId! },
      select: { email: true }
    });

    if (!user || user.email !== invitation.userEmail) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Not authorized'
      });
    }

    // Atualizar status do convite
    await prisma.invitation.update({
      where: { id },
      data: { 
        status: 'REJECTED',
        userId: request.userId!
      }
    });

    return reply.send({ message: 'Invitation rejected' });
  } catch (error) {
    console.error('Reject invitation error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to reject invitation'
    });
  }
}

