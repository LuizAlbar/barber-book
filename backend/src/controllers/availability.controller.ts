import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function getAvailableSlots(
  request: FastifyRequest<{ 
    Params: { barbershopId: string }; 
    Querystring: { employeeId: string; serviceId: string; date: string } 
  }>,
  reply: FastifyReply
) {
  try {
    const { barbershopId } = request.params;
    const { employeeId, serviceId, date } = request.query;

    // Buscar serviço para saber a duração
    const service = await prisma.service.findFirst({
      where: { id: serviceId, barbershopId }
    });

    if (!service) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Serviço não encontrado'
      });
    }

    // Buscar funcionário
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, barbershopId }
    });

    if (!employee) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Funcionário não encontrado'
      });
    }

    // Buscar horários da barbearia
    const schedule = await prisma.barberSchedule.findFirst({
      where: { barbershopId },
      include: { breakingTimes: true }
    });

    if (!schedule) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Horário de funcionamento não encontrado'
      });
    }

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();
    const daysOfWeek = JSON.parse(schedule.daysOfWeek);

    if (!daysOfWeek.includes(dayOfWeek)) {
      return reply.send({ availableSlots: [] });
    }

    // Buscar agendamentos existentes para o dia
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        employeeId,
        datetime: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { not: 'CANCELLED' }
      },
      include: { service: true }
    });

    // Gerar slots disponíveis
    const availableSlots = generateAvailableSlots(
      schedule.openTime,
      schedule.closeTime,
      schedule.breakingTimes,
      existingAppointments,
      service.timeTaken,
      new Date(date)
    );

    return reply.send({ availableSlots });
  } catch (error) {
    console.error('Get available slots error:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to get available slots'
    });
  }
}

function generateAvailableSlots(
  openTime: string,
  closeTime: string,
  breakingTimes: any[],
  existingAppointments: any[],
  serviceDuration: number,
  targetDate: Date
): string[] {
  const slots: string[] = [];
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);

  const startTime = new Date(targetDate);
  startTime.setHours(openHour, openMinute, 0, 0);

  const endTime = new Date(targetDate);
  endTime.setHours(closeHour, closeMinute, 0, 0);

  const slotDuration = 30; // 30 minutos por slot
  let currentTime = new Date(startTime);

  while (currentTime < endTime) {
    const slotEnd = new Date(currentTime.getTime() + serviceDuration * 60000);
    
    if (slotEnd <= endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      
      // Verificar se não está em horário de pausa
      const isInBreak = breakingTimes.some(breakTime => {
        const [breakStart] = breakTime.startingTime.split(':').map(Number);
        const [breakEnd] = breakTime.endingTime.split(':').map(Number);
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        const currentTotalMinutes = currentHour * 60 + currentMinute;
        const breakStartMinutes = breakStart * 60;
        const breakEndMinutes = breakEnd * 60;
        
        return currentTotalMinutes >= breakStartMinutes && currentTotalMinutes < breakEndMinutes;
      });

      // Verificar se não conflita com agendamentos existentes
      const hasConflict = existingAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.datetime);
        const appointmentEnd = new Date(appointmentStart.getTime() + appointment.service.timeTaken * 60000);
        
        return (currentTime < appointmentEnd && slotEnd > appointmentStart);
      });

      if (!isInBreak && !hasConflict) {
        slots.push(timeString);
      }
    }

    currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
  }

  return slots;
}