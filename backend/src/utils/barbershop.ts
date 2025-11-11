import { prisma } from '../lib/prisma.js';

export async function hasAccessToBarbershop(userId: string, barbershopId: string): Promise<boolean> {
  const barbershop = await prisma.barbershop.findFirst({
    where: {
      id: barbershopId,
      OR: [
        { ownerId: userId }, // É dono
        { employees: { some: { userId } } } // É funcionário
      ]
    }
  });

  return !!barbershop;
}