import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { authService, setAuthToken, testConnection } from '../services/api';
import { setCredentials } from '../store/authSlice';
import { theme } from '../styles/theme';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const dispatch = useDispatch();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    const isConnected = await testConnection();
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    console.log('🔐 Iniciando processo de login...');
    setLoading(true);
    
    try {
      const response = await authService.login({ email, password });
      setAuthToken(response.token);
      dispatch(setCredentials({ user: response.user, token: response.token }));
      console.log('✅ Login realizado com sucesso, redirecionando...');
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      
      let errorMessage = 'Erro ao fazer login';
      
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e se o servidor está rodando.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Timeout na conexão. Tente novamente.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Email ou senha incorretos.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Erro no Login', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.formContainer}>
        <Text style={styles.title}>ENTRAR</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={24} color={theme.colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

        {connectionStatus === 'disconnected' && (
          <View style={styles.connectionWarning}>
            <Ionicons name="warning-outline" size={20} color={theme.colors.warning} />
            <Text style={styles.connectionWarningText}>
              Sem conexão com o servidor. 
            </Text>
            <TouchableOpacity onPress={checkConnection}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, connectionStatus === 'disconnected' && styles.buttonDisabled]} 
          onPress={handleLogin} 
          disabled={loading || connectionStatus === 'disconnected'}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.background} />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        {connectionStatus === 'checking' && (
          <View style={styles.connectionStatus}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.connectionStatusText}>Verificando conexão...</Text>
          </View>
        )}

        {connectionStatus === 'connected' && (
          <View style={styles.connectionStatus}>
            <Ionicons name="checkmark-circle-outline" size={16} color={theme.colors.success} />
            <Text style={[styles.connectionStatusText, { color: theme.colors.success }]}>Conectado ao servidor</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.signupLinkText}>
            Não tem uma conta? <Text style={styles.signupLinkBold}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: theme.spacing.xl,
  },
  formContainer: {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
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
  forgotPassword: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
  },
  signupLink: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  signupLinkText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
  },
  signupLinkBold: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  connectionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning + '20',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  connectionWarningText: {
    color: theme.colors.warning,
    fontSize: theme.fontSize.sm,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
  retryText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: theme.colors.card,
    opacity: 0.6,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  connectionStatusText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    marginLeft: theme.spacing.xs,
  },
});
