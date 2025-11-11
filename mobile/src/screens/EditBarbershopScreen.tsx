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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { barbershopService } from '../services/api';
import { theme } from '../styles/theme';

export default function EditBarbershopScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [referencePoint, setReferencePoint] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const barbershopId = '716f3577-4b85-4e25-977d-f0cfa2f4b356';

  useEffect(() => {
    loadBarbershopData();
  }, []);

  const loadBarbershopData = async () => {
    try {
      const response = await barbershopService.getById(barbershopId);
      const barbershop = response.barbershop;
      setName(barbershop.name);
      setFullAddress(barbershop.fullAddress);
      setNeighborhood(barbershop.neighborhood);
      setReferencePoint(barbershop.referencePoint || '');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados da barbearia');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async () => {
    if (!name || !fullAddress || !neighborhood) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      await barbershopService.update(barbershopId, {
        name,
        fullAddress,
        neighborhood,
        referencePoint: referencePoint || undefined,
      });
      Alert.alert('Sucesso', 'Barbearia atualizada com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a barbearia');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Barbearia</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputContainer}>
          <Ionicons name="storefront-outline" size={24} color={theme.colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Nome da barbearia *"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            multiline={name.length > 30}
            textAlignVertical={name.length > 30 ? "top" : "center"}
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
            multiline={fullAddress.length > 40}
            textAlignVertical={fullAddress.length > 40 ? "top" : "center"}
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
            multiline={neighborhood.length > 25}
            textAlignVertical={neighborhood.length > 25 ? "top" : "center"}
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
            multiline={referencePoint.length > 35}
            textAlignVertical={referencePoint.length > 35 ? "top" : "center"}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.background} />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>
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
    padding: theme.spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    marginLeft: theme.spacing.sm,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  saveButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
});