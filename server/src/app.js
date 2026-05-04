// server/src/app.js

const express = require('express');
const app = express();

// Middlewares
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('API is running');
});

// Routes
try {
  const routes = require('./routes');
  app.use('/api', routes);
} catch (err) {
  console.warn('⚠️ routes/index.js not ready yet');
}

// so carrega o modulo de fluxo se ele estiver pronto, para evitar erros de dependência circular
try {
  const flowRoutes = require('./modules/flow/flow.routes');

  if (typeof flowRoutes === 'function') {
    app.use('/api/flow', flowRoutes);
  } else {
    console.warn('⚠️ flow.routes.js does not export a router');
  }
} catch (err) {
  console.warn('⚠️ flow.routes.js not ready yet');
}

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});