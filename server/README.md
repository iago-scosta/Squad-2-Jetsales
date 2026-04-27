# Backend JetGO

Sprint 02 do backend do JetGO. A API da Sprint 01 foi mantida, mas agora os dados principais passam a ser persistidos em PostgreSQL com `pg` puro, sem ORM.

## O que mudou na Sprint 02

- configuracao de conexao com PostgreSQL em `server/src/database/db.js`;
- migration SQL inicial das tabelas principais;
- script `npm run db:migrate`;
- repositories separados para concentrar o SQL;
- endpoints da API inicial persistindo no banco;
- webhook fake salvando contato, conversa e mensagens no PostgreSQL;
- fallback claro quando `DATABASE_URL` nao estiver configurado.

## Tecnologias

- Node.js
- Express
- PostgreSQL
- pg
- Nodemon

## Como instalar

```bash
cd server
npm install
```

## Como configurar o .env

Copie o exemplo:

```bash
cp .env.example .env
```

Conteudo esperado:

```env
PORT=3001
DATABASE_URL=postgres://postgres:postgres@localhost:5432/jetsales
```

O arquivo `.env` nao deve ser commitado.

## Como criar o banco local

Se voce tiver PostgreSQL com linha de comando:

```bash
createdb jetsales
```

Se preferir, o banco tambem pode ser criado manualmente no pgAdmin ou DBeaver.

## Como rodar migrations

```bash
npm run db:migrate
```

## Como subir o backend

Modo desenvolvimento:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

## Fluxo basico

```bash
cd server
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

## Base URL

```txt
http://localhost:3001
```

## Tabelas criadas

- `chatbots`
- `flows`
- `flow_nodes`
- `flow_edges`
- `contacts`
- `conversations`
- `messages`

## Endpoints disponiveis

### Health

`GET /health`

Resposta:

```json
{
  "status": "ok",
  "service": "jetsales-backend"
}
```

### Chatbots

`POST /api/v1/chatbots`

Payload:

```json
{
  "name": "Atendimento",
  "organization_id": "org-001",
  "type": "whatsapp"
}
```

`GET /api/v1/chatbots`

`GET /api/v1/chatbots/:id`

`PUT /api/v1/chatbots/:id`

`DELETE /api/v1/chatbots/:id`

### Flows

`POST /api/v1/flows`

Payload:

```json
{
  "chatbot_id": "COLE_AQUI_O_ID_DO_CHATBOT",
  "name": "Fluxo de vendas"
}
```

`GET /api/v1/flows`

`GET /api/v1/flows/:id`

`PUT /api/v1/flows/:id`

`DELETE /api/v1/flows/:id`

### Nodes

`POST /api/v1/flows/:flowId/nodes`

Payload:

```json
{
  "type": "message",
  "data": {
    "text": "Ola, como posso ajudar?"
  },
  "position_x": 100,
  "position_y": 200
}
```

`GET /api/v1/flows/:flowId/nodes`

### Edges

`POST /api/v1/flows/:flowId/edges`

Payload:

```json
{
  "source_node_id": "ID_DO_NO_ORIGEM",
  "target_node_id": "ID_DO_NO_DESTINO",
  "condition_type": "equals",
  "condition_value": "comprar"
}
```

`GET /api/v1/flows/:flowId/edges`

### Webhook fake

`POST /api/v1/webhook/whatsapp`

Payload:

```json
{
  "phone": "79999999999",
  "message": "Quero comprar",
  "chatbot_id": "COLE_AQUI_O_ID_DO_CHATBOT"
}
```

Resposta:

```json
{
  "conversation_id": "uuid",
  "contact_id": "uuid",
  "received_message": "Quero comprar",
  "bot_response": "Ola! Recebemos sua mensagem: Quero comprar. Em breve o fluxo real sera executado."
}
```

## Quais endpoints usam PostgreSQL

Todos os endpoints de negocio da Sprint 01 usam PostgreSQL nesta sprint:

- `POST /api/v1/chatbots`
- `GET /api/v1/chatbots`
- `GET /api/v1/chatbots/:id`
- `PUT /api/v1/chatbots/:id`
- `DELETE /api/v1/chatbots/:id`
- `POST /api/v1/flows`
- `GET /api/v1/flows`
- `GET /api/v1/flows/:id`
- `PUT /api/v1/flows/:id`
- `DELETE /api/v1/flows/:id`
- `POST /api/v1/flows/:flowId/nodes`
- `GET /api/v1/flows/:flowId/nodes`
- `POST /api/v1/flows/:flowId/edges`
- `GET /api/v1/flows/:flowId/edges`
- `POST /api/v1/webhook/whatsapp`

`GET /health` continua independente do banco.

## Exemplos de teste com curl

Health:

```bash
curl http://localhost:3001/health
```

Criar chatbot:

```bash
curl -X POST http://localhost:3001/api/v1/chatbots \
  -H "Content-Type: application/json" \
  -d '{"name":"Atendimento","organization_id":"org-001","type":"whatsapp"}'
```

Listar chatbots:

```bash
curl http://localhost:3001/api/v1/chatbots
```

Criar fluxo:

```bash
curl -X POST http://localhost:3001/api/v1/flows \
  -H "Content-Type: application/json" \
  -d '{"chatbot_id":"COLE_AQUI_O_ID_DO_CHATBOT","name":"Fluxo de vendas"}'
```

Criar node:

```bash
curl -X POST http://localhost:3001/api/v1/flows/COLE_AQUI_O_ID_DO_FLOW/nodes \
  -H "Content-Type: application/json" \
  -d '{"type":"message","data":{"text":"Ola, como posso ajudar?"},"position_x":100,"position_y":200}'
```

Criar edge:

```bash
curl -X POST http://localhost:3001/api/v1/flows/COLE_AQUI_O_ID_DO_FLOW/edges \
  -H "Content-Type: application/json" \
  -d '{"source_node_id":"ID_DO_NO_ORIGEM","target_node_id":"ID_DO_NO_DESTINO","condition_type":"equals","condition_value":"comprar"}'
```

Webhook fake:

```bash
curl -X POST http://localhost:3001/api/v1/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phone":"79999999999","message":"Quero comprar","chatbot_id":"COLE_AQUI_O_ID_DO_CHATBOT"}'
```

## Limitacoes atuais

- ainda nao existe autenticacao;
- o motor de fluxo continua experimental;
- nao existe integracao real com WhatsApp ou EvolutionAPI;
- nao existe modulo real de IA ou RAG;
- os testes ainda sao manuais;
- sem PostgreSQL configurado localmente, as rotas de negocio retornam erro claro pedindo `DATABASE_URL`.

## Proximos passos

- autenticacao;
- execucao real do motor de fluxo;
- integracao com EvolutionAPI;
- modulo inicial de IA/RAG;
- logs e metricas;
- testes automatizados.
