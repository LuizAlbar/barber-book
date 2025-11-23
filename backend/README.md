# BarberBook Backend

## Configuração

### 1. Instalar dependências
```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `env.example` para `.env`:

```bash
cp env.example .env
```

Edite o arquivo `.env` e configure as variáveis:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=4000
SESSION_SECRET="your-secret-key-here"
```

**Importante:** 
- Gere um `SESSION_SECRET` seguro em produção
- O arquivo `.env` está no `.gitignore` e não será versionado

### 3. Executar migrações do banco de dados

```bash
pnpm prisma:migrate
```

### 4. Gerar o Prisma Client

```bash
pnpm prisma:generate
```

### 5. Iniciar o servidor

```bash
pnpm dev
```

O servidor estará rodando em `http://localhost:4000`

## Scripts disponíveis

- `pnpm dev` - Inicia o servidor em modo desenvolvimento
- `pnpm build` - Compila o TypeScript
- `pnpm start` - Inicia o servidor em modo produção
- `pnpm prisma:generate` - Gera o Prisma Client
- `pnpm prisma:migrate` - Executa as migrações
- `pnpm prisma:studio` - Abre o Prisma Studio

