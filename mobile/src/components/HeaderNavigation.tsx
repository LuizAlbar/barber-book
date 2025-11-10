import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

interface HeaderNavigationProps {
  navigation: any;
  currentScreen: string;
}

export default function HeaderNavigation({ navigation, currentScreen }: HeaderNavigationProps) {
  const navigateToScreen = (screenName: string) => {
    if (screenName !== currentScreen) {
      navigation.navigate(screenName);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, currentScreen === 'Appointments' && styles.activeButton]}
        onPress={() => navigateToScreen('Appointments')}
      >
        <Ionicons
          name={currentScreen === 'Appointments' ? 'calendar' : 'calendar-outline'}
          size={24}
          color={currentScreen === 'Appointments' ? theme.colors.background : theme.colors.primary}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, currentScreen === 'Dashboard' && styles.activeButton]}
        onPress={() => navigateToScreen('Dashboard')}
      >
        <Ionicons
          name={currentScreen === 'Dashboard' ? 'stats-chart' : 'stats-chart-outline'}
          size={24}
          color={currentScreen === 'Dashboard' ? theme.colors.background : theme.colors.primary}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, currentScreen === 'Config' && styles.activeButton]}
        onPress={() => navigateToScreen('Config')}
      >
        <Ionicons
          name={currentScreen === 'Config' ? 'settings' : 'settings-outline'}
          size={24}
          color={currentScreen === 'Config' ? theme.colors.background : theme.colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  button: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  activeButton: {
    backgroundColor: theme.colors.primary,
  },
});