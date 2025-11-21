import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { appointmentService, authService } from '../services/api';
import { theme } from '../styles/theme';

interface Appointment {
  id: string;
  clientName: string;
  clientContact: string;
  datetime: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  service: {
    name: string;
    price: number;
  };
  employee: {
    user: {
      name: string;
    };
  };
}

export default function AppointmentsScreen({ navigation }: any) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'my' | 'all'>('my');
  const [isOwner, setIsOwner] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  const today = new Date().toISOString().split('T')[0];
  const pendingAppointments = appointments.filter(apt => apt.status === 'PENDING');
  const completedAppointments = appointments.filter(apt => apt.status === 'COMPLETED');

  useEffect(() => {
    loadAppointments();
  }, [viewMode]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const profileResponse = await authService.getProfile();
      console.log('👤 Perfil do usuário:', profileResponse.user);
      
      let barbershopId = null;
      let employeeId = null;
      let userIsOwner = false;
      
      if (profileResponse.user.barbershops && profileResponse.user.barbershops.length > 0) {
        barbershopId = profileResponse.user.barbershops[0].id;
        userIsOwner = true;
        console.log('🏪 Usuário é dono da barbearia:', barbershopId);
        
        // Verificar se o dono também é funcionário
        if (profileResponse.user.employees && profileResponse.user.employees.length > 0) {
          employeeId = profileResponse.user.employees[0].id;
          console.log('👨💼 Dono também é funcionário:', employeeId);
        }
      }
      else if (profileResponse.user.employees && profileResponse.user.employees.length > 0) {
        barbershopId = profileResponse.user.employees[0].barbershopId;
        employeeId = profileResponse.user.employees[0].id;
        console.log('👨💼 Usuário é funcionário da barbearia:', barbershopId, 'Employee ID:', employeeId);
      }
      
      setIsOwner(userIsOwner);
      setCurrentEmployeeId(employeeId);
      
      if (!barbershopId) {
        console.log('❌ Nenhuma barbearia encontrada');
        Alert.alert('Erro', 'Nenhuma barbearia encontrada para este usuário');
        return;
      }
      
      // Se for modo 'my' e não tiver employeeId, usar um ID inexistente para retornar vazio
      // Se for modo 'all', não filtrar (mostrar todos da barbearia)
      const filterEmployeeId = viewMode === 'my' ? (employeeId || 'no-employee') : undefined;
      
      console.log('📅 Buscando agendamentos para:', { barbershopId, employeeId: filterEmployeeId, viewMode, userIsOwner, hasEmployeeId: !!employeeId });
      const response = await appointmentService.list({ barbershopId, employeeId: filterEmployeeId });
      console.log('📋 Agendamentos recebidos:', response);
      setAppointments(response.appointments);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: 'PENDING' | 'COMPLETED') => {
    try {
      await appointmentService.updateStatus(appointmentId, { status });
      loadAppointments(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status do agendamento');
    }
  };

  const renderAppointmentCard = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.clientName}>{item.clientName} — {item.clientContact}</Text>
        {viewMode === 'all' && (
          <Text style={styles.barberName}>Barbeiro: {item.employee.user.name}</Text>
        )}
      </View>
      <Text style={styles.serviceName}>{item.service.name}</Text>
      <Text style={styles.appointmentTime}>
        {new Date(item.datetime).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>
      <TouchableOpacity
        style={[
          styles.statusButton,
          item.status === 'COMPLETED' ? styles.completedButton : styles.pendingButton
        ]}
        onPress={() => updateAppointmentStatus(
          item.id,
          item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
        )}
      >
        <Text style={styles.statusButtonText}>
          {item.status === 'COMPLETED' ? 'Concluído' : 'Concluir'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Agendamentos</Text>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
        <TouchableOpacity onPress={loadAppointments}>
          <Ionicons name="calendar-outline" size={32} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {isOwner && (
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'my' && styles.toggleButtonActive]}
            onPress={() => setViewMode('my')}
          >
            <Text style={[styles.toggleText, viewMode === 'my' && styles.toggleTextActive]}>Meus</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'all' && styles.toggleButtonActive]}
            onPress={() => setViewMode('all')}
          >
            <Text style={[styles.toggleText, viewMode === 'all' && styles.toggleTextActive]}>Todos</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.summaryCard}>
        <View style={[styles.summaryItem, { borderLeftColor: theme.colors.info }]}>
          <Text style={styles.summaryValue}>{appointments.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={[styles.summaryItem, { borderLeftColor: theme.colors.warning }]}>
          <Text style={styles.summaryValue}>{pendingAppointments.length}</Text>
          <Text style={styles.summaryLabel}>Pendentes</Text>
        </View>
        <View style={[styles.summaryItem, { borderLeftColor: theme.colors.success }]}>
          <Text style={styles.summaryValue}>{completedAppointments.length}</Text>
          <Text style={styles.summaryLabel}>Concluídos</Text>
        </View>
      </View>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={renderAppointmentCard}
        ListHeaderComponent={() => (
          <Text style={styles.sectionTitle}>Agendamentos de Hoje</Text>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>Nenhum agendamento para hoje</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar" size={24} color={theme.colors.primary} />
          <Text style={[styles.navLabel, { color: theme.colors.primary }]}>Agendamentos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Ionicons name="bar-chart-outline" size={24} color="#999" />
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Config')}
        >
          <Ionicons name="settings-outline" size={24} color="#999" />
          <Text style={styles.navLabel}>Config</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerDate: {
    fontSize: theme.fontSize.sm,
    color: '#999',
    marginTop: theme.spacing.xs,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    borderLeftWidth: 3,
    paddingLeft: theme.spacing.md,
  },
  summaryValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  summaryLabel: {
    fontSize: theme.fontSize.sm,
    color: '#999',
    marginTop: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: theme.fontSize.md,
    marginTop: theme.spacing.md,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navLabel: {
    color: '#999',
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentCard: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  appointmentHeader: {
    marginBottom: theme.spacing.sm,
  },
  clientName: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  barberName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
   
  },
  serviceName: {
    fontSize: theme.fontSize.sm,
    color: '#999',
    marginBottom: theme.spacing.xs,
  },
  appointmentTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  statusButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  pendingButton: {
    backgroundColor: theme.colors.warning,
  },
  completedButton: {
    backgroundColor: theme.colors.success,
  },
  statusButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleText: {
    color: '#999',
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
  },
  toggleTextActive: {
    color: theme.colors.background,
  },
});