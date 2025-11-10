import { FastifyInstance } from 'fastify';
import { create, list } from '../controllers/schedule.controller.js';
import { authMiddleware } from '../middleware/auth.js';

export async function scheduleRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.post('/', create);
  app.get('/', list);
}
