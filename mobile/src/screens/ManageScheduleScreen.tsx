import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export default function ManageScheduleScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Horários</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurar Horários</Text>
          
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => navigation.navigate('BarbershopSchedule')}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="business-outline" size={24} color={theme.colors.primary} />
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Horário da Barbearia</Text>
                <Text style={styles.optionDescription}>Definir dias e horários de funcionamento</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => navigation.navigate('BarberSchedule')}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="people-outline" size={24} color={theme.colors.primary} />
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Horário dos Barbeiros</Text>
                <Text style={styles.optionDescription}>Configurar horários individuais de cada barbeiro</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        </View>
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
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
  },
  optionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  optionTitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  optionDescription: {
    fontSize: theme.fontSize.sm,
    color: '#999',
    marginTop: theme.spacing.xs,
  },
});