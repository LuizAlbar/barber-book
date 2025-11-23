import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

interface AppointmentsCalendarProps {
  visible: boolean;
  onClose: () => void;
  appointments: Appointment[];
  viewMode: 'my' | 'all';
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function AppointmentsCalendar({
  visible,
  onClose,
  appointments,
  viewMode,
}: AppointmentsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateAppointments, setSelectedDateAppointments] = useState<Appointment[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Obter primeiro dia do mês e quantos dias tem o mês
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Criar array de dias do mês
  const days: (number | null)[] = [];
  // Adicionar espaços vazios para os dias antes do primeiro dia do mês
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  // Adicionar os dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  // Agrupar agendamentos por data
  const appointmentsByDate = appointments.reduce((acc, apt) => {
    const date = new Date(apt.datetime);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const getAppointmentsForDay = (day: number): Appointment[] => {
    if (day === null) return [];
    const dateKey = `${year}-${month}-${day}`;
    return appointmentsByDate[dateKey] || [];
  };

  const handleDayPress = (day: number | null) => {
    if (day === null) return;
    const date = new Date(year, month, day);
    setSelectedDate(date);
    const dateKey = `${year}-${month}-${day}`;
    setSelectedDateAppointments(appointmentsByDate[dateKey] || []);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
    setSelectedDate(null);
    setSelectedDateAppointments([]);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
    setSelectedDateAppointments([]);
  };

  const renderDay = (day: number | null, index: number) => {
    if (day === null) {
      return <View key={index} style={styles.dayCell} />;
    }

    const dayAppointments = getAppointmentsForDay(day);
    const hasAppointments = dayAppointments.length > 0;
    const isToday =
      day === new Date().getDate() &&
      month === new Date().getMonth() &&
      year === new Date().getFullYear();
    const isSelected =
      selectedDate &&
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear();

    // Contar agendamentos por status
    const pendingCount = dayAppointments.filter(apt => apt.status === 'PENDING').length;
    const completedCount = dayAppointments.filter(apt => apt.status === 'COMPLETED').length;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          isToday && styles.todayCell,
          isSelected && styles.selectedCell,
        ]}
        onPress={() => handleDayPress(day)}
      >
        <Text
          style={[
            styles.dayText,
            isToday && styles.todayText,
            isSelected && styles.selectedText,
            !hasAppointments && styles.dayTextInactive,
          ]}
        >
          {day}
        </Text>
        {hasAppointments && (
          <View style={styles.appointmentsIndicator}>
            {pendingCount > 0 && (
              <View style={[styles.indicatorDot, styles.pendingDot]} />
            )}
            {completedCount > 0 && (
              <View style={[styles.indicatorDot, styles.completedDot]} />
            )}
            <Text style={styles.appointmentCount}>{dayAppointments.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderAppointmentCard = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.clientName}>{item.clientName}</Text>
        {viewMode === 'all' && (
          <Text style={styles.barberName}>Barbeiro: {item.employee.user.name}</Text>
        )}
      </View>
      <Text style={styles.serviceName}>{item.service.name}</Text>
      <View style={styles.appointmentFooter}>
        <Text style={styles.appointmentTime}>
          {new Date(item.datetime).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        <View
          style={[
            styles.statusBadge,
            item.status === 'COMPLETED'
              ? styles.completedBadge
              : item.status === 'CANCELLED'
              ? styles.cancelledBadge
              : styles.pendingBadge,
          ]}
        >
          <Text style={styles.statusText}>
            {item.status === 'COMPLETED'
              ? 'Concluído'
              : item.status === 'CANCELLED'
              ? 'Cancelado'
              : 'Pendente'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Calendário de Agendamentos</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.calendarContainer}>
            {/* Navegação do mês */}
            <View style={styles.monthNavigation}>
              <TouchableOpacity onPress={() => navigateMonth('prev')}>
                <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
              <View style={styles.monthInfo}>
                <Text style={styles.monthText}>
                  {MONTHS[month]} {year}
                </Text>
                <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
                  <Text style={styles.todayButtonText}>Hoje</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => navigateMonth('next')}>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Dias da semana */}
            <View style={styles.weekDaysContainer}>
              {DAYS_OF_WEEK.map((day, index) => (
                <View key={index} style={styles.weekDay}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendário */}
            <View style={styles.calendarGrid}>
              {days.map((day, index) => renderDay(day, index))}
            </View>

            {/* Legenda */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.pendingDot]} />
                <Text style={styles.legendText}>Pendente</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.completedDot]} />
                <Text style={styles.legendText}>Concluído</Text>
              </View>
            </View>

            {/* Agendamentos do dia selecionado */}
            {selectedDate && (
              <View style={styles.selectedDateContainer}>
                <Text style={styles.selectedDateTitle}>
                  Agendamentos de {selectedDate.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                {selectedDateAppointments.length === 0 ? (
                  <Text style={styles.noAppointmentsText}>
                    Nenhum agendamento para este dia
                  </Text>
                ) : (
                  <FlatList
                    data={selectedDateAppointments}
                    renderItem={renderAppointmentCard}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: '90%',
    paddingBottom: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  calendarContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  monthInfo: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  todayButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  todayButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  weekDayText: {
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
    color: '#999',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.lg,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xs,
    position: 'relative',
  },
  todayCell: {
    backgroundColor: `${theme.colors.primary}30`,
    borderRadius: theme.borderRadius.sm,
  },
  selectedCell: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  dayText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  todayText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  selectedText: {
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  dayTextInactive: {
    color: '#666',
  },
  appointmentsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 2,
  },
  indicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  pendingDot: {
    backgroundColor: theme.colors.warning,
  },
  completedDot: {
    backgroundColor: theme.colors.success,
  },
  appointmentCount: {
    fontSize: 8,
    color: theme.colors.text,
    marginLeft: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: theme.fontSize.sm,
    color: '#999',
  },
  selectedDateContainer: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  selectedDateTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  noAppointmentsText: {
    fontSize: theme.fontSize.sm,
    color: '#999',
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
  appointmentCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  appointmentHeader: {
    marginBottom: theme.spacing.xs,
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
  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  pendingBadge: {
    backgroundColor: `${theme.colors.warning}30`,
  },
  completedBadge: {
    backgroundColor: `${theme.colors.success}30`,
  },
  cancelledBadge: {
    backgroundColor: `${theme.colors.error}30`,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
});

