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
import { serviceService } from '../services/api';
import { theme } from '../styles/theme';

export default function EditServiceScreen({ navigation, route }: any) {
  const { serviceId, serviceName, servicePrice, serviceTimeTaken } = route.params;
  const [name, setName] = useState(serviceName || '');
  const [price, setPrice] = useState(servicePrice ? servicePrice.toString().replace('.', ',') : '');
  const [timeTaken, setTimeTaken] = useState(serviceTimeTaken ? serviceTimeTaken.toString() : '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !price || !timeTaken) {
      Alert.alert('Erro', 'Preencha todos os campos');
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

    setLoading(true);
    try {
      await serviceService.update(serviceId, {
        name,
        price: priceNumber,
        timeTaken: timeNumber,
      });
      Alert.alert('Sucesso', 'Serviço atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Erro ao atualizar serviço:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o serviço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Serviço</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formContainer}>
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
            placeholder="Preço (ex: 25,00)"
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

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.background} />
          ) : (
            <>
              <Ionicons name="checkmark" size={24} color={theme.colors.background} />
              <Text style={styles.buttonText}>Salvar Alterações</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  formContainer: {
    padding: theme.spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
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
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});