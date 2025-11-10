import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { generateToken } from '../lib/jwt.js';
import { SignupInput, LoginInput, signupSchema, loginSchema } from '../schemas/user.schema.js';

export async function signup(
  request: FastifyRequest<{ Body: SignupInput }>,
  reply: FastifyReply
) {
  try {
    const validation = signupSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: validation.error.errors
      });
    }
    
    const { name, email, password } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return reply.status(409).send({
        error: 'Conflict',
        message: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    const token = generateToken({ userId: user.id, email: user.email });

    return reply.status(201).send({
      user,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to create user'
    });
  }
}

export async function login(
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply
) {
  try {
    const validation = loginSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: validation.error.errors
      });
    }
    
    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return reply.send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to login'
    });
  }
}

export async function getProfile(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: request.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        barbershops: {
          select: {
            id: true,
            name: true,
            fullAddress: true,
            neighborhood: true
          }
        }
      }
    });

    if (!user) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    return reply.send({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to get profile'
    });
  }
}
