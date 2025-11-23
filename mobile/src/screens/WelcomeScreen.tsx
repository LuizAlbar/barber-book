import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { theme } from '../styles/theme';
import { invitationService, authService } from '../services/api';
import { RootState } from '../store';
import { completeOnboarding } from '../store/authSlice';

interface Invitation {
  id: string;
  userEmail: string;
  role: 'BARBEIRO' | 'ATENDENTE';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  barbershop: {
    id: string;
    name: string;
    neighborhood: string;
  };
}

export default function WelcomeScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const response = await invitationService.list();
      setInvitations(response.invitations || []);
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAccept = async (invitationId: string) => {
    try {
      const response = await invitationService.accept(invitationId);
      console.log('Convite aceito com sucesso:', response);
      
      // Atualizar o estado do Redux para marcar que o usuário não precisa mais de onboarding
      // (já que ele agora é funcionário de uma barbearia)
      dispatch(completeOnboarding());
      
      // Atualizar o perfil do usuário para garantir que hasBarbershop está correto
      try {
        const profile = await authService.getProfile();
        if (profile.user.employees && profile.user.employees.length > 0) {
          dispatch(completeOnboarding());
        }
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
      }
      
      // Redirecionar diretamente para a tela de Appointments
      navigation.replace('Appointments');
    } catch (error: any) {
      console.error('Erro ao aceitar convite:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Não foi possível aceitar o convite';
      const errorDetails = error.response?.data?.details ? `\n\nDetalhes: ${JSON.stringify(error.response.data.details)}` : '';
      Alert.alert('Erro', errorMessage + errorDetails);
      
      // Recarregar convites em caso de erro para atualizar a lista
      loadInvitations();
    }
  };

  const handleReject = async (invitationId: string) => {
    Alert.alert(
      'Rejeitar Convite',
      'Tem certeza que deseja rejeitar este convite?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: async () => {
            try {
              await invitationService.reject(invitationId);
              loadInvitations();
              Alert.alert('Sucesso', 'Convite rejeitado');
            } catch (error: any) {
              console.error('Erro ao rejeitar convite:', error);
              Alert.alert('Erro', 'Não foi possível rejeitar o convite');
            }
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInvitations();
  };

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.content}>
        <Text style={styles.title}>Bem-vindo ao BarberBook!</Text>
        <Text style={styles.subtitle}>
          Você ainda não possui uma barbearia cadastrada.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : invitations.length > 0 ? (
          <View style={styles.invitationsContainer}>
            <Text style={styles.invitationsTitle}>Convites Pendentes</Text>
            {invitations.map((invitation) => (
              <View key={invitation.id} style={styles.invitationCard}>
                <View style={styles.invitationHeader}>
                  <Ionicons name="storefront" size={24} color={theme.colors.primary} />
                  <View style={styles.invitationInfo}>
                    <Text style={styles.invitationBarbershopName}>{invitation.barbershop.name}</Text>
                    <Text style={styles.invitationDetails}>
                      {invitation.barbershop.neighborhood} • {invitation.role}
                    </Text>
                  </View>
                </View>
                <View style={styles.invitationActions}>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleReject(invitation.id)}
                  >
                    <Ionicons name="close" size={20} color={theme.colors.error} />
                    <Text style={styles.rejectButtonText}>Rejeitar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAccept(invitation.id)}
                  >
                    <Ionicons name="checkmark" size={20} color={theme.colors.background} />
                    <Text style={styles.acceptButtonText}>Aceitar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('CreateBarbershop')}
          >
            <Ionicons name="storefront-outline" size={24} color={theme.colors.background} />
            <Text style={styles.primaryButtonText}>Criar minha primeira barbearia</Text>
          </TouchableOpacity>
        </View>

        {invitations.length === 0 && !loading && (
          <Text style={styles.helpText}>
            Se você é funcionário de uma barbearia, aguarde o dono te convidar através do seu email.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: theme.spacing.xl,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSize.xxl,
    color: theme.colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: '#999',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  optionsContainer: {
    width: '100%',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: theme.fontSize.sm,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  loader: {
    marginVertical: theme.spacing.xl,
  },
  invitationsContainer: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  invitationsTitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  invitationCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  invitationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  invitationInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  invitationBarbershopName: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  invitationDetails: {
    fontSize: theme.fontSize.sm,
    color: '#999',
    marginTop: theme.spacing.xs,
  },
  invitationActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  acceptButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  rejectButtonText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
  },
});