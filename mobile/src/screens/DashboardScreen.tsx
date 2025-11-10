import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { capitalService } from '../services/api';
import AddCapitalModal from '../components/AddCapitalModal';
import { theme } from '../styles/theme';

export default function DashboardScreen({ navigation }: any) {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'PROFIT' | 'COST'>('PROFIT');
  const [capitalData, setCapitalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state: RootState) => state.auth.token);

  const loadCapitalData = async () => {
    try {
      const response = await capitalService.list('716f3577-4b85-4e25-977d-f0cfa2f4b356');
      setCapitalData(response.capital || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCapitalData();
  }, []);

  const handleAddCapital = async (data: { value: number; description: string; type: string }) => {
    try {
      await capitalService.create({
        value: data.value,
        type: data.type as 'PROFIT' | 'COST',
        description: data.description,
        barbershopId: '716f3577-4b85-4e25-977d-f0cfa2f4b356' // TODO: pegar barbershopId real do Redux
      });
      Alert.alert('Sucesso', `${data.type === 'PROFIT' ? 'Receita' : 'Despesa'} adicionada com sucesso!`);
      loadCapitalData(); // Recarregar dados
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar a movimentação');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Ionicons name="trending-up" size={32} color={theme.colors.success} />
            <Text style={styles.cardValue}>
              R$ {capitalData
                .filter(item => item.type === 'PROFIT')
                .reduce((sum, item) => sum + item.value, 0)
                .toFixed(2)
                .replace('.', ',')}
            </Text>
            <Text style={styles.cardLabel}>Receitas</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="trending-down" size={32} color={theme.colors.error} />
            <Text style={styles.cardValue}>
              R$ {capitalData
                .filter(item => item.type === 'COST')
                .reduce((sum, item) => sum + item.value, 0)
                .toFixed(2)
                .replace('.', ',')}
            </Text>
            <Text style={styles.cardLabel}>Despesas</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adicionar Movimentação</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: theme.colors.success }]}
              onPress={() => {
                setModalType('PROFIT');
                setShowModal(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={24} color="#FFF" />
              <Text style={styles.addButtonText}>Receita</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: theme.colors.error }]}
              onPress={() => {
                setModalType('COST');
                setShowModal(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="remove-circle-outline" size={24} color="#FFF" />
              <Text style={styles.addButtonText}>Despesa</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimas Movimentações</Text>
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Carregando...</Text>
            </View>
          ) : capitalData.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={64} color="#666" />
              <Text style={styles.emptyText}>Nenhuma movimentação registrada</Text>
            </View>
          ) : (
            capitalData.slice(0, 5).map((item, index) => (
              <View key={index} style={styles.movementCard}>
                <View style={styles.movementLeft}>
                  <Ionicons 
                    name={item.type === 'PROFIT' ? 'trending-up' : 'trending-down'} 
                    size={24} 
                    color={item.type === 'PROFIT' ? theme.colors.success : theme.colors.error} 
                  />
                  <View style={styles.movementInfo}>
                    <Text style={styles.movementDescription}>{item.description}</Text>
                    <Text style={styles.movementDate}>
                      {new Date(item.datetime).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                </View>
                <Text style={[
                  styles.movementValue,
                  { color: item.type === 'PROFIT' ? theme.colors.success : theme.colors.error }
                ]}>
                  {item.type === 'PROFIT' ? '+' : '-'}R$ {item.value.toFixed(2).replace('.', ',')}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Appointments')}
        >
          <Ionicons name="calendar-outline" size={24} color="#999" />
          <Text style={styles.navLabel}>Agendamentos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="bar-chart" size={24} color={theme.colors.primary} />
          <Text style={[styles.navLabel, { color: theme.colors.primary }]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Config')}
        >
          <Ionicons name="settings-outline" size={24} color="#999" />
          <Text style={styles.navLabel}>Config</Text>
        </TouchableOpacity>
      </View>

      <AddCapitalModal
        visible={showModal}
        type={modalType}
        onClose={() => setShowModal(false)}
        onAdd={handleAddCapital}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  summaryCards: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  cardValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  cardLabel: {
    fontSize: theme.fontSize.sm,
    color: '#999',
    marginTop: theme.spacing.xs,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
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
  movementCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  movementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  movementInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  movementDescription: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  movementDate: {
    color: '#999',
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  movementValue: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
});
