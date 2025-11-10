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
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { serviceService } from '../services/api';
import { theme } from '../styles/theme';

interface Service {
  name: string;
  price: number;
  time_taken: number;
}

export default function CreateServicesScreen({ navigation, route }: any) {
  const { barbershopId, isFromManage } = route.params || {};
  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [timeTaken, setTimeTaken] = useState('');
  const [loading, setLoading] = useState(false);

  // Recarregar a tela de gerenciar serviços quando voltar
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (isFromManage) {
        // Limpar serviços quando entrar na tela
        setServices([]);
      }
    });

    return unsubscribe;
  }, [navigation, isFromManage]);

  const addService = () => {
    if (!name || !price || !timeTaken) {
      Alert.alert('Erro', 'Preencha todos os campos do serviço');
      return;
    }

    const priceNumber = parseFloat(price.replace(',', '.'));
    const timeNumber = parseInt(timeTaken);

    if (isNaN(priceNumber) || priceNumber <= 0) {
      Alert.alert('Erro', 'Digite um preço válido');
      return;
    }

    if (isNaN(timeNumber) || timeNumber <= 0) {
      Alert.alert('Erro', 'Digite um tempo válido em minutos');
      return;
    }

    const newService: Service = {
      name,
      price: priceNumber,
      time_taken: timeNumber,
    };

    setServices([...services, newService]);
    setName('');
    setPrice('');
    setTimeTaken('');
  };

  const removeService = (index: number) => {
    const updatedServices = services.filter((_, i) => i !== index);
    setServices(updatedServices);
  };

  const handleContinue = async () => {
    if (services.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um serviço para continuar');
      return;
    }

    setLoading(true);
    try {
      // Criar todos os serviços
      for (const service of services) {
        await serviceService.create({ 
          name: service.name,
          price: service.price,
          timeTaken: service.time_taken,
          barbershopId 
        });
      }
      
      if (isFromManage) {
        Alert.alert('Sucesso', 'Serviços criados com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        navigation.navigate('CreateEmployees', { barbershopId });
      }
    } catch (error: any) {
      console.error('Erro ao criar serviços:', error);
      Alert.alert('Erro', 'Não foi possível criar os serviços');
    } finally {
      setLoading(false);
    }
  };

  const renderService = ({ item, index }: { item: Service; index: number }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceDetails}>
          R$ {item.price.toFixed(2)} • {item.time_taken} min
        </Text>
      </View>
      <TouchableOpacity onPress={() => removeService(index)}>
        <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      {isFromManage && (
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Adicionar Serviços</Text>
          <View style={{ width: 24 }} />
        </View>
      )}
      
      <View style={styles.header}>
        <Ionicons name="cut-outline" size={48} color={theme.colors.primary} />
        <Text style={styles.title}>Criar Serviços</Text>
        <Text style={styles.subtitle}>Adicione pelo menos um serviço</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Novo Serviço</Text>
        
        <View style={styles.inputContainer}>
          <Ionicons name="cut-outline" size={24} color={theme.colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Nome do serviço"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="cash-outline" size={24} color={theme.colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Preço (ex: 25.00)"
            placeholderTextColor="#999"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Tempo em minutos"
            placeholderTextColor="#999"
            value={timeTaken}
            onChangeText={setTimeTaken}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addService}>
          <Ionicons name="add" size={24} color={theme.colors.background} />
          <Text style={styles.addButtonText}>Adicionar Serviço</Text>
        </TouchableOpacity>

        {services.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Serviços Adicionados ({services.length})</Text>
            <FlatList
              data={services}
              renderItem={renderService}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={false}
            />
          </>
        )}

        <TouchableOpacity
          style={[
            styles.continueButton,
            (services.length === 0 || loading) && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={services.length === 0 || loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.background} />
          ) : (
            <Text style={styles.buttonText}>
              {isFromManage ? 'Criar' : `Continuar (${services.length} serviço${services.length !== 1 ? 's' : ''})`}
            </Text>
          )}
        </TouchableOpacity>
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
  serviceCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  serviceDetails: {
    color: '#999',
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  continueButton: {
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
});