import { FastifyInstance } from 'fastify';
import { create, list, update, remove } from '../controllers/service.controller.js';
import { authMiddleware } from '../middleware/auth.js';

export async function serviceRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.post('/', create);
  app.get('/', list);
  app.put('/:id', update);
  app.delete('/:id', remove);
}
