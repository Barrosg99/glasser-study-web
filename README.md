# Glasser Study Client

## 📚 Sobre o Projeto

Glasser Study é uma plataforma web de estudo colaborativo desenvolvida com Next.js 15 e React 19. O sistema visa ajudar estudantes a se conectarem, compartilharem materiais de estudo e colaborarem em suas jornadas acadêmicas.

### 🎯 Funcionalidades Principais

- **Autenticação e Perfil**: Sistema completo de login, registro, recuperação de senha e gerenciamento de perfil
- **Fórum Colaborativo**: Crie e compartilhe publicações com materiais de estudo, comentários e likes
- **Chat e Grupos**: Sistema de chats privados para discussões em grupo com gerenciamento de membros
- **Metas de Estudo**: Defina e acompanhe suas metas de estudo com tarefas personalizadas
- **Sistema de Notificações**: Notificações em tempo real via WebSocket para novas mensagens, comentários e interações
- **Internacionalização**: Suporte completo para português e inglês
- **Busca Avançada**: Sistema de busca e filtros para posts por disciplina e tipo de material

## 🚀 Tecnologias Utilizadas

- **Framework**: Next.js 15 com App Router
- **React**: 19.0.0
- **TypeScript**: 5.x
- **GraphQL**: Apollo Client para comunicação com a API
- **Estilização**: Tailwind CSS 4
- **Notificações**: react-hot-toast
- **WebSocket**: graphql-ws para subscriptions
- **Fontes**: Google Fonts (Comfortaa, Montserrat)
- **Ícones**: lucide-react

## 📋 Pré-requisitos

- Node.js 20.x ou superior
- Yarn ou npm
- Conta com acesso ao backend GraphQL

## 🔧 Instalação

1. Clone o repositório:

```bash
git clone <repository-url>
cd glasser-study-client
```

2. Instale as dependências:

```bash
yarn install
# ou
npm install
```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
NEXT_PUBLIC_NOTIFICATION_ENDPOINT=ws://localhost:4000/graphql
```

4. Execute o servidor de desenvolvimento:

```bash
yarn dev
# ou
npm run dev
```

5. Acesse a aplicação:
   Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   └── [lang]/            # Rotas com i18n
│       ├── chat/          # Página de chats
│       ├── goals/         # Página de metas
│       ├── posts/          # Página de posts/forum
│       ├── profile/        # Página de perfil
│       ├── login/          # Página de login
│       ├── signup/         # Página de registro
│       └── reset-password/ # Página de recuperação
├── components/             # Componentes reutilizáveis
│   ├── Header.tsx         # Header com navegação
│   ├── Home.tsx           # Página inicial
│   ├── LoginForm.tsx      # Formulário de login
│   ├── SignUpForm.tsx     # Formulário de registro
│   ├── PostModal.tsx      # Modal de posts
│   ├── NotificationModal.tsx # Modal de notificações
│   └── ...
├── dictionaries/          # Arquivos de i18n
│   └── languages/         # Traduções (pt.json, en.json)
├── hooks/                 # Custom hooks
│   ├── useCurrentUser.ts  # Hook para usuário atual
│   └── useLocalStorage.ts # Hook para localStorage
├── lib/                   # Bibliotecas e configurações
│   ├── apollo-client.ts   # Configuração do Apollo
│   └── notification-apollo-client.ts # Cliente de notificações
└── middleware.ts          # Middleware de i18n
```

## 🎨 Funcionalidades Detalhadas

### Autenticação

- Login com email e senha
- Registro de novos usuários
- Recuperação de senha via email
- Gerenciamento de perfil com upload de foto

### Fórum Colaborativo

- Criação de publicações com título, descrição e tags
- Upload de materiais com links
- Sistema de categorização por disciplina (Matemática, Física, Química, etc.)
- Comentários e curtidas em posts
- Busca e filtros avançados

### Chat e Grupos

- Criação de grupos de estudo privados
- Convite de membros por email
- Mensagens em tempo real via WebSocket
- Sistema de moderadores e membros
- Histórico de conversas

### Metas de Estudo

- Criação de metas personalizadas
- Adicionar tarefas com links para materiais
- Acompanhamento de progresso
- Atualização e exclusão de metas

### Sistema de Notificações

- Notificações em tempo real para:
  - Novas mensagens
  - Novos chats
  - Novos comentários
  - Novos likes
- Marcar notificações como lidas
- Badge de contador de notificações

## 🌐 Internacionalização

O projeto suporta dois idiomas:

- **Português (pt)**: Idioma padrão
- **English (en)**: Idioma alternativo

As traduções estão localizadas em `src/dictionaries/languages/`.

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento com Turbopack
yarn dev

# Build de produção
yarn build

# Iniciar servidor de produção
yarn start

# Verificar lint
yarn lint
```

## 🏗️ Build

Para gerar uma build de produção:

```bash
yarn build
yarn start
```

## 🌍 Variáveis de Ambiente

| Variável                            | Descrição               | Exemplo                         |
| ----------------------------------- | ----------------------- | ------------------------------- |
| `NEXT_PUBLIC_GRAPHQL_ENDPOINT`      | URL do endpoint GraphQL | `http://localhost:4000/graphql` |
| `NEXT_PUBLIC_NOTIFICATION_ENDPOINT` | URL do WebSocket        | `ws://localhost:4000/graphql`   |

## 📱 Páginas Principais

- `/` - Página inicial com apresentação do projeto
- `/login` - Página de login
- `/signup` - Página de registro
- `/profile` - Perfil do usuário
- `/posts` - Fórum com publicações
- `/chat` - Chats e grupos de estudo
- `/goals` - Metas de estudo

## 🔒 Recursos de Segurança

- Armazenamento seguro de tokens em localStorage
- Autenticação baseada em JWT
- Proteção de rotas via middleware
- Validação de inputs no cliente

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

## 👥 Contato

Para questões e suporte, entre em contato com a equipe de desenvolvimento.

---

**Versão**: 0.1.0  
**Última atualização**: 2024
