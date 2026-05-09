// server/src/app.js

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Rota raiz
app.get('/', (req, res) => {
  res.json({ name: 'JetGO API', status: 'running' });
});

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'jetgo-backend' });
});

// API index
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'JetGO API',
    version: '1.0.0',
    routes: [
      'GET /health',
      'GET /api/v1',
      'GET /api/v1/flows',
    ],
  });
});

// Rotas versionadas
try {
  const flowRoutes = require('./modules/flow/flow.routes');
  if (typeof flowRoutes === 'function') {
    app.use('/api/v1/flows', flowRoutes);
    // legado: mantém /api/flow funcionando enquanto o frontend migra
    app.use('/api/flow', flowRoutes);
  } else {
    console.warn('flow.routes.js não exporta um router');
  }
} catch (err) {
  console.warn('flow.routes.js não está pronto ainda:', err.message);
}

// rotas antigas (mock de chatbot) — manter por enquanto
try {
  const routes = require('./routes');
  app.use('/api', routes);
} catch (err) {
  console.warn('routes/index.js não está pronto ainda');
}

// 404 em JSON
app.use((req, res) => {
  res.status(404).json({
    error: { message: 'Rota não encontrada', code: 'NOT_FOUND' },
  });
});

// Erro genérico em JSON (não vaza stack trace)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
  });
});

module.exports = app;
