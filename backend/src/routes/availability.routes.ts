import { FastifyInstance } from 'fastify';
import { getAvailableSlots } from '../controllers/availability.controller.js';

export async function availabilityRoutes(app: FastifyInstance) {
  console.log('🔧 Registering availability routes');
  app.get('/:barbershopId/slots', getAvailableSlots);
  console.log('✅ Availability routes registered');
}