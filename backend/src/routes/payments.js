/**
 * payments.js — PayU Money integration
 *
 * Flow:
 *  1. POST /api/payments/initiate  → generates txnid + hash → returns form params
 *  2. POST /api/payments/success   → PayU posts here on success → verifies hash → marks booking paid
 *  3. POST /api/payments/failure   → PayU posts here on failure → marks booking failed
 *  4. GET  /api/payments/status/:bookingId → frontend polls for payment status
 */

const router = require('express').Router();
const crypto = require('crypto');
const pool   = require('../db/pool');
const { authenticate } = require('../middleware/auth');

// ── CONFIG ────────────────────────────────────────────────────────────────────
const PAYU_KEY      = process.env.PAYU_KEY      || 'gtKFFx';          // test key
const PAYU_SALT     = process.env.PAYU_SALT     || 'eCwWELxi';        // test salt
const PAYU_BASE_URL = process.env.PAYU_ENV === 'production'
  ? 'https://secure.payu.in/_payment'
  : 'https://test.payu.in/_payment';
const APP_URL       = process.env.APP_URL || 'http://localhost:5000';

// ── SHA-512 hash helper ───────────────────────────────────────────────────────
function sha512(str) {
  return crypto.createHash('sha512').update(str).digest('hex');
}

// PayU hash formula (initiate):
// key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
function makeHash(p) {
  const str = [
    String(PAYU_KEY).trim(),
    String(p.txnid).trim(),
    String(p.amount).trim(),
    String(p.productinfo).trim(),
    String(p.firstname).trim(),
    String(p.email).trim(),
    String(p.udf1||''), String(p.udf2||''), String(p.udf3||''),
    String(p.udf4||''), String(p.udf5||''),
    '','','','','',
    String(PAYU_SALT).trim(),
  ].join('|');
  console.log('PayU hash input:', str);
  return sha512(str);
}

// PayU reverse hash formula (response verification):
// SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
function verifyHash(params) {
  const str = [
    PAYU_SALT,
    params.status,
    '', '', '', '', '',
    params.udf5 || '', params.udf4 || '', params.udf3 || '',
    params.udf2 || '', params.udf1 || '',
    params.email,
    params.firstname,
    params.productinfo,
    params.amount,
    params.txnid,
    PAYU_KEY,
  ].join('|');
  return sha512(str);
}

// ── POST /api/payments/initiate ───────────────────────────────────────────────
// Called by frontend before redirecting to PayU
router.post('/initiate', authenticate, async (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) return res.status(400).json({ error: 'bookingId required' });

  try {
    // Load booking + tenant info
    const { rows } = await pool.query(
      `SELECT b.*, u.name, u.email, u.phone,
              un.number AS unit_number, s.name AS space_name
       FROM bookings b
       JOIN users  u  ON u.id  = b.tenant_id
       JOIN units  un ON un.id = b.unit_id
       JOIN spaces s  ON s.id  = b.space_id
       WHERE b.id = $1`, [bookingId]
    );
    const booking = rows[0];
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.tenant_id !== req.user.id)
      return res.status(403).json({ error: 'Access denied' });
    if (booking.status !== 'approved')
      return res.status(400).json({ error: 'Booking must be approved before payment' });
    if (booking.payment_status === 'paid')
      return res.status(400).json({ error: 'Booking already paid' });

    // Generate unique transaction ID
    const txnid = `SN-${booking.id}-${Date.now()}`;

    // Save txnid to booking so we can match on callback
    await pool.query(
      `UPDATE bookings SET notes = COALESCE(notes,'') || ' txnid:' || $1 WHERE id = $2`,
      [txnid, bookingId]
    );

    // Sanitize — strip pipe chars that would break hash
    const sanitize = s => String(s||'').replace(/[|]/g, '-').trim();
    const productinfo = sanitize(`SpaceNexus Unit ${booking.unit_number} - ${booking.space_name}`);
    const firstname   = sanitize(booking.name.split(' ')[0] || 'Tenant');
    const email       = sanitize(booking.email);

    const params = {
      key        : PAYU_KEY,
      txnid,
      amount     : Number(booking.total).toFixed(2),
      productinfo,
      firstname,
      email,
      phone      : (booking.phone||'9999999999').replace(/\D/g,'').slice(0,10)||'9999999999',
      udf1       : String(bookingId),
      udf2       : '', udf3: '', udf4: '', udf5: '',
      surl       : `${APP_URL}/api/payments/success`,
      furl       : `${APP_URL}/api/payments/failure`,
    };
    params.hash = makeHash(params);
    params.payuUrl = PAYU_BASE_URL;

    res.json(params);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/payments/success ────────────────────────────────────────────────
// PayU POSTs here after successful payment
router.post('/success', async (req, res) => {
  const p = req.body;
  console.log('💳 PayU success callback:', p.txnid, p.status);

  try {
    // Verify hash
    const expectedHash = verifyHash(p);
    if (expectedHash !== p.hash) {
      console.error('❌ Hash mismatch on payment success');
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?payment=failed&reason=hash_mismatch`);
    }

    const bookingId = parseInt(p.udf1);

    // Mark booking as paid + approved
    await pool.query(
      `UPDATE bookings SET payment_status='paid', status='approved' WHERE id=$1`,
      [bookingId]
    );

    // Store PayU transaction reference
    await pool.query(
      `UPDATE bookings SET notes = COALESCE(notes,'') || ' payuid:' || $1 WHERE id=$2`,
      [p.mihpayid || p.payuMoneyId || 'unknown', bookingId]
    );

    // Redirect to frontend with success
    res.redirect(
      `${process.env.CLIENT_URL || 'http://localhost:3000'}?payment=success&bookingId=${bookingId}&txnid=${p.txnid}&amount=${p.amount}`
    );
  } catch (err) {
    console.error(err);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?payment=error`);
  }
});

// ── POST /api/payments/failure ────────────────────────────────────────────────
router.post('/failure', async (req, res) => {
  const p = req.body;
  console.log('❌ PayU failure callback:', p.txnid, p.error_Message);
  const bookingId = parseInt(p.udf1 || '0');
  res.redirect(
    `${process.env.CLIENT_URL || 'http://localhost:3000'}?payment=failed&bookingId=${bookingId}&reason=${encodeURIComponent(p.error_Message || 'Payment failed')}`
  );
});

// ── GET /api/payments/status/:bookingId ───────────────────────────────────────
// Frontend polls this after redirect to get final payment status
router.get('/status/:bookingId', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, status, payment_status, total, from_date, to_date,
              unit_id, space_id, tenant_id
       FROM bookings WHERE id = $1`, [req.params.bookingId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Booking not found' });
    if (rows[0].tenant_id !== req.user.id && req.user.role === 'tenant')
      return res.status(403).json({ error: 'Access denied' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
