# App

GymPass style app.

## RFs (Requisitos funcionais)

- [x] Deve ser possível se cadastrar;
- [x] Deve ser possível se autenticar;
- [x] Deve ser possível obter o perfil de um usuário logado;
- [x] Deve ser possível obter o número de check-ins realizados pelo usuário logado;
- [x] Deve ser possível o usuário obter o seu histórico de check-ins;
- [x] Deve ser possível o usuário buscar academias próximas (até 10km);
- [x] Deve ser possível o usuário buscar academias pelo nome;
- [x] Deve ser possível o usuário realizar check-in em uma academia;
- [x] Deve ser possível validar o check-in de um usuário;
- [x] Deve ser possível cadastrar uma academia;

## RNs (Regras de negócio)

- [x] O usuário não deve poder se cadastrar com um e-mail duplicado;
- [x] O usuário não pode fazer 2 check-ins no mesmo dia;
- [x] O usuário não pode fazer check-in se não estiver perto (100m) da academia;
- [x] O check-in só pode ser validado até 20 minutos após ser criado;
- [x] O check-in só pode ser validado por administradores;
- [x] A academia só pode ser cadastrada por administradores;

## RNFs (Requisitos não-funcionais)

- [x] A senha do usuário precisa estar criptografada;
- [x] Os dados da aplicação precisam estar persistidos em um banco PostgreSQL;
- [x] Todas listas de dados precisam estar paginadas com 20 itens por página;
- [x] O usuário deve ser identificado por um JWT (JSON Web Token);

## 🛠️ Tech Stack & Ferramentas

### Core & Runtime

