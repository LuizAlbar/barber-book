# BarberBook

## Projeto

Sistema completo de gestão para barbearias com aplicativo mobile React Native e API backend Node.js.

## Estrutura do Projeto

### Backend (./backend)
- **Stack**: Node.js, TypeScript, Fastify, Prisma, PostgreSQL
- **Arquitetura**: Layered (Controllers, Routes, Schemas, Services)
- **Autenticação**: JWT com bcrypt
- **Validação**: Zod
- **ORM**: Prisma Client
- **Port**: 3000

### Mobile (./mobile)
- **Stack**: React Native, Expo, TypeScript
- **Navegação**: React Navigation
- **Estado**: Redux Toolkit
- **Estilização**: Styled Components
- **API**: Axios

## Modelagem de Dados

### User
- Login básico (name, email, password)
- Pode ser dono de várias barbearias
- Pode ser employee

### Barbershop
- Informações (name, fullAddress, neighborhood, referencePoint)
- Pertence a um User (dono)
- Contém Employees, Services, Capital, BarberSchedules

### Employee
- phoneNumber, role (BARBEIRO | ATENDENTE)
- Vinculado a User e Barbershop

### Service
- name, price, timeTaken (minutos)
- Pertence a uma Barbershop

### Appointment
- clientName, clientContact, datetime
- status: PENDING, COMPLETED, CANCELLED
- Vinculado a Employee e Service
- Ao ser COMPLETED → gera Capital automaticamente

### Capital
- Movimentação financeira (value, type: PROFIT | COST)
- datetime, description
- Pertence a uma Barbershop

### BarberSchedule
- daysOfWeek, openTime, closeTime
- Contém BreakingTimes

### BreakingTime
- startingTime, endingTime
- Vinculado a BarberSchedule

## Endpoints da API

### Auth
- POST /api/auth/signup - Cadastro de usuário
- POST /api/auth/login - Login
- GET /api/auth/profile - Perfil do usuário (requer JWT)

### Barbershops
- POST /api/barbershops - Criar barbearia
- GET /api/barbershops - Listar barbearias do usuário (paginado)
- GET /api/barbershops/:id - Detalhes da barbearia
- PUT /api/barbershops/:id - Atualizar barbearia
- DELETE /api/barbershops/:id - Deletar barbearia

### Services
- POST /api/services - Criar serviço
- GET /api/services?barbershopId=xxx - Listar serviços (paginado)
- PUT /api/services/:id - Atualizar serviço
- DELETE /api/services/:id - Deletar serviço

### Employees
- POST /api/employees - Criar funcionário
- GET /api/employees?barbershopId=xxx - Listar funcionários (paginado)
- DELETE /api/employees/:id - Deletar funcionário

### Appointments
- POST /api/appointments - Criar agendamento
- GET /api/appointments?barbershopId=xxx&date=YYYY-MM-DD - Listar agendamentos (paginado)
- PATCH /api/appointments/:id/status - Atualizar status (gera/remove Capital automaticamente)

### Capital
- POST /api/capital - Criar movimentação manual
- GET /api/capital?barbershopId=xxx&type=PROFIT|COST - Listar movimentações (paginado)

### Schedules
- POST /api/schedules - Criar horário de funcionamento
- GET /api/schedules?barbershopId=xxx - Listar horários

## Design - UI Mobile

### Cores
- Background: `#1E1E1E`
- Cards/Forms: `#4A4A4A`
- Cor primária: `#FFCB24`
- Fonte: `#FFFFFF`

### Telas
1. **Login** - Email, senha, toggle para mostrar senha
2. **Signup** - Nome, email, senha, confirmar senha
3. **Onboarding** - Criar barbearia, serviços, employees, horários
4. **Agendamentos** - Lista do dia com cards resumo (total/pending/completed)
5. **Dashboard** - Formulário de entrada/saída e visualização financeira
6. **Configurações** - CRUD de barbearia, serviços, employees

## Como Rodar

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npm start
```

## Regras de Negócio Implementadas

- Email único para usuários
- Senha criptografada com bcrypt
- JWT com expiração de 7 dias
- Paginação de 20 itens por página em todas as listagens
- Geração automática de Capital (PROFIT) ao marcar Appointment como COMPLETED
- Remoção automática de Capital ao reverter Appointment de COMPLETED
- Validação de dados com Zod em todos os endpoints
- Autorização: usuários só veem dados relacionados às suas barbearias

## Status do Desenvolvimento

### Completo
- [x] Backend API completo com todos os endpoints
- [x] Modelagem PostgreSQL com Prisma
- [x] Autenticação JWT
- [x] Validação com Zod
- [x] Geração automática de Capital
- [x] Estrutura mobile com Expo

### Em Desenvolvimento
- [ ] Telas mobile completas
- [ ] Integração mobile com API
- [ ] Redux configurado
- [ ] Navigation configurada

## Próximos Passos

1. Finalizar telas mobile
2. Configurar Redux Toolkit para estado global
3. Configurar React Navigation
4. Integrar com API backend
5. Testar fluxo completo end-to-end
6. Adicionar tratamento de erros
7. Adicionar loading states
8. Melhorar UX/UI

## Notas Técnicas

- Backend usa ES Modules (type: "module" no package.json)
- Mobile usa Expo para desenvolvimento rápido
- Styled Components para CSS-in-JS
- Axios para requisições HTTP
- React Navigation para navegação entre telas
- Redux Toolkit para gerenciamento de estado

## Ambiente

- Node.js 20.19.3
- PostgreSQL (Neon)
- TypeScript 5.9.3
- React Native via Expo
