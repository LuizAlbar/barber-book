import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export default function DashboardScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Ionicons name="trending-up" size={32} color={theme.colors.success} />
            <Text style={styles.cardValue}>R$ 0,00</Text>
            <Text style={styles.cardLabel}>Receitas</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="trending-down" size={32} color={theme.colors.error} />
            <Text style={styles.cardValue}>R$ 0,00</Text>
            <Text style={styles.cardLabel}>Despesas</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adicionar Movimentação</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.success }]}>
              <Ionicons name="add-circle-outline" size={24} color="#FFF" />
              <Text style={styles.addButtonText}>Receita</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.error }]}>
              <Ionicons name="remove-circle-outline" size={24} color="#FFF" />
              <Text style={styles.addButtonText}>Despesa</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimas Movimentações</Text>
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>Nenhuma movimentação registrada</Text>
          </View>
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
});
