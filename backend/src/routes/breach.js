const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const {
  appendJsonRecord,
  readJsonArray,
  writeJsonArray,
} = require('../storage/jsonStore');
const { createRefundConfirmation } = require('../services/refundService');

const router = express.Router();
const STORE_FILE = 'breaches.json';

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
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Photo evidence must be an image file'));
    }
    cb(null, true);
  },
});

function buildRefId() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BR-${date}-${rand}`;
}

async function removeUploadedFile(file) {
  if (!file?.path) return;
  try {
    await fs.unlink(file.path);
  } catch {
    // Best-effort cleanup only.
  }
}

router.get('/', async (req, res, next) => {
  try {
    const reports = await readJsonArray(STORE_FILE);
    res.json({ ok: true, data: reports });
  } catch (err) {
    next(err);
  }
});

router.post('/', upload.single('photo'), async (req, res, next) => {
  try {
    const {
      orderId,
      breachType,
      product = '',
      deliveryPartner = '',
      deliveryPartnerId = '',
      platform = '',
      description = '',
    } = req.body;

    if (!orderId || !breachType) {
      await removeUploadedFile(req.file);
      return res.status(400).json({
        ok: false,
        error: 'orderId and breachType are required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: 'photo evidence is required',
      });
    }

    const refId = buildRefId();
    const submittedAt = new Date().toISOString();
    const refund = createRefundConfirmation({ orderId, breachRefId: refId });
    const photoUrl = `/uploads/${req.file.filename}`;

    const report = {
      refId,
      orderId,
      product,
      deliveryPartner,
      deliveryPartnerId,
      platform,
      breachType,
      description,
      submittedAt,
      status: 'submitted',
      refundFlag: true,
      refundStatus: refund.status,
      refund,
      photo: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: photoUrl,
      },
    };

    await appendJsonRecord(STORE_FILE, report);

    res.status(201).json({
      ok: true,
      data: {
        refId,
        submittedAt,
        refundFlag: report.refundFlag,
        refundStatus: report.refundStatus,
        refund,
        photoUrl,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    const reports = await readJsonArray(STORE_FILE);
    await Promise.all(reports.map(async (report) => {
      const filename = report.photo?.filename;
      if (!filename) return;
      await removeUploadedFile({
        path: path.join(uploadDir, path.basename(filename)),
      });
    }));
    await writeJsonArray(STORE_FILE, []);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
