import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export default function AppointmentsScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Appointments</Text>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="calendar-outline" size={32} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <View style={[styles.summaryItem, { borderLeftColor: theme.colors.info }]}>
          <Text style={styles.summaryValue}>0</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={[styles.summaryItem, { borderLeftColor: theme.colors.warning }]}>
          <Text style={styles.summaryValue}>0</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
        <View style={[styles.summaryItem, { borderLeftColor: theme.colors.success }]}>
          <Text style={styles.summaryValue}>0</Text>
          <Text style={styles.summaryLabel}>Done</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Today's Appointments</Text>

      <View style={styles.emptyState}>
        <Ionicons name="calendar-outline" size={64} color="#666" />
        <Text style={styles.emptyText}>Nenhum agendamento para hoje</Text>
      </View>

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
});
