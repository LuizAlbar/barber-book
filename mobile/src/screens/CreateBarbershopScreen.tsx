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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { barbershopService } from '../services/api';
import { theme } from '../styles/theme';

export default function CreateBarbershopScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [referencePoint, setReferencePoint] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateBarbershop = async () => {
    if (!name || !fullAddress || !neighborhood) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const barbershopData = {
        name,
        fullAddress,
        neighborhood,
        referencePoint: referencePoint || undefined,
      };

      const response = await barbershopService.create(barbershopData);
      navigation.navigate('CreateServices', { barbershopId: response.barbershop.id });
    } catch (error: any) {
      console.error('Erro ao criar barbearia:', error);
      Alert.alert('Erro', 'Não foi possível criar a barbearia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Ionicons name="storefront-outline" size={48} color={theme.colors.primary} />
        <Text style={styles.title}>Criar Barbearia</Text>
        <Text style={styles.subtitle}>Configure sua primeira barbearia</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="storefront-outline" size={24} color={theme.colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Nome da barbearia *"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={24} color={theme.colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Endereço completo *"
            placeholderTextColor="#999"
            value={fullAddress}
            onChangeText={setFullAddress}
            multiline
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="map-outline" size={24} color={theme.colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Bairro *"
            placeholderTextColor="#999"
            value={neighborhood}
            onChangeText={setNeighborhood}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="flag-outline" size={24} color={theme.colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Ponto de referência (opcional)"
            placeholderTextColor="#999"
            value={referencePoint}
            onChangeText={setReferencePoint}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreateBarbershop}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.background} />
          ) : (
            <Text style={styles.buttonText}>Continuar</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.requiredText}>* Campos obrigatórios</Text>
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
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  requiredText: {
    color: '#999',
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});