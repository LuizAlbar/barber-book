# Troubleshooting - BarberBook

## Problema: Botões de Login/Cadastro não funcionam

### Sintomas
- Clicar nos botões "Entrar" ou "Cadastrar" não produz nenhuma ação
- Não aparecem erros no console
- Não há requisições sendo feitas para o backend

### Possíveis Causas e Soluções

#### 1. Backend não está rodando
**Verificação:**
```bash
cd backend
npm run dev
```

**Solução:**
- Certifique-se de que o backend está rodando na porta 3001
- Verifique se não há erros no console do backend

#### 2. Problema de conectividade de rede
**Verificação:**
- Abra o console do React Native/Expo
- Procure por mensagens de erro de rede
- Verifique se aparece "🌐 Erro de rede detectado" nos logs

**Soluções:**

**Para Emulador Android:**
- URL padrão: `http://10.0.2.2:3000/api`
- Esta configuração já está ativa por padrão

**Para Dispositivo Android Físico:**
1. Encontre seu IP local:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```
2. Edite `mobile/src/config/api.config.ts`
3. Substitua `192.168.1.100` pelo seu IP real
4. Descomente a linha no `getApiUrl()`:
   ```typescript
   return API_CONFIG.DEVELOPMENT.ANDROID_DEVICE;
   ```

**Para iOS Simulator:**
- URL padrão: `http://localhost:3000/api`
- Esta configuração já está ativa por padrão

**Para Dispositivo iOS Físico:**
1. Encontre seu IP local (mesmo processo do Android)
2. Edite `mobile/src/config/api.config.ts`
3. Substitua `192.168.1.100` pelo seu IP real
4. Descomente a linha no `getApiUrl()`:
   ```typescript
   return API_CONFIG.DEVELOPMENT.IOS_DEVICE;
   ```

#### 3. Problemas de CORS
**Verificação:**
- Procure por erros de CORS no console do navegador (se testando no web)

**Solução:**
- O backend já tem CORS configurado, mas verifique se está funcionando

#### 4. Problemas de timeout
**Verificação:**
- Procure por mensagens "⏰ Timeout da requisição" nos logs

**Solução:**
- Aumente o timeout em `mobile/src/config/api.config.ts`:
  ```typescript
  TIMEOUT: 30000, // 30 segundos
  ```

#### 5. Problemas de dependências
**Verificação:**
```bash
cd mobile
npm ls
```

**Solução:**
```bash
cd mobile
npm install
# ou
npm ci
```

### Como usar o sistema de diagnóstico

O app agora inclui indicadores visuais de conectividade:

1. **Verificando conexão**: Aparece um spinner com "Verificando conexão..."
2. **Conectado**: Aparece um ✅ com "Conectado ao servidor"
3. **Desconectado**: Aparece um ⚠️ com "Sem conexão com o servidor" e botão "Tentar novamente"

### Logs detalhados

O app agora produz logs detalhados no console:

- 🚀 Requisições sendo enviadas
- ✅ Respostas bem-sucedidas
- ❌ Erros detalhados com causa
- 🌐 Problemas de rede
- ⏰ Timeouts

### Testando a conectividade manualmente

1. Abra o console do React Native/Expo
2. Procure por "🔍 Testando conectividade com o backend..."
3. Se aparecer "✅ Conectividade OK", o backend está acessível
4. Se aparecer "❌ Falha na conectividade", há problema de rede

### Configuração rápida para desenvolvimento

1. **Certifique-se de que o backend está rodando:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Para emulador (configuração padrão):**
   - Não precisa alterar nada

3. **Para dispositivo físico:**
   - Encontre seu IP: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
   - Edite `mobile/src/config/api.config.ts`
   - Substitua `192.168.1.100` pelo seu IP
   - Descomente a linha apropriada no `getApiUrl()`

4. **Reinicie o app mobile:**
   ```bash
   cd mobile
   npm start
   ```

### Ainda não funciona?

1. Verifique se o firewall não está bloqueando a porta 3001
2. Certifique-se de que o dispositivo/emulador está na mesma rede
3. Teste acessar `http://SEU_IP:3001` no navegador do dispositivo
4. Verifique os logs do backend para ver se as requisições estão chegando

### Contato para suporte

Se o problema persistir, forneça:
1. Plataforma (Android/iOS, emulador/dispositivo)
2. Logs do console do React Native
3. Logs do console do backend
4. Configuração de rede (IP local, etc.)