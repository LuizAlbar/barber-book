import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { scheduleService } from '../services/api';

const DAYS = [
  { id: 0, name: 'Domingo' },
  { id: 1, name: 'Segunda-feira' },
  { id: 2, name: 'Terça-feira' },
  { id: 3, name: 'Quarta-feira' },
  { id: 4, name: 'Quinta-feira' },
  { id: 5, name: 'Sexta-feira' },
  { id: 6, name: 'Sábado' },
];

interface DaySchedule {
  id: number;
  name: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakStart: string;
  breakEnd: string;
}

export default function BarbershopScheduleScreen({ navigation }: any) {
  const [schedules, setSchedules] = useState<DaySchedule[]>(
    DAYS.map(day => ({
      ...day,
      isOpen: day.id !== 0, // Fechado no domingo por padrão
      openTime: '08:00',
      closeTime: '18:00',
      breakStart: '12:00',
      breakEnd: '13:00',
    }))
  );

  const toggleDay = (dayId: number) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === dayId 
        ? { ...schedule, isOpen: !schedule.isOpen }
        : schedule
    ));
  };

  const updateSchedule = (dayId: number, field: keyof DaySchedule, value: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === dayId 
        ? { ...schedule, [field]: value }
        : schedule
    ));
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleSave = async () => {
    const openDays = schedules.filter(s => s.isOpen);
    if (openDays.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um dia de funcionamento');
      return;
    }

    try {
      const daysOfWeek = JSON.stringify(openDays.map(s => s.id));
      const openTime = timeToMinutes(openDays[0].openTime); // Usando primeiro dia como padrão
      const closeTime = timeToMinutes(openDays[0].closeTime);
      const breakStart = timeToMinutes(openDays[0].breakStart);
      const breakEnd = timeToMinutes(openDays[0].breakEnd);

      const scheduleData = {
        barbershopId: '716f3577-4b85-4e25-977d-f0cfa2f4b356',
        daysOfWeek,
        openTime,
        closeTime,
        breakingTimes: [{
          startingTime: breakStart,
          endingTime: breakEnd
        }]
      };

      await scheduleService.create(scheduleData);
      
      Alert.alert('Sucesso', 'Horários salvos com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar os horários');
    }
  };

  const renderDaySchedule = (schedule: DaySchedule) => (
    <View key={schedule.id} style={styles.dayCard}>
      <View style={styles.dayHeader}>
        <TouchableOpacity 
          style={styles.dayToggle}
          onPress={() => toggleDay(schedule.id)}
        >
          <Text style={[styles.dayName, schedule.isOpen && styles.dayNameActive]}>
            {schedule.name}
          </Text>
          <View style={[styles.toggleButton, schedule.isOpen && styles.toggleButtonActive]}>
            {schedule.isOpen && (
              <Ionicons name="checkmark" size={16} color={theme.colors.background} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {schedule.isOpen && (
        <View style={styles.timeInputs}>
          <View style={styles.timeRow}>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>Abertura</Text>
              <TextInput
                style={styles.input}
                value={schedule.openTime}
                onChangeText={(value) => updateSchedule(schedule.id, 'openTime', value)}
                placeholder="08:00"
              />
            </View>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>Fechamento</Text>
              <TextInput
                style={styles.input}
                value={schedule.closeTime}
                onChangeText={(value) => updateSchedule(schedule.id, 'closeTime', value)}
                placeholder="18:00"
              />
            </View>
          </View>

          <View style={styles.timeRow}>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>Início Intervalo</Text>
              <TextInput
                style={styles.input}
                value={schedule.breakStart}
                onChangeText={(value) => updateSchedule(schedule.id, 'breakStart', value)}
                placeholder="12:00"
              />
            </View>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>Fim Intervalo</Text>
              <TextInput
                style={styles.input}
                value={schedule.breakEnd}
                onChangeText={(value) => updateSchedule(schedule.id, 'breakEnd', value)}
                placeholder="13:00"
              />
            </View>
          </View>
        </View>
      )}

      {!schedule.isOpen && (
        <View style={styles.closedIndicator}>
          <Text style={styles.closedText}>Fechado</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Horário da Barbearia</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configure os horários para cada dia</Text>
          {schedules.map(renderDaySchedule)}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar Horários</Text>
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  dayCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  dayHeader: {
    marginBottom: theme.spacing.sm,
  },
  dayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayName: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: '500',
  },
  dayNameActive: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  toggleButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  timeInputs: {
    marginTop: theme.spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: theme.fontSize.sm,
    color: '#999',
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  closedIndicator: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  closedText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
});