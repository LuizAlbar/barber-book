import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { employeeService } from '../services/api';
import { theme } from '../styles/theme';

export default function ManageEmployeesScreen({ navigation }: any) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEmployees = async () => {
    try {
      const response = await employeeService.list('716f3577-4b85-4e25-977d-f0cfa2f4b356');
      setEmployees(response.employees || []);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEmployees();
    });
    return unsubscribe;
  }, [navigation]);

  const renderEmployee = ({ item }: { item: any }) => (
    <View style={styles.employeeCard}>
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{item.name}</Text>
        <Text style={styles.employeeDetails}>{item.email}</Text>
        <Text style={styles.employeeDetails}>{item.phone} • {item.role}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => Alert.alert('Remover', `Remover ${item.name}?`)}
      >
        <Ionicons name="person-remove" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Funcionários</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateEmployees', { barbershopId: '716f3577-4b85-4e25-977d-f0cfa2f4b356', isFromManage: true })}>
          <Ionicons name="person-add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Carregando...</Text>
        </View>
      ) : employees.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#666" />
          <Text style={styles.emptyText}>Nenhum funcionário cadastrado</Text>
        </View>
      ) : (
        <FlatList
          data={employees}
          renderItem={renderEmployee}
          keyExtractor={(item) => item.id}
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
  employeeCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  employeeDetails: {
    color: '#999',
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  removeButton: {
    padding: theme.spacing.sm,
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