// app.js
const express = require('express');
const app = express();

app.use(express.json());

app.use('/chatbots', require('./routes'));
app.use('/flows', require('./routes/flow.routes'));

app.listen(3000, () => console.log('Server running'));