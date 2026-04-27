# Backend JetGO

Backend academico do JetGO feito em Node.js + Express.

Nesta etapa o foco e deixar a API simples, coerente e facil de rodar na maquina
de qualquer integrante da equipe. Por isso o projeto usa armazenamento em
memoria: enquanto o servidor estiver ligado, os dados ficam disponiveis. Quando
o processo reinicia, tudo volta para o estado inicial.

## O que existe hoje

- CRUD de chatbots
- CRUD de fluxos
- CRUD basico de nos e edges
- Conversas e mensagens
- Webhook fake do WhatsApp
- Endpoint fake de IA
- Resumo simples de analytics
- Tratamento de erro padronizado

## O que nao existe ainda

- banco real
- autenticacao
- integracao real com WhatsApp
- integracao real com IA

## Como instalar

```bash
cd server
npm install
```

## Como rodar

Modo normal:

```bash
npm start
```

Modo desenvolvimento:

```bash
npm run dev
```

Por padrao o servidor sobe em:

```txt
http://localhost:3001
```

Se quiser mudar a porta, copie o exemplo:

```bash
copy .env.example .env
```

Conteudo esperado:

```env
PORT=3001
```

## Como testar

Teste automatizado:

```bash
npm test
```

Smoke tests manuais:

```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/v1
```

## Rotas principais

- `GET /`
- `GET /health`
- `GET /api/v1`
- `GET /api/v1/chatbots`
- `POST /api/v1/chatbots`
- `GET /api/v1/chatbots/:id`
- `PUT /api/v1/chatbots/:id`
- `PATCH /api/v1/chatbots/:id`
- `DELETE /api/v1/chatbots/:id`
- `GET /api/v1/flows`
- `POST /api/v1/flows`
- `GET /api/v1/flows/:id`
- `PUT /api/v1/flows/:id`
- `PATCH /api/v1/flows/:id`
- `DELETE /api/v1/flows/:id`
- `GET /api/v1/flows/:flowId/nodes`
- `POST /api/v1/flows/:flowId/nodes`
- `PUT /api/v1/flows/:flowId/nodes/:nodeId`
- `PATCH /api/v1/flows/:flowId/nodes/:nodeId`
- `DELETE /api/v1/flows/:flowId/nodes/:nodeId`
- `GET /api/v1/flows/:flowId/edges`
- `POST /api/v1/flows/:flowId/edges`
- `DELETE /api/v1/flows/:flowId/edges/:edgeId`
- `GET /api/v1/conversations`
- `POST /api/v1/conversations`
- `GET /api/v1/conversations/:id`
- `PATCH /api/v1/conversations/:id`
- `DELETE /api/v1/conversations/:id`
- `GET /api/v1/conversations/:id/messages`
- `POST /api/v1/conversations/:id/messages`
- `POST /api/v1/webhook/whatsapp`
- `POST /api/v1/ai/respond`
- `GET /api/v1/analytics/summary`

## Exemplos de payload

Criar chatbot:

```json
{
  "name": "Bot Comercial",
  "type": "hybrid"
}
```

Criar fluxo:

```json
{
  "chatbot_id": "id-do-chatbot",
  "name": "Fluxo Inicial",
  "status": "draft"
}
```

Criar conversa:

```json
{
  "chatbot_id": "id-do-chatbot",
  "contact_name": "Maria",
  "contact_phone": "79999999999"
}
```

Enviar mensagem em uma conversa:

```json
{
  "direction": "out",
  "content": "Posso ajudar com mais alguma coisa?"
}
```

Webhook fake do WhatsApp:

```json
{
  "phone": "79999999999",
  "message": "Quero comprar",
  "chatbot_id": "id-do-chatbot"
}
```

Endpoint fake de IA:

```json
{
  "conversation_id": "id-da-conversa",
  "message": "Qual o preco?"
}
```

## Formato de resposta

Sucesso simples:

```json
{
  "data": {}
}
```

Listas:

```json
{
  "data": [],
  "total": 0
}
```

Erros:

```json
{
  "error": {
    "message": "Mensagem simples",
    "code": "VALIDATION_ERROR"
  }
}
```

## Limitacoes atuais

- armazenamento em memoria
- fluxo ainda simples
- webhook apenas simulado
- IA apenas simulada
- sem login e sem permissoes

## Proximos passos

- persistir em PostgreSQL
- adicionar autenticacao
- melhorar o motor de fluxo
- integrar com frontend
- conectar WhatsApp e IA de verdade
