import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { completeOnboarding } from '../store/authSlice';
import { RootState } from '../store';
import { theme } from '../styles/theme';

interface BreakingTime {
  starting_time: string;
  ending_time: string;
}

interface Schedule {
  days_of_week: number[];
  open_time: string;
  close_time: string;
  breaking_times: BreakingTime[];
}

const DAYS_OF_WEEK = [
  { id: 1, name: 'Segunda', short: 'SEG' },
  { id: 2, name: 'Terça', short: 'TER' },
  { id: 3, name: 'Quarta', short: 'QUA' },
  { id: 4, name: 'Quinta', short: 'QUI' },
  { id: 5, name: 'Sexta', short: 'SEX' },
  { id: 6, name: 'Sábado', short: 'SAB' },
  { id: 0, name: 'Domingo', short: 'DOM' },
];

const TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00',
];

export default function CreateScheduleScreen({ navigation, route }: any) {
  const dispatch = useDispatch();
  const { barbershopId } = route.params;
  const token = useSelector((state: RootState) => state.auth.token);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('18:00');
  const [breakingTimes, setBreakingTimes] = useState<BreakingTime[]>([]);
  const [showOpenTimeModal, setShowOpenTimeModal] = useState(false);
  const [showCloseTimeModal, setShowCloseTimeModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState('12:00');
  const [breakEndTime, setBreakEndTime] = useState('13:00');
  const [loading, setLoading] = useState(false);

  const toggleDay = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(id => id !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const addBreakingTime = () => {
    if (breakStartTime >= breakEndTime) {
      Alert.alert('Erro', 'Horário de início deve ser menor que o de fim');
      return;
    }

    const newBreak: BreakingTime = {
      starting_time: breakStartTime,
      ending_time: breakEndTime,
    };

    setBreakingTimes([...breakingTimes, newBreak]);
    setShowBreakModal(false);
    setBreakStartTime('12:00');
    setBreakEndTime('13:00');
  };

  const removeBreakingTime = (index: number) => {
    const updatedBreaks = breakingTimes.filter((_, i) => i !== index);
    setBreakingTimes(updatedBreaks);
  };

  const handleFinish = async () => {
    if (selectedDays.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um dia da semana');
      return;
    }

    if (openTime >= closeTime) {
      Alert.alert('Erro', 'Horário de abertura deve ser menor que o de fechamento');
      return;
    }

    setLoading(true);
    try {
      const scheduleData = {
        daysOfWeek: selectedDays,
        openTime,
        closeTime,
        barbershopId,
        breakingTimes: breakingTimes.map(bt => ({
          startingTime: bt.starting_time,
          endingTime: bt.ending_time
        }))
      };

      await fetch(`http://localhost:4000/api/schedules`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scheduleData)
      });
      
      // Marca o onboarding como completo
      dispatch(completeOnboarding());
      
      Alert.alert(
        'Sucesso!',
        'Sua barbearia foi configurada com sucesso!',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Erro ao criar horário:', error);
      Alert.alert('Erro', 'Não foi possível criar o horário');
    } finally {
      setLoading(false);
    }
  };

  const renderBreakingTime = ({ item, index }: { item: BreakingTime; index: number }) => (
    <View style={styles.breakCard}>
      <View style={styles.breakInfo}>
        <Text style={styles.breakText}>
          {item.starting_time} - {item.ending_time}
        </Text>
      </View>
      <TouchableOpacity onPress={() => removeBreakingTime(index)}>
        <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  const TimeModal = ({ 
    visible, 
    onClose, 
    onSelect, 
    selectedTime, 
    title 
  }: {
    visible: boolean;
    onClose: () => void;
    onSelect: (time: string) => void;
    selectedTime: string;
    title: string;
  }) => {
    if (!visible) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView style={styles.timeList}>
            {TIME_OPTIONS.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeOption,
                  selectedTime === time && styles.timeOptionSelected,
                ]}
                onPress={() => {
                  onSelect(time);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.timeOptionText,
                    selectedTime === time && styles.timeOptionTextSelected,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calendar-outline" size={48} color={theme.colors.primary} />
        <Text style={styles.title}>Horário de Funcionamento</Text>
        <Text style={styles.subtitle}>Configure os dias e horários</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Dias da Semana</Text>
        <View style={styles.daysContainer}>
          {DAYS_OF_WEEK.map((day) => (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.dayButton,
                selectedDays.includes(day.id) && styles.dayButtonActive,
              ]}
              onPress={() => toggleDay(day.id)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  selectedDays.includes(day.id) && styles.dayButtonTextActive,
                ]}
              >
                {day.short}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Horários</Text>
        <View style={styles.timeContainer}>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowOpenTimeModal(true)}
          >
            <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
            <View style={styles.timeButtonContent}>
              <Text style={styles.timeButtonLabel}>Abertura</Text>
              <Text style={styles.timeButtonValue}>{openTime}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowCloseTimeModal(true)}
          >
            <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
            <View style={styles.timeButtonContent}>
              <Text style={styles.timeButtonLabel}>Fechamento</Text>
              <Text style={styles.timeButtonValue}>{closeTime}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.breakSection}>
          <View style={styles.breakHeader}>
            <Text style={styles.sectionTitle}>Intervalos (Opcional)</Text>
            <TouchableOpacity
              style={styles.addBreakButton}
              onPress={() => setShowBreakModal(true)}
            >
              <Ionicons name="add" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {breakingTimes.length > 0 && (
            <FlatList
              data={breakingTimes}
              renderItem={renderBreakingTime}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={false}
            />
          )}
        </View>

        <TouchableOpacity
          style={[styles.finishButton, loading && styles.buttonDisabled]}
          onPress={handleFinish}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.background} />
          ) : (
            <Text style={styles.buttonText}>Finalizar Configuração</Text>
          )}
        </TouchableOpacity>
      </View>

      <TimeModal
        visible={showOpenTimeModal}
        onClose={() => setShowOpenTimeModal(false)}
        onSelect={setOpenTime}
        selectedTime={openTime}
        title="Horário de Abertura"
      />

      <TimeModal
        visible={showCloseTimeModal}
        onClose={() => setShowCloseTimeModal(false)}
        onSelect={setCloseTime}
        selectedTime={closeTime}
        title="Horário de Fechamento"
      />

      {showBreakModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configurar Intervalo</Text>
            
            <View style={styles.timeInputRow}>
              <View style={styles.timeInputContainer}>
                <Text style={styles.timeLabel}>Início:</Text>
                <TouchableOpacity
                  style={styles.timeSelector}
                  onPress={() => {
                    setShowBreakModal(false);
                    setTimeout(() => {
                      Alert.alert(
                        'Horário de Início',
                        'Selecione o horário',
                        TIME_OPTIONS.map(time => ({
                          text: time,
                          onPress: () => {
                            setBreakStartTime(time);
                            setShowBreakModal(true);
                          }
                        }))
                      );
                    }, 100);
                  }}
                >
                  <Text style={styles.timeSelectorText}>{breakStartTime}</Text>
                  <Ionicons name="chevron-down" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.timeInputContainer}>
                <Text style={styles.timeLabel}>Fim:</Text>
                <TouchableOpacity
                  style={styles.timeSelector}
                  onPress={() => {
                    setShowBreakModal(false);
                    setTimeout(() => {
                      Alert.alert(
                        'Horário de Fim',
                        'Selecione o horário',
                        TIME_OPTIONS.map(time => ({
                          text: time,
                          onPress: () => {
                            setBreakEndTime(time);
                            setShowBreakModal(true);
                          }
                        }))
                      );
                    }, 100);
                  }}
                >
                  <Text style={styles.timeSelectorText}>{breakEndTime}</Text>
                  <Ionicons name="chevron-down" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Prévia:</Text>
              <Text style={styles.previewText}>
                Intervalo de {breakStartTime} às {breakEndTime}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowBreakModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={addBreakingTime}
              >
                <Text style={styles.modalConfirmButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.lg,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: '#999',
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  dayButton: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minWidth: 50,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  dayButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  dayButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
  },
  dayButtonTextActive: {
    color: theme.colors.background,
  },
  timeContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  timeButton: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeButtonContent: {
    marginLeft: theme.spacing.sm,
  },
  timeButtonLabel: {
    color: '#999',
    fontSize: theme.fontSize.sm,
  },
  timeButtonValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  breakSection: {
    marginBottom: theme.spacing.lg,
  },
  breakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  addBreakButton: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  breakCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakInfo: {
    flex: 1,
  },
  breakText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  finishButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  timeList: {
    maxHeight: 300,
  },
  timeOption: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  timeOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  timeOptionText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    textAlign: 'center',
  },
  timeOptionTextSelected: {
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  modalCloseButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  timeInputRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  timeSelector: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeSelectorText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  previewContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  previewLabel: {
    color: '#999',
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  previewText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
});