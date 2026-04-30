const express = require('express');
const cors = require('cors');
require('dotenv').config();

const stickerRoutes = require('./src/routes/sticker');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'ColdChain API running' });
});

app.use('/sticker', stickerRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});