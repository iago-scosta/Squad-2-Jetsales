const express = require('express');
const router = express.Router();

// Rota de teste
router.get('/health', (req, res) => {
    res.json({ status: 'Flow routes module is active' });
});

module.exports = router; 