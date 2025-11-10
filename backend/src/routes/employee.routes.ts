import { FastifyInstance } from 'fastify';
import { create, list, remove } from '../controllers/employee.controller.js';
import { authMiddleware } from '../middleware/auth.js';

export async function employeeRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.post('/', create);
  app.get('/', list);
  app.delete('/:id', remove);
}