- **[Node.js](https://nodejs.org/)** (v20+) & **[TypeScript](https://www.typescriptlang.org/)**
- **[Fastify](https://www.fastify.io/)** - Framework web ultrarrápido com baixo overhead
- **[Zod](https://zod.dev/)** - Validação de schemas e inferência de tipos em tempo de execução
- **[Prisma ORM](https://www.prisma.io/)** - Mapeamento objeto-relacional para banco de dados
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional (via Docker)

### Autenticação & Segurança

- **[Fastify JWT](https://github.com/fastify/fastify-jwt)** - Autenticação baseada em JSON Web Tokens
- **[Fastify Cookie](https://github.com/fastify/fastify-cookie)** - Manipulação segura de Refresh Tokens via HTTP-only Cookies
- **[BcryptJS](https://github.com/dcodeIO/bcrypt.js)** - Criptografia/Hashing seguro de senhas

### Testes & Qualidade

- **[Vitest](https://vitest.dev/)** - Test runner de altíssima performance
- **[Supertest](https://github.com/ladjs/supertest)** - Requisições HTTP simuladas para testes E2E
- **[ESLint](https://eslint.org/)** - Padronização e análise estática de código
- **[GitHub Actions](https://github.com/features/actions)** - Automação de pipelines de CI/CD

---

## 📐 Arquitetura do Sistema

A aplicação foi desenhada mantendo as **Regras de Negócio totalmente desacopladas da camada de Infraestrutura e Frameworks**.

```text
src/
├── @types/            # Extensões de tipagens globais (Fastify / JWT)
├── env/               # Validation e exportação de variáveis de ambiente com Zod
├── http/              # Camada de Apresentação / HTTP
│   ├── controllers/   # Handlers HTTP organizados por domínio (users, gyms, check-ins)
│   ├── middlewares/   # Autenticação JWT e Autorização por Role (RBAC)
│   └── routes.ts      # Registro central de rotas do Fastify
├── lib/               # Clientes e instâncias globais (Prisma Client)
├── repositories/      # Camada de Acesso a Dados (Data Access Layer)
│   ├── in-memory/     # Implementações em memória para testes unitários
│   └── prisma/        # Implementações reais com Prisma ORM
├── use-cases/         # Camada de Aplicação / Regras de Negócio (Domain Layer)
│   ├── errors/        # Exceções customizadas de domínio
│   └── factories/     # Design Pattern Factory para Injeção de Dependências
└── utils/             # Helpers e utilitários (Cálculo de distância Havesine, test helpers)
```

### 🔒 Autenticação, Refresh Token e Controle de Acesso (JWT & RBAC)

A segurança da API implementa estratégias modernas de proteção de rotas e gerenciamento de sessões:

- **Validação de Token (JWT & Bearer):**
  - O middleware `verify-jwt.ts` intercepta rotas protegidas validando o token JWT enviado no header de autorização.
  - O payload decodificado é injetado em `request.user`, permitindo identificar o ID e a role do usuário.

- **Renovação de Sessão via HttpOnly Cookie (Refresh Token):**
  - Configurado globalmente via `@fastify/jwt` e `@fastify/cookie` no `app.ts` para mapear um cookie chamado `refreshToken`.
  - Na rota de refresh, o método `await request.jwtVerify({ onlyCookie: true })` ignora o header comum e olha exclusivamente para o cookie seguro, validando a continuidade da sessão do usuário sem expor credenciais a scripts maliciosos (prevenção contra XSS).

- **Controle de Acesso por Cargo / RBAC (`verifyUserRole`):**
  - Implementado através de uma Higher-Order Function (HOF) em `verify-user-role.ts`, restringindo ações sensíveis (como cadastro de academias ou validação de check-ins) apenas a usuários com o perfil `ADMIN`.

---

## 🔄 Fluxo de Dados (Step-by-Step)

Para garantir legibilidade, manutenibilidade e facilidade de testes, cada requisição segue um fluxo estrito de responsabilidades:

```text
[Cliente HTTP]
      │
      ▼
1. [HTTP Route + Middleware]  ─── (Valida JWT/Cookie e Autorização por Cargo via RBAC)
      │
      ▼
2. [Controller]               ─── (Valida input da requisição via Zod)
      │
      ▼
3. [Factory]                  ─── (Instancia Use Case + Injeta o Repositório Prisma)
      │
      ▼
4. [Use Case]                 ─── (Executa regras de negócio puras, e.g. distância máxima de 100m)
      │
      ▼
5. [Repository]               ─── (Comunica-se com o PostgreSQL via Prisma ORM)
```

### O papel do Factory Pattern

Na pasta `src/use-cases/factories/`, funções fábrica centralizam a instanciação dos repositórios reais e a injeção de dependências nos Casos de Uso, impedindo que os Controllers precisem gerenciar a inicialização de serviços.

---

## 🧪 Metodologia TDD & Estratégia de Testes

O projeto foi inteiramente estruturado seguindo os princípios de TDD (Test-Driven Development), garantindo alta coesão, baixo acoplamento e confiabilidade nas regras de negócio antes mesmo da implementação dos controllers HTTP.

### 1. Testes Unitários (`npm run test`)

- **Foco:** Validar regras de negócio puras nos Use Cases de forma isolada.
- **Repositórios In-Memory:** Utilização de implementações em memória (`src/repositories/in-memory/`) que cumprem os mesmos contratos dos repositórios reais. Isso permite que os testes unitários rodem em milissegundos, sem dependência de banco de dados ou I/O externo.

### 2. Testes End-to-End (`npm run test:e2e`) & O Ambiente Customizado do Vitest

Para testar o ciclo completo da aplicação (Rotas, Middlewares, Controllers, Status HTTP, Cookies e Banco de Dados Real) em paralelo sem conflitos de estado, foi desenvolvido um Environment Customizado para o Vitest (`prisma/vitest-environment-prisma/prisma-test-environment.ts`).

**Como Funciona:**

- **Schema por Arquivo de Teste:** Antes de cada suíte E2E rodar, o ambiente gera um nome de schema único baseado em um UUID.
- **Injeção de URL Dinâmica:** A `DATABASE_URL` do Prisma é reescrita em tempo de execução para apontar para o novo schema isolado no PostgreSQL.
- **Migration Deploy:** Aplica as migrações do banco de forma rápida e automatizada via `npx prisma migrate deploy`.
- **Tear Down:** Ao final da execução dos testes, executa um `DROP SCHEMA ... CASCADE` para destruir o schema e manter o ambiente limpo.

---

## ⚡ Como Executar o Projeto Localmente

### Pré-requisitos

- Node.js v20+
- Docker e Docker Compose

### 1. Clonar e Instalar Dependências

```bash
git clone git@github.com:developer-rolin/api-solid-gympass-style.git
cd api_solid_solid_gympass
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
NODE_ENV=dev
PORT=3333
DATABASE_URL="postgresql://docker:docker@localhost:5432/apisolid?schema=public"
JWT_SECRET="sua-chave-secreta-jwt"
```

### 3. Subir o Banco de Dados (Docker)

```bash
docker compose up -d
```

### 4. Rodar as Migrações do Banco

```bash
npm run prisma:migrate:dev
```

### 5. Executar a Aplicação

```bash
# Modo de desenvolvimento com live-reload
npm run start:dev

# Build de produção
npm run build

# Executar build de produção
npm run start
```

---

## 📜 Comandos de Testes e Qualidade

```bash
# Executar testes unitários (TDD / In-memory)
npm run test

# Executar testes unitários em modo watch
npm run test:watch

# Executar testes End-to-End (E2E) com banco isolado
npm run test:e2e

# Executar testes E2E em modo watch
npm run test:e2e:watch

# Gerar relatório de cobertura de código
npm run test:coverage

# Rodar linter (ESLint)
npm run lint
```

---

## ⚙️ Integração Contínua (CI/CD)

O repositório possui automação configurada via GitHub Actions (`.github/workflows/`). A cada push ou pull request:

1. Provisiona-se uma máquina virtual Ubuntu com Node.js v20.
2. Um container do PostgreSQL é inicializado em segundo plano.
3. As migrações do Prisma são aplicadas automaticamente.
4. Toda a suíte de testes unitários e E2E é validada para garantir que nenhuma regressão foi introduzida.
