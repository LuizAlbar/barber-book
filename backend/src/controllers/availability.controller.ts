import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function getAvailableSlots(
  request: FastifyRequest<{ 
    Params: { barbershopId: string }; 
    Querystring: { employeeId: string; serviceId: string; date: string } 
  }>,
  reply: FastifyReply
) {
  console.log('🔍 getAvailableSlots called with:', request.params, request.query);
  try {
    const { barbershopId } = request.params;
    const { employeeId, serviceId, date } = request.query;

    // Buscar serviço para saber a duração
    console.log('🔍 Buscando serviço:', { serviceId, barbershopId });
    const service = await prisma.service.findFirst({
      where: { id: serviceId, barbershopId }
    });
    console.log('📋 Serviço encontrado:', service);

    if (!service) {
      console.log('❌ Serviço não encontrado');
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Serviço não encontrado'
      });
    }

    // Buscar funcionário
    console.log('🔍 Buscando funcionário:', { employeeId, barbershopId });
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, barbershopId }
    });
    console.log('👤 Funcionário encontrado:', employee);

    if (!employee) {
      console.log('❌ Funcionário não encontrado');
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Funcionário não encontrado'
      });
    }

    // Buscar horários da barbearia
    console.log('🔍 Buscando horários da barbearia:', { barbershopId });
    const schedule = await prisma.barberSchedule.findFirst({
      where: { barbershopId },
      include: { breakingTimes: true }
    });
    console.log('⏰ Horários encontrados:', schedule);

    if (!schedule) {
      console.log('❌ Horário de funcionamento não encontrado');
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Horário de funcionamento não encontrado'
      });
    }

    // Criar data no timezone local para evitar problemas de UTC
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const dayOfWeek = targetDate.getDay();
    const daysOfWeek = JSON.parse(schedule.daysOfWeek);
    
    console.log('📅 Data alvo:', date);
    console.log('📅 targetDate:', targetDate);
    console.log('📅 Dia da semana (0=Dom, 6=Sáb):', dayOfWeek);
    console.log('📅 Dias configurados:', daysOfWeek);
    console.log('📅 Tipo dos dias configurados:', typeof daysOfWeek, Array.isArray(daysOfWeek));
    console.log('📅 Dia está nos dias configurados?', daysOfWeek.includes(dayOfWeek));
    console.log('📅 Horários da barbearia:', { openTime: schedule.openTime, closeTime: schedule.closeTime });

    if (!daysOfWeek.includes(dayOfWeek)) {
      console.log('❌ Dia não está configurado para funcionamento');
      return reply.send({ availableSlots: [] });
    }

    // Buscar agendamentos existentes para o dia
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');

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
    
    console.log('📅 Período de busca:', { startOfDay, endOfDay });
    console.log('📋 Agendamentos existentes:', existingAppointments.length);
    existingAppointments.forEach(apt => {
      console.log('  - Agendamento:', {
        datetime: apt.datetime,
        service: apt.service.name,
        duration: apt.service.timeTaken
      });
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

    console.log('✅ Retornando slots:', availableSlots);
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
  openTime: number,
  closeTime: number,
  breakingTimes: any[],
  existingAppointments: any[],
  serviceDuration: number,
  targetDate: Date
): string[] {
  const slots: string[] = [];
  const slotInterval = 30; // Intervalo de 30 minutos
  
  let currentMinutes = openTime;
  
  while (currentMinutes + serviceDuration <= closeTime) {
    const slotEndMinutes = currentMinutes + serviceDuration;
    
    // Verificar se não está em horário de pausa
    const isInBreak = breakingTimes.some(breakTime => {
      return (currentMinutes < breakTime.endingTime && slotEndMinutes > breakTime.startingTime);
    });

    // Verificar se não conflita com agendamentos existentes
    const hasConflict = existingAppointments.some(appointment => {
      const appointmentStart = new Date(appointment.datetime);
      const appointmentMinutes = appointmentStart.getHours() * 60 + appointmentStart.getMinutes();
      const appointmentEndMinutes = appointmentMinutes + appointment.service.timeTaken;
      
      return (currentMinutes < appointmentEndMinutes && slotEndMinutes > appointmentMinutes);
    });

    if (!isInBreak && !hasConflict) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }

    currentMinutes += slotInterval;
  }

  return slots;
}