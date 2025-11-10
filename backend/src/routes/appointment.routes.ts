import { FastifyInstance } from 'fastify';
import { create, list, updateStatus } from '../controllers/appointment.controller.js';
import { authMiddleware } from '../middleware/auth.js';

export async function appointmentRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.post('/', create);
  app.get('/', list);
  app.patch('/:id/status', updateStatus);
}
