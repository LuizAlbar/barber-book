import { FastifyInstance } from 'fastify';
import { create, list, getById, getPublicById, update, remove } from '../controllers/barbershop.controller.js';
import { authMiddleware } from '../middleware/auth.js';

export async function barbershopRoutes(app: FastifyInstance) {
  // Rota pública para clientes
  app.get('/public/:id', getPublicById);
  
  // Rotas protegidas
  app.addHook('preHandler', authMiddleware);
  app.post('/', create);
  app.get('/', list);
  app.get('/:id', getById);
  app.put('/:id', update);
  app.delete('/:id', remove);
}
