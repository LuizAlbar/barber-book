import { FastifyInstance } from 'fastify';
import { getAvailableSlots } from '../controllers/availability.controller.js';

export async function availabilityRoutes(app: FastifyInstance) {
  app.get('/:barbershopId/slots', getAvailableSlots);
}