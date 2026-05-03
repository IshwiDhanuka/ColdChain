const express = require('express');
const { createRefundConfirmation } = require('../services/refundService');

const router = express.Router();

router.post('/', (req, res) => {
  const refund = createRefundConfirmation({
    orderId: req.body?.orderId,
    breachRefId: req.body?.breachRefId,
  });

  res.status(201).json({ ok: true, data: refund });
});

module.exports = router;
