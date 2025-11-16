import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const DAYS = [
  { id: 0, name: 'Domingo' },
  { id: 1, name: 'Segunda-feira' },
  { id: 2, name: 'Terça-feira' },
  { id: 3, name: 'Quarta-feira' },
  { id: 4, name: 'Quinta-feira' },
  { id: 5, name: 'Sexta-feira' },
  { id: 6, name: 'Sábado' },
];

export default function BarberScheduleDetailScreen({ route, navigation }: any) {
  const { barberId, barberName } = route.params;
  
  const [schedules, setSchedules] = useState(
    DAYS.map(day => ({
      ...day,
      isOpen: day.id !== 0,
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

  const updateSchedule = (dayId: number, field: string, value: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === dayId 
        ? { ...schedule, [field]: value }
        : schedule
    ));
  };

  const handleSave = () => {
    Alert.alert('Sucesso', `Horários de ${barberName} salvos com sucesso!`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{barberName}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horários de Trabalho</Text>
          {schedules.map(schedule => (
            <View key={schedule.id} style={styles.dayCard}>
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

              {schedule.isOpen && (
                <View style={styles.timeInputs}>
                  <View style={styles.timeRow}>
                    <View style={styles.timeInput}>
                      <Text style={styles.timeLabel}>Início</Text>
                      <TextInput
                        style={styles.input}
                        value={schedule.openTime}
                        onChangeText={(value) => updateSchedule(schedule.id, 'openTime', value)}
                        placeholder="08:00"
                      />
                    </View>
                    <View style={styles.timeInput}>
                      <Text style={styles.timeLabel}>Fim</Text>
                      <TextInput
                        style={styles.input}
                        value={schedule.closeTime}
                        onChangeText={(value) => updateSchedule(schedule.id, 'closeTime', value)}
                        placeholder="18:00"
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))}
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