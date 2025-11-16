import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { employeeService } from '../services/api';

export default function BarberScheduleScreen({ navigation }: any) {
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBarbers();
  }, []);

  const loadBarbers = async () => {
    try {
      const response = await employeeService.list('716f3577-4b85-4e25-977d-f0cfa2f4b356');
      const barbersOnly = response.employees.filter((emp: any) => emp.role === 'BARBEIRO');
      setBarbers(barbersOnly);
    } catch (error) {
      console.error('Erro ao carregar barbeiros:', error);
      Alert.alert('Erro', 'Não foi possível carregar os barbeiros');
    } finally {
      setLoading(false);
    }
  };

  const handleBarberSelect = (barberId: string, barberName: string) => {
    navigation.navigate('BarberScheduleDetail', { barberId, barberName });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Horário dos Barbeiros</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecione um Barbeiro</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Carregando barbeiros...</Text>
            </View>
          ) : barbers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="person-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>Nenhum barbeiro cadastrado</Text>
            </View>
          ) : (
            barbers.map(barber => (
              <TouchableOpacity
                key={barber.id}
                style={styles.barberCard}
                onPress={() => handleBarberSelect(barber.id, barber.user.name)}
              >
                <View style={styles.barberLeft}>
                  <Ionicons name="person-circle-outline" size={40} color={theme.colors.primary} />
                  <View style={styles.barberInfo}>
                    <Text style={styles.barberName}>{barber.user.name}</Text>
                    <Text style={styles.barberRole}>Barbeiro</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#999" />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            Configure os horários individuais de cada barbeiro para permitir agendamentos personalizados.
          </Text>
        </View>
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
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
  },
  barberCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  barberInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  barberName: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  barberRole: {
    fontSize: theme.fontSize.sm,
    color: '#999',
    marginTop: theme.spacing.xs,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: '#999',
    marginLeft: theme.spacing.md,
    flex: 1,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    color: '#999',
    fontSize: theme.fontSize.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    color: '#999',
    fontSize: theme.fontSize.md,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
});