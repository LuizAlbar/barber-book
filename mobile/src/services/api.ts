import axios from 'axios';
import { Platform } from 'react-native';
import { getApiUrl, API_CONFIG } from '../config/api.config';

const API_URL = getApiUrl();

console.log('🌐 API URL configurada:', API_URL);
console.log('📱 Plataforma:', Platform.OS);
console.log('🔧 Modo desenvolvimento:', __DEV__);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT,
  validateStatus: (status) => {
    return status >= 200 && status < 300;
  },
});

// Interceptor para logs de requisições
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para logs de respostas
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    const errorInfo = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'N/A',
      code: error.code,
      isNetworkError: error.code === 'NETWORK_ERROR' || error.message.includes('Network Error'),
      isTimeoutError: error.code === 'ECONNABORTED'
    };
    
    console.error('❌ API Response Error:', errorInfo);
    
    if (errorInfo.isNetworkError) {
      console.error('🌐 Erro de rede detectado. Verifique se o backend está rodando e a URL está correta.');
    }
    
    if (errorInfo.isTimeoutError) {
      console.error('⏰ Timeout da requisição. O servidor pode estar lento ou indisponível.');
    }
    
    return Promise.reject(error);
  }
);

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Token de autenticação definido');
  } else {
    delete api.defaults.headers.common['Authorization'];
    console.log('🚪 Token de autenticação removido');
  }
};

// Função para testar conectividade
export const testConnection = async () => {
  try {
    console.log('🔍 Testando conectividade com o backend...');
    // Testa a rota raiz sem /api
    const response = await axios.get(API_URL.replace('/api', ''));
    console.log('✅ Conectividade OK:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Falha na conectividade:', error);
    return false;
  }
};

export const authService = {
  signup: async (data: { name: string; email: string; password: string }) => {
    try {
      console.log('📝 Tentando fazer signup com:', { name: data.name, email: data.email });
      const response = await api.post('/auth/signup', data);
      console.log('✅ Signup realizado com sucesso');
      return response.data;
    } catch (error) {
      console.error('❌ Erro no signup:', error);
      throw error;
    }
  },
  login: async (data: { email: string; password: string }) => {
    try {
      console.log('🔐 Tentando fazer login com:', { email: data.email });
      const response = await api.post('/auth/login', data);
      console.log('✅ Login realizado com sucesso');
      return response.data;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  },
  getProfile: async () => {
    try {
      console.log('👤 Buscando perfil do usuário');
      const response = await api.get('/auth/profile');
      console.log('✅ Perfil obtido com sucesso');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar perfil:', error);
      throw error;
    }
  },
};

// Teste de conectividade na inicialização
if (__DEV__) {
  setTimeout(() => {
    testConnection();
  }, 1000);
}

export const barbershopService = {
  create: async (data: any) => {
    const response = await api.post('/barbershops', data);
    return response.data;
  },
  list: async (page = 1) => {
    const response = await api.get(`/barbershops?page=${page}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/barbershops/${id}`);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/barbershops/${id}`, data);
    return response.data;
  },
};

export const appointmentService = {
  create: async (data: any) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },
  list: async (barbershopId: string, date?: string, page = 1) => {
    const params = new URLSearchParams({ barbershopId, page: page.toString() });
    if (date) params.append('date', date);
    const response = await api.get(`/appointments?${params}`);
    return response.data;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },
};

export const capitalService = {
  create: async (data: any) => {
    const response = await api.post('/capital', data);
    return response.data;
  },
  list: async (barbershopId: string, type?: string, page = 1) => {
    const params = new URLSearchParams({ barbershopId, page: page.toString() });
    if (type) params.append('type', type);
    const response = await api.get(`/capital?${params}`);
    return response.data;
  },
};

export const serviceService = {
  create: async (data: any) => {
    const response = await api.post('/services', data);
    return response.data;
  },
  list: async (barbershopId: string, page = 1) => {
    const response = await api.get(`/services?barbershopId=${barbershopId}&page=${page}`);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/services/${id}`);
  },
};
