const router = require('express').Router();

router.post('/', (req, res) => {
  const { name, organization_id } = req.body;

  // mock por enquanto
  const chatbot = {
    id: crypto.randomUUID(),
    name,
    organization_id
  };

  res.json(chatbot);
});

module.exports = router;