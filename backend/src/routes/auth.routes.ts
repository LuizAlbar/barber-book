import { FastifyInstance } from 'fastify';
import { signup, login, getProfile, updateProfile } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/signup', signup);
  app.post('/login', login);
  app.get('/profile', { preHandler: authMiddleware }, getProfile);
  app.put('/profile', { preHandler: authMiddleware }, updateProfile);
}
