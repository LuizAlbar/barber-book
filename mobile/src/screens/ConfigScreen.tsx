import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { setAuthToken } from '../services/api';
import { theme } from '../styles/theme';

export default function ConfigScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setAuthToken(null);
    dispatch(logout());
    setShowLogoutModal(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados da Barbearia</Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditBarbershop')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="business-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.menuItemText}>Editar Barbearia</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gerenciar</Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('ManageServices')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="cut-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.menuItemText}>Serviços</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('ManageEmployees')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="people-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.menuItemText}>Funcionários</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert('Horários', 'Tela de configuração em desenvolvimento')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.menuItemText}>Horários de Funcionamento</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert('Meu Perfil', 'Tela de edição em desenvolvimento')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.menuItemText}>Meu Perfil</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.7}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
              <Text style={[styles.menuItemText, { color: theme.colors.error }]}>Sair</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Appointments')}
        >
          <Ionicons name="calendar-outline" size={24} color="#999" />
          <Text style={styles.navLabel}>Agendamentos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Ionicons name="bar-chart-outline" size={24} color="#999" />
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="settings" size={24} color={theme.colors.primary} />
          <Text style={[styles.navLabel, { color: theme.colors.primary }]}>Config</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sair</Text>
            <Text style={styles.modalText}>
              Tem certeza que deseja sair?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={confirmLogout}
              >
                <Text style={styles.logoutButtonText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  menuItemText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  modalText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    marginRight: theme.spacing.sm,
    backgroundColor: '#666',
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  logoutButton: {
    flex: 1,
    padding: theme.spacing.md,
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
