import { FastifyInstance } from 'fastify';
import { create, list, remove } from '../controllers/capital.controller.js';
import { authMiddleware } from '../middleware/auth.js';

export async function capitalRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.post('/', create);
  app.get('/', list);
  app.delete('/:id', remove);
}
