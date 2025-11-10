Projeto

BarberBook é um aplicativo mobile feito para barbeiros visualizarem e gerenciarem:

Agendamentos automáticos feitos por clientes

Custos e entradas da barbearia

Dashboard de movimentação financeira

Catálogo de movimentação de capital

O app do cliente (para agendar) é um projeto separado.
Este projeto atual é apenas o app de gestão do barbeiro.

Backend — API

Linguagem / Bibliotecas

Node.js

Typescript

Fastify

Prisma

Zod

dotenv

Arquitetura

Layered

Banco de Dados

PostgreSQL

Acesso via Prisma Client

Modelagem de Dados
User

Login básico

name

email

password

Um User pode:

Ser dono de várias barbearias

Ser employee

Barbershop

name

full_address

neighborhood

reference_point

Relacionamentos:

pertence a um User (dono)

contém Employees

contém Services

Employee

phone_number

role: BARBEIRO | ATENDENTE

user_id

barbershop_id

Relacionamentos:

Um User

Uma Barbershop

BarberSchedule

Recebe Appointments

Service

name

price

time_taken (minutos)

barbershop_id

Appointment

client_name

client_contact

datetime

status:

PENDING

COMPLETED

CANCELLED

Relacionamentos:

employee_id

service_id

Regra:

Ao ser COMPLETED → gera entrada em Capital

Ao reverter → remove entrada gerada

BarberSchedule

days_of_week (ex.: [1,2,3] → seg/ter/qua)

open_time

close_time

Pode ter:

vários BreakingTimes

BreakingTime

starting_time

ending_time

Capital

Movimento financeiro da barbearia

id

value

type: PROFIT | COST

datetime

description?

barbershop_id

IDs:

UUID

Requisitos Funcionais

Cadastro de usuário

Autenticação via login

Obter perfil do usuário logado

Criar barbearia após cadastro

Regras de Negócio

Email não pode ser duplicado

Dono pode cadastrar usuário existente como employee

Usuário sem barbearia deve ser convidado a criar uma

CRUD deve respeitar modelagem

Dados visíveis apenas se relacionados ao usuário logado

Service marcado como COMPLETED → cria entrada em Capital automaticamente

Requisitos Não Funcionais

Senha criptografada

Persistência em banco

Validações com Zod

Erros padronizados JSON

Paginação obrigatória (20 itens/página)

Identificação via JWT

FRONTEND — Mobile

Bibliotecas

React Native

Typescript

Expo

React Navigation

Redux Toolkit

Axios

Styled Components

Objetivo de versões

Usar versões compatíveis entre si (não é obrigatório usar versões antigas/instáveis — pode ser removido se quiser)

Design — UI

Cores:

Background: #1E1E1E

Cards/Forms: #4A4A4A

Cor primária: #FFCB24

Fonte: #FFFFFF

TELAS (DETALHADO)
✅ Tela de Login

Layout:

Formulário centralizado
Campos:

email

password

Detalhes UI:

Ícone olho → mostrar/ocultar senha

Ícone pessoa → email

Ícone cadeado → senha

Título no topo do formulário: LOGIN

Botão “Login”

Logo centralizada acima do formulário (imagem de placeholder do Expo)

Link inferior:

Don’t have an account? Sign up

Pequeno botão: “Forgot password”

✅ Tela de Signup

Layout:

Formulário centralizado
Campos:

name

email

password

confirm password

Detalhes UI:

Ícone pessoa → name + email

Ícone cadeado → password + confirm password

Ícone olho → mostrar/ocultar senha

Título: SIGNUP

Botão cadastrar

Logo acima

Link inferior:

Already have an account? Log in

✅ Tela de Criar Barbearia

Fluxo obrigatório após signup:

Formulário da barbearia

Criar pelo menos 1 service

Criar Employees (opcional)

Criar schedule + breaking times

Campos barbearia:

barbershop_name

address

neighborhood

reference_point

Fluxo:

Após criar:
→ Tela de criação de Services

mínimo 1 para prosseguir

→ Tela de criação de employees

opcional

botão “skip”

→ Tela de criação de BarberSchedule + BreakingTime

Se não houver employees → usar user como employee padrão

Reaparecimento:

Se user estiver logado sem barbearia → tela aparece para criar primeira barbearia

✅ Tela de Agendamentos

UI:

H1: “Appointments” (topo/esquerda)

ícone de calendário (topo/direita)

Data atual abaixo do H1 (pequeno, opaco)

Card resumo:

Retângulo horizontal

Exibe:

Total

Pending

Completed

Com cores:

Total → azul

Pending → amarelo

Done → verde

Regras:

Tela exibe apenas agendamentos do dia atual

Lista:

h2: "Today's Appointments"

Cada card contém:

Nome do cliente — contato do cliente

Serviço

Horário

Botão amarelo → “Mark Done”

Sessão "Done"

h3: Done

Cards igual padrão

Botão verde → “Completed”

Se clicado → volta para pending

Remove movimentação de Capital automaticamente

✅ Tela de Dashboard

Formulário para adicionar Capital (entrada + saída)

Dashboard para exibir dados (livre)

Pode usar qualquer lib de gráficos

✅ Tela de Config

Deve conter:

Edição de dados (barbershop / user)

CRUD Services

CRUD Employees

Sugestões opcionais se algo na DB ainda não estiver bem aproveitado