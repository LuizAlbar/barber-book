import { Platform } from 'react-native';

// Configurações da API
export const API_CONFIG = {
  // URLs para diferentes ambientes
  PRODUCTION_URL: 'https://your-production-url.com/api',
  
  // URLs para desenvolvimento local
  DEVELOPMENT: {
    // Para web/browser
    WEB: 'http://localhost:4000/api',
    
    // Para Android
    ANDROID_EMULATOR: 'http://10.0.2.2:4000/api',
    ANDROID_DEVICE: 'http://192.168.1.100:4000/api', // Substitua pelo seu IP local
    
    // Para iOS
    IOS_SIMULATOR: 'http://localhost:4000/api',
    IOS_DEVICE: 'http://192.168.1.100:4000/api', // Substitua pelo seu IP local
  },
  
  // Configurações de timeout e retry
  TIMEOUT: 15000, // 15 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
};

// Função para obter a URL da API baseada no ambiente e plataforma
export const getApiUrl = (): string => {
  if (!__DEV__) {
    return API_CONFIG.PRODUCTION_URL;
  }
  
  // Em desenvolvimento
  switch (Platform.OS) {
    case 'web':
      return API_CONFIG.DEVELOPMENT.WEB;
    
    case 'android':
      // Para testar em dispositivo físico Android, descomente a linha abaixo:
      // return API_CONFIG.DEVELOPMENT.ANDROID_DEVICE;
      return API_CONFIG.DEVELOPMENT.ANDROID_EMULATOR;
    
    case 'ios':
      // Para testar em dispositivo físico iOS, descomente a linha abaixo:
      // return API_CONFIG.DEVELOPMENT.IOS_DEVICE;
      return API_CONFIG.DEVELOPMENT.IOS_SIMULATOR;
    
    default:
      return API_CONFIG.DEVELOPMENT.WEB;
  }
};

// Função para obter o IP local (útil para desenvolvimento)
export const getLocalIP = (): string => {
  // Esta função pode ser expandida para detectar automaticamente o IP local
  // Por enquanto, retorna um placeholder
  return '192.168.1.100'; // Substitua pelo seu IP local
};

// Instruções para configuração
export const SETUP_INSTRUCTIONS = {
  ANDROID_DEVICE: `
Para testar em dispositivo Android físico:
1. Encontre seu IP local (ipconfig no Windows, ifconfig no Mac/Linux)
2. Substitua '192.168.1.100' pelo seu IP em ANDROID_DEVICE
3. Descomente a linha return API_CONFIG.DEVELOPMENT.ANDROID_DEVICE
4. Certifique-se de que o dispositivo está na mesma rede Wi-Fi
  `,
  
  IOS_DEVICE: `
Para testar em dispositivo iOS físico:
1. Encontre seu IP local (ipconfig no Windows, ifconfig no Mac/Linux)
2. Substitua '192.168.1.100' pelo seu IP em IOS_DEVICE
3. Descomente a linha return API_CONFIG.DEVELOPMENT.IOS_DEVICE
4. Certifique-se de que o dispositivo está na mesma rede Wi-Fi
  `,
  
  BACKEND_SETUP: `
Certifique-se de que o backend está rodando:
1. Navegue até a pasta backend: cd backend
2. Instale as dependências: npm install
3. Execute o servidor: npm run dev
4. Verifique se está rodando na porta 3333
  `
};