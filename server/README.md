# JetGO — Backend

Servidor Express simples que serve a API do JetGO.

## Instalação

```bash
cd server
npm install
```

## Rodar local

Crie um `.env` baseado em `.env.example`:

```bash
cp .env.example .env
```

E suba o servidor:

```bash
npm run dev
```

Sem nodemon:

```bash
npm start
```

A porta padrão é `3001`. Para mudar, ajuste `PORT` no `.env`.

## Rodar com Docker

A partir da raiz do repositório:

```bash
docker compose up --build
```

O `docker-compose.yaml` lê `server/.env.docker`. Esse arquivo já vem com os valores padrão do Postgres do container.

## Rotas atuais

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Identificação simples da API |
| GET | `/health` | Healthcheck |
| GET | `/api/v1` | Índice das rotas disponíveis |
| GET | `/api/v1/flows` | Lista os fluxos cadastrados |
| POST | `/api/v1/flows` | Cria um fluxo |
| GET | `/api/v1/flows/:id` | Busca um fluxo |
| PUT | `/api/v1/flows/:id` | Atualiza um fluxo |
| DELETE | `/api/v1/flows/:id` | Remove um fluxo |
| POST | `/api/v1/flows/validate` | Valida estrutura de um fluxo |
| POST | `/api/v1/flows/:id/sessions` | Inicia uma sessão de fluxo |

A rota `/api/flow` continua respondendo como atalho legado para `/api/v1/flows`.

Rotas inexistentes retornam JSON `{"error":{"message":"Rota não encontrada","code":"NOT_FOUND"}}` com status 404.

## Teste rápido

Com o servidor rodando:

```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/v1
curl http://localhost:3001/api/v1/flows
```

## O que ainda não está pronto

- Chatbot completo
- Conversas e mensagens
- Integração com Evolution API / WhatsApp
- Conexão real com Postgres (o storage atual é em memória e reseta a cada restart)
- Autenticação
- Limpeza dos stubs vazios em `modules/`, `middlewares/` e `utils/`
