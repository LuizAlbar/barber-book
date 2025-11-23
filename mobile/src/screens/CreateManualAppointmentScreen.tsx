import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { appointmentService, employeeService, serviceService } from '../services/api';
import { theme } from '../styles/theme';
import { getBarbershopIdOrError } from '../utils/barbershop';

interface Employee {
  id: string;
  user: {
    name: string;
  };
}

interface Service {
  id: string;
  name: string;
  price: number;
  time_taken: number;
}

export default function CreateManualAppointmentScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [barbershopId, setBarbershopId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      
      // Buscar barbershopId do usuário logado
      const shopId = await getBarbershopIdOrError();
      setBarbershopId(shopId);
      
      // Buscar funcionários e serviços
      const [employeesResponse, servicesResponse] = await Promise.all([
        employeeService.list(shopId),
        serviceService.list(shopId),
      ]);
      
      setEmployees(employeesResponse.employees || []);
      setServices(servicesResponse.services || []);
      
      if (employeesResponse.employees.length === 0) {
        Alert.alert('Aviso', 'Nenhum funcionário cadastrado. Adicione funcionários antes de criar agendamentos.');
      }
      
      if (servicesResponse.services.length === 0) {
        Alert.alert('Aviso', 'Nenhum serviço cadastrado. Adicione serviços antes de criar agendamentos.');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      if (error instanceof Error && error.message !== 'BarbershopId não encontrado') {
        Alert.alert('Erro', 'Não foi possível carregar os dados necessários');
      }
      navigation.goBack();
    } finally {
      setLoadingData(false);
    }
  };

  const formatDate = (dateStr: string) => {
    // Formato esperado: DD/MM/YYYY
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // JavaScript months are 0-indexed
    const year = parseInt(parts[2]);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month, day);
  };

  const formatTime = (timeStr: string) => {
    // Formato esperado: HH:MM
    const parts = timeStr.split(':');
    if (parts.length !== 2) return null;
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return { hours, minutes };
  };

  const handleCreate = async () => {
    if (!selectedEmployee) {
      Alert.alert('Erro', 'Selecione um funcionário');
      return;
    }
    
    if (!selectedService) {
      Alert.alert('Erro', 'Selecione um serviço');
      return;
    }
    
    if (!clientName || clientName.length < 2) {
      Alert.alert('Erro', 'Digite o nome do cliente (mínimo 2 caracteres)');
      return;
    }
    
    if (!clientContact || clientContact.length < 10) {
      Alert.alert('Erro', 'Digite o contato do cliente (mínimo 10 caracteres)');
      return;
    }
    
    if (!date) {
      Alert.alert('Erro', 'Digite a data do agendamento (DD/MM/YYYY)');
      return;
    }
    
    if (!time) {
      Alert.alert('Erro', 'Digite a hora do agendamento (HH:MM)');
      return;
    }
    
    const dateObj = formatDate(date);
    if (!dateObj || isNaN(dateObj.getTime())) {
      Alert.alert('Erro', 'Data inválida. Use o formato DD/MM/YYYY');
      return;
    }
    
    const timeObj = formatTime(time);
    if (!timeObj) {
      Alert.alert('Erro', 'Hora inválida. Use o formato HH:MM');
      return;
    }
    
    // Combinar data e hora
    const datetime = new Date(dateObj);
    datetime.setHours(timeObj.hours, timeObj.minutes, 0, 0);
    
    // Verificar se a data/hora não é no passado
    if (datetime < new Date()) {
      Alert.alert('Erro', 'Não é possível agendar para uma data/hora no passado');
      return;
    }
    
    setLoading(true);
    try {
      await appointmentService.create({
        employeeId: selectedEmployee.id,
        serviceId: selectedService.id,
        clientName,
        clientContact,
        datetime: datetime.toISOString(),
      });
      
      Alert.alert('Sucesso', 'Agendamento criado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      const errorMessage = error.response?.data?.message || 'Não foi possível criar o agendamento';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderEmployeeItem = ({ item }: { item: Employee }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        setSelectedEmployee(item);
        setShowEmployeeModal(false);
      }}
    >
      <Text style={styles.modalItemText}>{item.user.name}</Text>
      {selectedEmployee?.id === item.id && (
        <Ionicons name="checkmark" size={24} color={theme.colors.primary} />
      )}
    </TouchableOpacity>
  );

  const renderServiceItem = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        setSelectedService(item);
        setShowServiceModal(false);
      }}
    >
      <View style={styles.serviceItemContent}>
        <Text style={styles.modalItemText}>{item.name}</Text>
        <Text style={styles.servicePrice}>
          R$ {item.price.toFixed(2)} • {item.time_taken} min
        </Text>
      </View>
      {selectedService?.id === item.id && (
        <Ionicons name="checkmark" size={24} color={theme.colors.primary} />
      )}
    </TouchableOpacity>
  );

  if (loadingData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendamento Manual</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.header}>
        <Ionicons name="calendar-outline" size={48} color={theme.colors.primary} />
        <Text style={styles.title}>Criar Agendamento</Text>
        <Text style={styles.subtitle}>Adicione um compromisso manualmente</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Dados do Agendamento</Text>

        {/* Seleção de Funcionário */}
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowEmployeeModal(true)}
        >
          <View style={styles.selectButtonContent}>
            <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
            <View style={styles.selectButtonTextContainer}>
              <Text style={styles.selectButtonLabel}>Funcionário</Text>
              <Text style={styles.selectButtonValue}>
                {selectedEmployee ? selectedEmployee.user.name : 'Selecione um funcionário'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-down" size={24} color="#999" />
        </TouchableOpacity>

        {/* Seleção de Serviço */}
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowServiceModal(true)}
        >
          <View style={styles.selectButtonContent}>
            <Ionicons name="cut-outline" size={24} color={theme.colors.primary} />
            <View style={styles.selectButtonTextContainer}>
              <Text style={styles.selectButtonLabel}>Serviço</Text>
              <Text style={styles.selectButtonValue}>
                {selectedService ? `${selectedService.name} - R$ ${selectedService.price.toFixed(2)}` : 'Selecione um serviço'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-down" size={24} color="#999" />
        </TouchableOpacity>

        {/* Nome do Cliente */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Nome do cliente"
            placeholderTextColor="#999"
            value={clientName}
            onChangeText={setClientName}
          />
        </View>

        {/* Contato do Cliente */}
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={24} color={theme.colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Contato (telefone/WhatsApp)"
            placeholderTextColor="#999"
            value={clientContact}
            onChangeText={setClientContact}
            keyboardType="phone-pad"
          />
        </View>

        {/* Data */}
        <View style={styles.inputContainer}>
          <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Data (DD/MM/YYYY)"
            placeholderTextColor="#999"
            value={date}
            onChangeText={setDate}
            keyboardType="numeric"
          />
        </View>

        {/* Hora */}
        <View style={styles.inputContainer}>
          <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Hora (HH:MM)"
            placeholderTextColor="#999"
            value={time}
            onChangeText={setTime}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.background} />
          ) : (
            <Text style={styles.buttonText}>Criar Agendamento</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal de Seleção de Funcionário */}
      <Modal
        visible={showEmployeeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmployeeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o Funcionário</Text>
              <TouchableOpacity onPress={() => setShowEmployeeModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={employees}
              renderItem={renderEmployeeItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={() => (
                <View style={styles.emptyModal}>
                  <Text style={styles.emptyModalText}>Nenhum funcionário disponível</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Serviço */}
      <Modal
        visible={showServiceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowServiceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o Serviço</Text>
              <TouchableOpacity onPress={() => setShowServiceModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={services}
              renderItem={renderServiceItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={() => (
                <View style={styles.emptyModal}>
                  <Text style={styles.emptyModalText}>Nenhum serviço disponível</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    fontWeight: 'bold',
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
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  selectButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectButtonTextContainer: {
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  selectButtonLabel: {
    fontSize: theme.fontSize.sm,
    color: '#999',
    marginBottom: theme.spacing.xs,
  },
  selectButtonValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
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
  createButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
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
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: '70%',
    paddingBottom: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalItemText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    flex: 1,
  },
  serviceItemContent: {
    flex: 1,
  },
  servicePrice: {
    fontSize: theme.fontSize.sm,
    color: '#999',
    marginTop: theme.spacing.xs,
  },
  emptyModal: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyModalText: {
    color: '#999',
    fontSize: theme.fontSize.md,
  },
});

