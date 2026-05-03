const { v4: uuidv4 } = require('uuid');

function createRefundConfirmation({ orderId, breachRefId }) {
  return {
    refundId: `RF-${uuidv4().slice(0, 8).toUpperCase()}`,
    orderId: orderId || 'UNKNOWN',
    breachRefId: breachRefId || null,
    status: 'initiated',
    amount: 'demo-full-refund',
    paymentMethod: 'original_payment_method',
    processedAt: new Date().toISOString(),
  };
}

module.exports = {
  createRefundConfirmation,
};
