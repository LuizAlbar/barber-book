import { FastifyInstance } from 'fastify';
import { create, list, accept, reject } from '../controllers/invitation.controller.js';
import { authMiddleware } from '../middleware/auth.js';

export async function invitationRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.post('/', create);
  app.get('/', list);
  app.post('/:id/accept', accept);
  app.post('/:id/reject', reject);
}


