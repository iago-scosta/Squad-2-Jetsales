const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/app");
const store = require("../src/database");

test.beforeEach(() => {
  store.resetStore();
});

test("GET /health returns backend status", async () => {
  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.data.status, "ok");
  assert.equal(response.body.data.service, "jetgo-backend");
});

test("GET /api/v1 returns basic route list", async () => {
  const response = await request(app).get("/api/v1");

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.data));
  assert.ok(response.body.total >= 6);
});

test("backend smoke flow works with chatbot, flow, conversations and webhook", async () => {
  const chatbotResponse = await request(app)
    .post("/api/v1/chatbots")
    .send({
      name: "Bot Comercial",
      type: "hybrid",
    });

  assert.equal(chatbotResponse.status, 201);
  assert.equal(chatbotResponse.body.data.organization_id, "default-org");
  const chatbotId = chatbotResponse.body.data.id;

  const listChatbotsResponse = await request(app).get("/api/v1/chatbots");

  assert.equal(listChatbotsResponse.status, 200);
  assert.equal(listChatbotsResponse.body.total, 1);

  const flowResponse = await request(app)
    .post("/api/v1/flows")
    .send({
      chatbot_id: chatbotId,
      name: "Fluxo Inicial",
      status: "published",
    });

  assert.equal(flowResponse.status, 201);
  const flowId = flowResponse.body.data.id;

  const startNodeResponse = await request(app)
    .post(`/api/v1/flows/${flowId}/nodes`)
    .send({
      type: "start",
      data: {
        label: "Inicio",
      },
      position_x: 0,
      position_y: 0,
    });

  assert.equal(startNodeResponse.status, 201);
  const startNodeId = startNodeResponse.body.data.id;

  const messageNodeResponse = await request(app)
    .post(`/api/v1/flows/${flowId}/nodes`)
    .send({
      type: "message",
      data: {
        text: "Bem-vindo ao JetGO!",
      },
      position_x: 120,
      position_y: 80,
    });

  assert.equal(messageNodeResponse.status, 201);
  const messageNodeId = messageNodeResponse.body.data.id;

  const edgeResponse = await request(app)
    .post(`/api/v1/flows/${flowId}/edges`)
    .send({
      source_node_id: startNodeId,
      target_node_id: messageNodeId,
    });

  assert.equal(edgeResponse.status, 201);

  const conversationResponse = await request(app)
    .post("/api/v1/conversations")
    .send({
      chatbot_id: chatbotId,
      contact_name: "Maria",
      contact_phone: "79999999999",
    });

  assert.equal(conversationResponse.status, 201);
  const conversationId = conversationResponse.body.data.id;

  const messageResponse = await request(app)
    .post(`/api/v1/conversations/${conversationId}/messages`)
    .send({
      direction: "out",
      content: "Mensagem manual",
    });

  assert.equal(messageResponse.status, 201);
  assert.equal(messageResponse.body.data.direction, "out");

  const webhookResponse = await request(app)
    .post("/api/v1/webhook/whatsapp")
    .send({
      phone: "11888887777",
      message: "Oi, quero falar sobre preco",
      chatbot_id: chatbotId,
    });

  assert.equal(webhookResponse.status, 200);
  assert.equal(
    webhookResponse.body.data.response_message.content,
    "Bem-vindo ao JetGO!"
  );

  const analyticsResponse = await request(app).get("/api/v1/analytics/summary");

  assert.equal(analyticsResponse.status, 200);
  assert.equal(analyticsResponse.body.data.total_chatbots, 1);
  assert.equal(analyticsResponse.body.data.total_flows, 1);
  assert.equal(analyticsResponse.body.data.total_conversations, 2);
  assert.equal(analyticsResponse.body.data.total_messages, 3);
  assert.equal(analyticsResponse.body.data.total_open_conversations, 2);
  assert.equal(analyticsResponse.body.data.total_closed_conversations, 0);
});
