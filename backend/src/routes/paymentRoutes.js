const express = require('express');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const Item = require('../models/Item');
const Payment = require('../models/Payment');

const router = express.Router();

const PAYHERE_CHECKOUT_URL = (process.env.PAYHERE_CHECKOUT_URL || 'https://sandbox.payhere.lk/pay/checkout').trim();
const BOOST_PRICE = Number(process.env.BOOST_PRICE_LKR || 800);
const CURRENCY = 'LKR';

const formatAmount = (amount) => (Number(amount) || 0).toFixed(2);

const hashSecret = (secret) =>
  crypto
    .createHash('md5')
    .update(secret || '')
    .digest('hex')
    .toUpperCase();

const buildCheckoutHash = ({ merchant_id, order_id, amount, currency, merchant_secret }) => {
  const hashedSecret = hashSecret(merchant_secret);
  return crypto
    .createHash('md5')
    .update(`${merchant_id}${order_id}${amount}${currency}${hashedSecret}`)
    .digest('hex')
    .toUpperCase();
};

const buildNotifyHash = ({ merchant_id, order_id, amount, currency, status_code, merchant_secret }) => {
  const hashedSecret = hashSecret(merchant_secret);
  return crypto
    .createHash('md5')
    .update(`${merchant_id}${order_id}${amount}${currency}${status_code}${hashedSecret}`)
    .digest('hex')
    .toUpperCase();
};

const extendBoost = async (itemId) => {
  const item = await Item.findById(itemId);
  if (!item) return null;
  const now = new Date();
  const current = item.boostedUntil && new Date(item.boostedUntil) > now ? new Date(item.boostedUntil) : now;
  const boostedUntil = new Date(current.getTime() + 24 * 60 * 60 * 1000);
  item.boostedUntil = boostedUntil;
  await item.save();
  return boostedUntil;
};

const getPayHereConfig = () => {
  const merchantId = (process.env.PAYHERE_MERCHANT_ID || '').trim();
  const merchantSecret = (process.env.PAYHERE_MERCHANT_SECRET || '').trim();
  return { merchantId, merchantSecret, checkoutUrl: PAYHERE_CHECKOUT_URL };
};

// Create a PayHere checkout payload for boosting an item
router.post('/boost/create', auth, async (req, res, next) => {
  try {
    const { merchantId, merchantSecret, checkoutUrl } = getPayHereConfig();
    if (!merchantId || !merchantSecret) {
      return res
        .status(500)
        .json({ message: 'Payment is not configured yet. Please contact support.', code: 'PAYMENT_NOT_CONFIGURED' });
    }

    const { itemId } = req.body;
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.owner?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can boost this item' });
    }

    const orderId = `boost-${item._id}-${Date.now()}`;
    const amount = formatAmount(BOOST_PRICE);
    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    const apiUrl = process.env.API_URL || 'http://localhost:5000';
    const returnUrl = `${appUrl}/items/${item.slug || item._id}?boostReturn=1&orderId=${orderId}`;
    const cancelUrl = `${appUrl}/items/${item.slug || item._id}?boostCancelled=1`;
    const notifyUrl = `${apiUrl}/api/payments/boost/notify`;

    const payload = {
      merchant_id: merchantId,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      order_id: orderId,
      items: `24h Boost for ${item.title}`,
      amount,
      currency: CURRENCY,
      first_name: req.user.name || 'User',
      last_name: '',
      email: req.user.email || 'no-email@godakpin.lk',
      phone: req.user.mobile || '',
      address: req.user.address || 'Address',
      city: req.user.city || item.city || 'Colombo',
      country: 'Sri Lanka',
      custom_1: item._id.toString(),
      custom_2: req.user._id.toString(),
    };

    payload.hash = buildCheckoutHash({
      merchant_id: payload.merchant_id,
      order_id: payload.order_id,
      amount: payload.amount,
      currency: payload.currency,
      merchant_secret: merchantSecret,
    });

    await Payment.create({
      orderId,
      gateway: 'payhere',
      item: item._id,
      user: req.user._id,
      amount: Number(amount),
      currency: CURRENCY,
      status: 'pending',
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.mobile,
    });

    return res.json({ checkoutUrl, payload });
  } catch (err) {
    return next(err);
  }
});

// PayHere server-to-server notification (IPN)
router.post('/boost/notify', async (req, res, next) => {
  try {
    const { merchantId, merchantSecret } = getPayHereConfig();
    const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig, payment_id } = req.body;

    if (!merchantId || !merchantSecret) {
      return res.status(500).json({ message: 'Payment not configured' });
    }

    // Validate signature
    const expectedSig = buildNotifyHash({
      merchant_id,
      order_id,
      amount: payhere_amount,
      currency: payhere_currency,
      status_code,
      merchant_secret: merchantSecret,
    });
    if (expectedSig !== md5sig) {
      return res.status(400).json({ message: 'Invalid signature' });
    }
    if (merchant_id !== merchantId) {
      return res.status(400).json({ message: 'Invalid merchant' });
    }

    const payment = await Payment.findOne({ orderId: order_id });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (
      formatAmount(payhere_amount) !== formatAmount(payment.amount) ||
      (payhere_currency || '').toUpperCase() !== (payment.currency || '').toUpperCase()
    ) {
      return res.status(400).json({ message: 'Amount or currency mismatch' });
    }

    payment.rawNotification = req.body;
    payment.payherePaymentId = payment_id;
    payment.payhereStatusCode = Number(status_code);

    const alreadyPaid = payment.status === 'paid';

    if (Number(status_code) === 2) {
      payment.status = 'paid';
      payment.paidAt = new Date();
      await payment.save();
      const boostedUntil = await extendBoost(payment.item);
      return res.json({ ok: true, boostedUntil, alreadyPaid });
    }

    if (Number(status_code) === -1) {
      payment.status = 'cancelled';
    } else {
      payment.status = 'failed';
    }
    await payment.save();
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
