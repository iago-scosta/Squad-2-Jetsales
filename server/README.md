# Backend JetGO

Backend inicial do JetGO pensado para a primeira entrega da disciplina. A ideia aqui foi montar uma API simples, funcional e facil de explicar, sem banco obrigatorio e sem integracoes reais.

## O que foi feito nesta entrega

- Express configurado com `express.json()` e `cors()`;
- rota `GET /health`;
- prefixo `/api/v1`;
- middlewares de rota nao encontrada e erro global;
- armazenamento temporario em memoria;
- CRUD basico de chatbots;
- CRUD basico de fluxos;
- cadastro e listagem de nodes por fluxo;
- cadastro e listagem de edges por fluxo;
- webhook fake de WhatsApp;
- `flow.engine.js` mantido como experimental, sem execucao real do fluxo.

## Tecnologias

- Node.js
- Express
- Cors
- Nodemon

## Como instalar

```bash
cd server
npm install
```

## Como rodar

Modo desenvolvimento:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

## Base URL

```txt
http://localhost:3001
```

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

Exemplo de update:

```json
{
  "name": "Atendimento principal",
  "is_active": false
}
```

`DELETE /api/v1/chatbots/:id`

### Fluxos

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

Exemplo de update:

```json
{
  "name": "Fluxo comercial",
  "status": "published",
  "version": 2
}
```

`DELETE /api/v1/flows/:id`

### Nodes do fluxo

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

### Edges do fluxo

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

### Webhook fake do WhatsApp

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

## Exemplos de teste com curl

Health:

```bash
curl http://localhost:3001/health
```

Criar chatbot:

```bash
curl -X POST http://localhost:3001/api/v1/chatbots \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Atendimento\",\"organization_id\":\"org-001\",\"type\":\"whatsapp\"}"
```

Listar chatbots:

```bash
curl http://localhost:3001/api/v1/chatbots
```

Criar fluxo:

```bash
curl -X POST http://localhost:3001/api/v1/flows \
  -H "Content-Type: application/json" \
  -d "{\"chatbot_id\":\"COLE_AQUI_O_ID_DO_CHATBOT\",\"name\":\"Fluxo de vendas\"}"
```

Criar node:

```bash
curl -X POST http://localhost:3001/api/v1/flows/COLE_AQUI_O_ID_DO_FLOW/nodes \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"message\",\"data\":{\"text\":\"Ola, como posso ajudar?\"},\"position_x\":100,\"position_y\":200}"
```

Criar edge:

```bash
curl -X POST http://localhost:3001/api/v1/flows/COLE_AQUI_O_ID_DO_FLOW/edges \
  -H "Content-Type: application/json" \
  -d "{\"source_node_id\":\"ID_DO_NO_ORIGEM\",\"target_node_id\":\"ID_DO_NO_DESTINO\",\"condition_type\":\"equals\",\"condition_value\":\"comprar\"}"
```

Webhook fake:

```bash
curl -X POST http://localhost:3001/api/v1/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"79999999999\",\"message\":\"Quero comprar\",\"chatbot_id\":\"COLE_AQUI_O_ID_DO_CHATBOT\"}"
```

## Limitacoes atuais

- os dados ficam em memoria e sao perdidos ao reiniciar o servidor;
- nao existe autenticacao;
- nao existe integracao real com WhatsApp ou EvolutionAPI;
- o motor de fluxo ainda nao executa o caminho completo;
- nao existe banco de dados;
- nao existe modulo real de IA ou RAG.

## Proximos passos

- persistir os dados em PostgreSQL;
- criar autenticacao simples;
- evoluir o motor de fluxo para execucao real;
- integrar com EvolutionAPI;
- criar modulo de IA/RAG;
- adicionar logs e metricas.
