import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { setAuthToken } from '../services/api';
import { theme } from '../styles/theme';
import { RootState } from '../store';
import { isBarbershopOwner } from '../utils/barbershop';

export default function ConfigScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [loadingOwnerCheck, setLoadingOwnerCheck] = useState(true);

  useEffect(() => {
    checkOwnerStatus();
  }, []);

  const checkOwnerStatus = async () => {
    try {
      const owner = await isBarbershopOwner();
      setIsOwner(owner);
    } catch (error) {
      console.error('Erro ao verificar status de dono:', error);
    } finally {
      setLoadingOwnerCheck(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setAuthToken(null);
    dispatch(logout());
    setShowLogoutModal(false);
  };

  const generateBookingLink = async () => {
    if (!user || !token) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    try {
      // Buscar dados da barbearia do usuário
      const response = await fetch('http://localhost:4000/api/barbershops', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados da barbearia');
      }

      const data = await response.json();
      
      if (!data.barbershops || data.barbershops.length === 0) {
        throw new Error('Nenhuma barbearia encontrada');
      }
      
      const barbershopId = data.barbershops[0].id;
      
      // Gerar link com JWT embutido
      const bookingUrl = `http://localhost:3001/booking/${barbershopId}?token=${encodeURIComponent(token)}`;
      
      setGeneratedLink(bookingUrl);
      setShowLinkModal(true);
    } catch (error) {
      console.error('Erro ao gerar link:', error);
      Alert.alert('Erro', 'Não foi possível gerar o link de agendamento');
    }
  };

  const copyLinkToClipboard = () => {
    Clipboard.setString(generatedLink);
    Alert.alert('Sucesso', 'Link copiado para a área de transferência!');
    setShowLinkModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Configurações</Text>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={32} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {isOwner && (
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
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gerenciar</Text>
          {isOwner && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={generateBookingLink}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="link-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.menuItemText}>Gerar Link de Agendamento</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
          )}
          {isOwner && (
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
          )}
          {isOwner && (
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
          )}
          {isOwner && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('ManageSchedule')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.menuItemText}>Horários de Funcionamento</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('CreateManualAppointment')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.menuItemText}>Agendamento Manual</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditProfile')}
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
              <Ionicons name="log-out-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.menuItemText, { color: theme.colors.primary }]}>Sair</Text>
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

      <Modal
        visible={showLinkModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Link de Agendamento</Text>
            <Text style={styles.modalText}>
              Compartilhe este link com seus clientes para que eles possam agendar horários:
            </Text>
            <View style={styles.linkContainer}>
              <Text style={styles.linkText} numberOfLines={3}>
                {generatedLink}
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowLinkModal(false)}
              >
                <Text style={styles.cancelButtonText}>Fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={copyLinkToClipboard}
              >
                <Text style={styles.copyButtonText}>Copiar Link</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerDate: {
    fontSize: theme.fontSize.sm,
    color: '#999',
    marginTop: theme.spacing.xs,
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
    maxWidth: '90%',
    maxHeight: '80%',
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
  linkContainer: {
    backgroundColor: '#333',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    maxHeight: 100,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  copyButton: {
    flex: 1,
    padding: theme.spacing.md,
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  copyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: theme.fontSize.md,
  },
});
