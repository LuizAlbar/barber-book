import { authService } from '../services/api';
import { Alert } from 'react-native';

/**
 * Busca o barbershopId do usuário logado
 * Retorna o ID da barbearia se o usuário for dono ou funcionário
 */
export async function getBarbershopId(): Promise<string | null> {
  try {
    const profileResponse = await authService.getProfile();
    
    // Verifica se o usuário é dono de uma barbearia
    if (profileResponse.user.barbershops && profileResponse.user.barbershops.length > 0) {
      return profileResponse.user.barbershops[0].id;
    }
    
    // Verifica se o usuário é funcionário de uma barbearia
    if (profileResponse.user.employees && profileResponse.user.employees.length > 0) {
      return profileResponse.user.employees[0].barbershopId;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar barbershopId:', error);
    return null;
  }
}

/**
 * Busca o barbershopId e exibe erro se não encontrar
 */
export async function getBarbershopIdOrError(): Promise<string> {
  const barbershopId = await getBarbershopId();
  
  if (!barbershopId) {
    Alert.alert('Erro', 'Nenhuma barbearia encontrada para este usuário');
    throw new Error('BarbershopId não encontrado');
  }
  
  return barbershopId;
}

