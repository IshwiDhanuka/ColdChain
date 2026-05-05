const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const stickerRoutes = require('./src/routes/sticker');
const authRoutes = require('./src/routes/auth');
const breachRoutes = require('./src/routes/breach');
const refundRoutes = require('./src/routes/refund');
const orderRoutes = require('./src/routes/orders');

const app = express();
app.set('trust proxy', 1);
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'ColdChain API running' });
});

app.use('/sticker', stickerRoutes);
app.use('/auth', authRoutes);
app.use('/breach', breachRoutes);
app.use('/refund', refundRoutes);
app.use('/orders', orderRoutes);

app.use((err, req, res, next) => {
  if (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ ok: false, error: err.message || 'Server error' });
  }
  next();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
