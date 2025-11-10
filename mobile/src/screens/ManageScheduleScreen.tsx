import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scheduleService } from '../services/api';
import { theme } from '../styles/theme';

const DAYS = [
  { key: 'MONDAY', label: 'Segunda-feira' },
  { key: 'TUESDAY', label: 'Terça-feira' },
  { key: 'WEDNESDAY', label: 'Quarta-feira' },
  { key: 'THURSDAY', label: 'Quinta-feira' },
  { key: 'FRIDAY', label: 'Sexta-feira' },
  { key: 'SATURDAY', label: 'Sábado' },
  { key: 'SUNDAY', label: 'Domingo' },
];

export default function ManageScheduleScreen({ navigation }: any) {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSchedule = async () => {
    try {
      const response = await scheduleService.list('716f3577-4b85-4e25-977d-f0cfa2f4b356');
      const schedules = response.schedules || [];
      
      const scheduleMap = DAYS.map(day => {
        const existing = schedules.find((s: any) => s.dayOfWeek === day.key);
        return {
          day: day.key,
          label: day.label,
          isOpen: existing ? existing.isOpen : day.key !== 'SUNDAY',
          openTime: existing ? existing.openTime : '08:00',
          closeTime: existing ? existing.closeTime : '18:00',
          breakStartTime: existing ? existing.breakStartTime : '12:00',
          breakEndTime: existing ? existing.breakEndTime : '13:00',
          id: existing ? existing.id : null,
        };
      });
      
      setSchedule(scheduleMap);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      const defaultSchedule = DAYS.map(day => ({
        day: day.key,
        label: day.label,
        isOpen: day.key !== 'SUNDAY',
        openTime: '08:00',
        closeTime: '18:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
        id: null,
      }));
      setSchedule(defaultSchedule);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const toggleDay = (dayKey: string) => {
    setSchedule(prev => prev.map(s => 
      s.day === dayKey ? { ...s, isOpen: !s.isOpen } : s
    ));
  };

  const renderScheduleItem = ({ item }: { item: any }) => (
    <View style={styles.scheduleCard}>
      <View style={styles.scheduleInfo}>
        <Text style={styles.dayLabel}>{item.label}</Text>
        {item.isOpen ? (
          <>
            <Text style={styles.timeText}>{item.openTime} - {item.closeTime}</Text>
            <Text style={styles.breakText}>Intervalo: {item.breakStartTime} - {item.breakEndTime}</Text>
          </>
        ) : (
          <Text style={styles.closedText}>Fechado</Text>
        )}
      </View>
      <Switch
        value={item.isOpen}
        onValueChange={() => toggleDay(item.day)}
        trackColor={{ false: '#666', true: theme.colors.primary }}
        thumbColor={item.isOpen ? '#fff' : '#ccc'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Horários de Funcionamento</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Carregando...</Text>
        </View>
      ) : (
        <FlatList
          data={schedule}
          renderItem={renderScheduleItem}
          keyExtractor={(item) => item.day}
          contentContainerStyle={styles.list}
        />
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  list: {
    padding: theme.spacing.lg,
  },
  scheduleCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduleInfo: {
    flex: 1,
  },
  dayLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  timeText: {
    color: '#999',
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  closedText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  breakText: {
    color: '#666',
    fontSize: theme.fontSize.xs,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: theme.fontSize.md,
    marginTop: theme.spacing.md,
  },
});