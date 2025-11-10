## Projeto: BarberBook é um aplicativo mobile feito para barbeiros visualizarem e gerenciarem agendamentos automáticos feitos pelo cliente, gerenciar custos(entrada e saída de capital com detalhes) da barbearia através de dashboard e página para catalogar esse movimento de capital


Esse projeto foca no app mobile voltado para a gestão dos barbeiros, o APP para agendamentos é um projeto a parte

## Backend - API

Libs: Node.js, Typescript, Fastify, Prisma, Zod, dotenv
Arquitetura: Layered

## Frontend - Mobile

Libs: React Native, Typescript, Expo, React Navigation, Redux Toolkit, Axios, Styled Components
Criterios: usar uma versão mais antiga e instavel do: expo, reactnative/react e todas outras libs que interagem entre si, e que fiquem todas compativeis

## Banco de Dados - Postgres

Acesso: via Prisma Client

### Modelagem de Dados: 

Estruturas Básicas

User (Usuário):

Guarda o login básico (nome, email, senha).

Um User pode ser o dono de várias Barbershops ou um Employee.

Barbershop (Barbearia):

Dados da loja (nome, endereço completo, bairro, ponto de referência).

Relacionada a um User (o dono).

Contém Employees (funcionários) e oferece Services (serviços).

Pessoas e Funções

Employee (Funcionário):

Detalhes específicos do funcionário (número de telefone).

Define a Role (função) do funcionário, que pode ser: BARBEIRO ou ATENDENTE.

Relaciona-se com um User (para login) e uma Barbershop.

É quem recebe os Appointments (agendamentos) e tem um BarberSchedule (horário de trabalho).

Agendamento e Serviços

Service (Serviço):

Detalhes do serviço (nome, preço e time_taken — tempo que leva para ser concluído, em minutos).

Relacionado a uma Barbershop.

Appointment (Agendamento):

Registro de um horário marcado.

Detalhes do cliente (nome e contato).

Tem data/hora (datetime) e um status inicial PENDENTE.

Relaciona-se a um Employee (o barbeiro/atendente) e um Service.

O status pode ser: PENDENTE, COMPLETO ou CANCELADO.

Disponibilidade

BarberSchedule (Escala do Barbeiro):

Define a disponibilidade semanal de um Employee.

Campos: days_of_week (array de inteiros para os dias, ex: [1, 2, 3] para Seg/Ter/Qua), open_time e close_time (horários de início e fim).

Pode ter vários BreakingTimes (intervalos).

BreakingTime (Intervalo/Pausa):

Define pausas dentro do BarberSchedule (ex: almoço).

Tem starting_time e ending_time (hora de início e fim do intervalo).

Capital( Valor que entra e sai da barbearia):

Campos: id, value, type(ENUM: PROFIT || COST), datetime(created_at), description?, barbershop_id

Tudo interligado por IDs (@id @default(uuid()))

## Requisitos Funcionais

- Deve ser possível se cadastar
- Deve ser possível se autenticar(logar)
- Deve ser possível obter o perfil de um usuário logado
- Deve ser possível criar uma barbearia assim que se cadastar

## Regras de Negócio

- Usuário não deve poder se cadastrar com e-mail complicado
- O usuário logado, que tiver uma barbearia, deve poder cadastrar um usuário existente como seu empregado
- Se o usuário logado não possuir barbearia, deve aparecer uma opção para ele criar a primeira barbearia
- O CRUD(as rotas) devem ser implementadas de acordo com a modelagem de dados
- Os dados exibidos devem ser apenas os que estão relacionados ao usuário logado
- Após um serviço ser marcado como Done, o valor daquele serviço tem que ser adicionado automaticamente na entrada de capital da barbearia através de sua rota

## Requisitos Não Funcionais

- A senha do usuário precisa estar criptograda
- Os dados da aplicação precisam estar persistidos em um banco de dados
- A entrada e saída de dados deve passar por validação com Zod
- Os erros devem estar padronizados em bem exibidos em JSON
- Todas as listas de dados precisam estar paginadas com 20 itens por página
- O usuário deve ser identificado por um JWT (JSON Web Token)

## Frontend

Cores de fundo: #1E1E1E
Fundo para formulários: #4A4A4A
Cor primária do app: #FFCB24
Letras: #FFFFFF

### Telas

Tela de Login

- Formulário centrado no meio da tela, campos: email, password
- Icone de olho para exibir e ocultar senha
- Icone de pessoa para email e cadeado para password
- Pequeno botão de esqueci minha senha
- "LOGIN" no topo centralizado do formulario
- Botão de logar
- Logo do APP centralizada acima do formulário(Usar imagem coringa do Expo temporariamente)
- Botão abaixo do formulário: Don’t have an account? Sign up

Tela de Signup

- Formulário centrado no meio da tela, campos: name, email, password, confirm password  
- Icone de olho para exibir e ocultar senha
- Icone de pessoa para name e email e cadeado para password e confirm password
- "SIGNUP" no topo centralizado do formulario
- Botão de cadastrar
- Logo do APP centralizada acima do formulário(Usar imagem coringa do Expo temporariamente)
- Botão abaixo do formulário: Already have an account? Log in

Tela de Criar Barbearia

- Formulário centrado no meio da tela, campos: barbershop name, address, neighborhood, reference point
- Pós preencher o formulario e criar a barbearia(algum botão para enviar o formulario), exibir tela para criar os Services da empresa(no mínimo um service criado para seguir)
- Após criar pelo menos um service, exibir tela para criar Employees, essa é opcional, pode ter botão de skip
- Após essa tela, tela de criar os breaking schedule e breaking time da barbearia, como essa tabela precisa de um employee id, se ele não tiver employees, o usuario dele estará representando a barbearia(o usuario logado)
- Essas telas do processo de criação de barbearia é apenas para o usuario que acabou de se cadastar. Caso haja um user logado sem barbearia criada ou sem nenhuma barbearia associada a ele, deve aparecer uma tela de "criar minha primeira barbearia" que iniciará esse processo de criação

Tela de Agendamentos

- H1 Appointments a topo/esquerda
- icone de calendario a topo/direita
- Data de hoje bem pequena e opaca abaixo do h1
- Card retangulo achatado com: Total(azul), Pending(Amarelo), Completed(Verde)  e a contagem de cada um em cima. Se a barbearia tiver 5 agendamentos com status pending e 2 com Done, o card deve ser exibir Total 7, pending 5 e done 2. 
- Apesar do user poder marcar para muitos dias após, essa tela exibe apenas os agendamentos do dia atual
- h2 Today's Appointments
- Cards mostrando os appointments com: nome do cliente hifén contato do cliente, serviço, horário. Nome e contato em cima, serviço abaixo de nome e contato, horario abaixo de serviço
- Nesses cards, deve haver um botão amarelo: Mark Done
- h3 Done
- Todos os cards com status done, mesmo padrão dos Pending, mas, o botão agora é verde e com a label "Completed". Caso esse botão seja acionado, o card vira pending de novo e o valor que foi incrementado automaticamente deve ser retirado da tabela Capital

Tela de Dashboard

- Fique livre para criar formulario para adicionar Capital(entrada ou saida) e os dashboards para exibir os dados(com alguma lib)

Tela de Config

- Deve conter telas para edição de dados
- Deve conter tela para criar, remover ou editar serviços
- Deve conter tela para cadastar, remover ou editar employees
- Fique livre para preencher lacunas se houver, caso alguma tabela do banco de dados não esteja sendo aproveitada adequadamente nas configurações
  
