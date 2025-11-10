import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../lib/jwt.js';

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    request.userId = payload.userId;
  } catch (error) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
}
