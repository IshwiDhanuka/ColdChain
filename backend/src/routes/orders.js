const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');
const QRCode = require('qrcode');
const {
  appendJsonRecord,
  readJsonArray,
} = require('../storage/jsonStore');

const router = express.Router();
const STORE_FILE = 'orders.json';

const uploadDir = path.resolve(
  process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads')
);

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-product-${Math.random().toString(36).slice(2, 10)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Product photo must be an image file'));
    }
    cb(null, true);
  },
});

function getFrontendOrigin(req) {
  return (
    process.env.FRONTEND_URL ||
    process.env.FRONTEND_ORIGIN ||
    (req.get('origin') || '').replace(/\/$/, '') ||
    'http://localhost:5173'
  );
}

function getApiOrigin(req) {
  return `${req.protocol}://${req.get('host')}`;
}

function makeOrderId() {
  const stamp = Date.now().toString().slice(-6);
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `ORD-${stamp}-${rand}`;
}

function normalizeOrder(row, req) {
  const apiOrigin = getApiOrigin(req);
  return {
    ...row,
    image: row.image?.startsWith('http') ? row.image : `${apiOrigin}${row.image}`,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const rows = await readJsonArray(STORE_FILE);
    res.json({ ok: true, data: rows.map(row => normalizeOrder(row, req)) });
  } catch (err) {
    next(err);
  }
});

router.get('/:orderId', async (req, res, next) => {
  try {
    const rows = await readJsonArray(STORE_FILE);
    const order = rows.find(row => row.orderId.toUpperCase() === req.params.orderId.toUpperCase());

    if (!order) {
      return res.status(404).json({ ok: false, error: 'Order not found' });
    }

    res.json({ ok: true, data: normalizeOrder(order, req) });
  } catch (err) {
    next(err);
  }
});

router.post('/generate', upload.single('photo'), async (req, res, next) => {
  try {
    const {
      product,
      brand = 'Demo Product',
      requiredTempRange = '-18°C to -12°C',
      restaurant = 'Demo Cold Kitchen',
      platform = 'ColdChain Demo',
      stickerStatus = 'intact',
    } = req.body;

    if (!product) {
      return res.status(400).json({ ok: false, error: 'product is required' });
    }

    if (!req.file) {
      return res.status(400).json({ ok: false, error: 'product photo is required' });
    }

    const orderId = makeOrderId();
    const status = stickerStatus === 'breached' ? 'breached' : 'intact';
    const qrUrl = `${getFrontendOrigin(req)}/scan?orderId=${encodeURIComponent(orderId)}`;
    const qrImage = await QRCode.toDataURL(qrUrl);
    const now = new Date();

    const order = {
      orderId,
      product,
      brand,
      image: `/uploads/${req.file.filename}`,
      requiredTempRange,
      restaurant,
      deliveryPartner: 'Generated Demo Partner',
      deliveryPartnerId: `DP-${Math.floor(1000 + Math.random() * 9000)}`,
      orderedAt: now.toISOString(),
      deliveredAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
      stickerId: `STK-${orderId.replace('ORD-', '')}`,
      stickerStatus: status,
      tempAtDispatch: status === 'breached' ? '-6.1°C' : '-16.4°C',
      tempAtDelivery: status === 'breached' ? '+3.4°C' : '-15.9°C',
      tempTimeline: status === 'breached'
        ? [-6.1, -4.2, -1.0, 1.8, 3.4]
        : [-16.4, -16.1, -15.8, -16.0, -15.9],
      partnerScore: status === 'breached' ? 47 : 94,
      platform,
      breachReason: status === 'breached'
        ? 'Generated demo order marked as breached for testing the report flow.'
        : '',
      qrUrl,
      createdAt: now.toISOString(),
    };

    await appendJsonRecord(STORE_FILE, order);

    res.status(201).json({
      ok: true,
      data: {
        order: normalizeOrder(order, req),
        qrUrl,
        qrImage,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
