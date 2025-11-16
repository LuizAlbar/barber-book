const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSchedule() {
  try {
    console.log('🔍 Verificando horários cadastrados...\n');
    
    const schedules = await prisma.barberSchedule.findMany({
      include: {
        breakingTimes: true,
        barbershop: {
          select: {
            name: true
          }
        }
      }
    });
    
    if (schedules.length === 0) {
      console.log('❌ Nenhum horário cadastrado no banco!');
      return;
    }
    
    schedules.forEach(schedule => {
      console.log('📅 Horário encontrado:');
      console.log('  - Barbearia:', schedule.barbershop.name);
      console.log('  - ID:', schedule.id);
      console.log('  - Dias da semana:', schedule.daysOfWeek);
      console.log('  - Horário abertura (minutos):', schedule.openTime);
      console.log('  - Horário fechamento (minutos):', schedule.closeTime);
      console.log('  - Intervalos:', schedule.breakingTimes);
      console.log('');
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchedule();