const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const pool = require('../db/pool');

// T-02: Generate sticker
router.post('/generate', async (req, res) => {
  try {
    const { restaurant_id, product_type } = req.body;
    const order_id = uuidv4();
    const sticker_uuid = uuidv4();

    await pool.query(
      `INSERT INTO orders (order_id, restaurant_id, product_type, status)
       VALUES ($1, $2, $3, 'IN_TRANSIT')`,
      [order_id, restaurant_id, product_type]
    );

    await pool.query(
      `INSERT INTO stickers (sticker_uuid, order_id, status)
       VALUES ($1, $2, 'INTACT')`,
      [sticker_uuid, order_id]
    );

    const qr_image = await QRCode.toDataURL(
      `http://localhost:5173/scan/${sticker_uuid}`
    );

    res.json({ sticker_uuid, order_id, qr_image, status: 'INTACT' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// T-03: Lookup sticker
router.get('/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;

    const result = await pool.query(
      `SELECT s.sticker_uuid, s.status, s.pack_temp_celsius,
              o.order_id, o.restaurant_id, o.product_type, o.created_at
       FROM stickers s
       JOIN orders o ON s.order_id = o.order_id
       WHERE s.sticker_uuid = $1`,
      [uuid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sticker not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;