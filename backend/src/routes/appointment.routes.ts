import { FastifyInstance } from 'fastify';
import { create, list, updateStatus } from '../controllers/appointment.controller.js';
import { authMiddleware } from '../middleware/auth.js';

export async function appointmentRoutes(app: FastifyInstance) {
  // Rota pública para clientes criarem agendamentos
  app.post('/', create);
  
  // Rotas protegidas para barbeiros/funcionários
  app.get('/', { preHandler: authMiddleware }, list);
  app.patch('/:id/status', { preHandler: authMiddleware }, updateStatus);
}
