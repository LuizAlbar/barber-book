import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { authRoutes } from './routes/auth.routes.js';
import { barbershopRoutes } from './routes/barbershop.routes.js';
import { serviceRoutes } from './routes/service.routes.js';
import { employeeRoutes } from './routes/employee.routes.js';
import { appointmentRoutes } from './routes/appointment.routes.js';
import { capitalRoutes } from './routes/capital.routes.js';
import { scheduleRoutes } from './routes/schedule.routes.js';

const app = Fastify({
  logger: true
});

await app.register(cors, {
  origin: true,
  credentials: true
});

app.get('/', async () => {
  return { 
    message: 'BarberBook API',
    version: '1.0.0',
    status: 'running'
  };
});

await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(barbershopRoutes, { prefix: '/api/barbershops' });
await app.register(serviceRoutes, { prefix: '/api/services' });
await app.register(employeeRoutes, { prefix: '/api/employees' });
await app.register(appointmentRoutes, { prefix: '/api/appointments' });
await app.register(capitalRoutes, { prefix: '/api/capital' });
await app.register(scheduleRoutes, { prefix: '/api/schedules' });

const PORT = Number(process.env.PORT) || 4000;
const HOST = '0.0.0.0';

try {
  await app.listen({ port: PORT, host: HOST });
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
