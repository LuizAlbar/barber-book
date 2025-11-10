import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { theme } from '../styles/theme';

interface Employee {
  phone_number: string;
  role: 'BARBEIRO' | 'ATENDENTE';
  user_email: string;
}

export default function CreateEmployeesScreen({ navigation, route }: any) {
  const { barbershopId } = route.params;
  const token = useSelector((state: RootState) => state.auth.token);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [role, setRole] = useState<'BARBEIRO' | 'ATENDENTE'>('BARBEIRO');
  const [loading, setLoading] = useState(false);

  const addEmployee = async () => {
    if (!phoneNumber || !userEmail) {
      Alert.alert('Erro', 'Preencha todos os campos do funcionário');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      Alert.alert('Erro', 'Digite um email válido');
      return;
    }

    try {
      // Verificar se o usuário existe
      const response = await fetch(`http://localhost:4000/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      
      if (!response.ok) {
        Alert.alert('Erro', 'Este email não está cadastrado no sistema. O usuário precisa se cadastrar primeiro.');
        return;
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível verificar o email');
      return;
    }

    const newEmployee: Employee = {
      phone_number: phoneNumber,
      role,
      user_email: userEmail,
    };

    setEmployees([...employees, newEmployee]);
    setPhoneNumber('');
    setUserEmail('');
    setRole('BARBEIRO');
  };

  const removeEmployee = (index: number) => {
    const updatedEmployees = employees.filter((_, i) => i !== index);
    setEmployees(updatedEmployees);
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      // Criar funcionários
      for (const employee of employees) {
        // Buscar userId pelo email
        const userResponse = await fetch(`http://localhost:4000/api/auth/user-by-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: employee.user_email })
        });
        const userData = await userResponse.json();
        
        await fetch(`http://localhost:4000/api/employees`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            phoneNumber: employee.phone_number,
            role: employee.role,
            userId: userData.user.id,
            barbershopId
          })
        });
      }
      navigation.navigate('CreateSchedule', { barbershopId });
    } catch (error: any) {
      console.error('Erro ao criar funcionários:', error);
      Alert.alert('Erro', 'Não foi possível criar os funcionários');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate('CreateSchedule', { barbershopId });
  };

  const renderEmployee = ({ item, index }: { item: Employee; index: number }) => (
    <View style={styles.employeeCard}>
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{item.user_email}</Text>
        <Text style={styles.employeeDetails}>
          {item.phone_number} • {item.role}
        </Text>
      </View>
      <TouchableOpacity onPress={() => removeEmployee(index)}>
        <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people-outline" size={48} color={theme.colors.primary} />
        <Text style={styles.title}>Adicionar Funcionários</Text>
        <Text style={styles.subtitle}>Opcional - você pode pular esta etapa</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Novo Funcionário</Text>
        
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={24} color={theme.colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Email do usuário"
            placeholderTextColor="#999"
            value={userEmail}
            onChangeText={setUserEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={24} color={theme.colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Telefone"
            placeholderTextColor="#999"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.roleLabel}>Função:</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === 'BARBEIRO' && styles.roleButtonActive,
            ]}
            onPress={() => setRole('BARBEIRO')}
          >
            <Ionicons
              name="cut-outline"
              size={20}
              color={role === 'BARBEIRO' ? theme.colors.background : theme.colors.primary}
            />
            <Text
              style={[
                styles.roleButtonText,
                role === 'BARBEIRO' && styles.roleButtonTextActive,
              ]}
            >
              Barbeiro
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              role === 'ATENDENTE' && styles.roleButtonActive,
            ]}
            onPress={() => setRole('ATENDENTE')}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={role === 'ATENDENTE' ? theme.colors.background : theme.colors.primary}
            />
            <Text
              style={[
                styles.roleButtonText,
                role === 'ATENDENTE' && styles.roleButtonTextActive,
              ]}
            >
              Atendente
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addEmployee}>
          <Ionicons name="add" size={24} color={theme.colors.background} />
          <Text style={styles.addButtonText}>Adicionar Funcionário</Text>
        </TouchableOpacity>

        {employees.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Funcionários Adicionados ({employees.length})</Text>
            <FlatList
              data={employees}
              renderItem={renderEmployee}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={false}
            />
          </>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Pular</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.continueButton, loading && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.background} />
            ) : (
              <Text style={styles.buttonText}>Continuar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    marginLeft: theme.spacing.sm,
  },
  roleLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.sm,
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  roleButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  roleButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    marginLeft: theme.spacing.sm,
  },
  roleButtonTextActive: {
    color: theme.colors.background,
  },
  addButton: {
    backgroundColor: theme.colors.info,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  addButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
  employeeCard: {
    backgroundColor: theme.colors.background,
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
  buttonContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  skipButton: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  skipButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  continueButton: {
    flex: 1,
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
});