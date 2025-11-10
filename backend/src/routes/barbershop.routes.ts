import { FastifyInstance } from 'fastify';
import { create, list, getById, update, remove } from '../controllers/barbershop.controller.js';
import { authMiddleware } from '../middleware/auth.js';

export async function barbershopRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.post('/', create);
  app.get('/', list);
  app.get('/:id', getById);
  app.put('/:id', update);
  app.delete('/:id', remove);
}
