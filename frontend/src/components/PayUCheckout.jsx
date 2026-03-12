/**
 * PayUCheckout.jsx
 * 
 * How PayU works:
 *  1. Frontend calls backend /api/payments/initiate → gets hash + params
 *  2. We programmatically POST a hidden form to PayU's URL
 *  3. User completes payment on PayU's page
 *  4. PayU redirects back to our backend success/failure URL
 *  5. Backend marks booking paid → redirects to frontend with ?payment=success
 *  6. Frontend detects URL param → shows receipt + confirmation
 */
import { useState } from 'react';
import { C, rupee } from '../theme';
import { Btn } from './UI';
import api from '../api';

// ── Receipt PDF generator (pure HTML → browser print → Save as PDF) ──────────
export function downloadReceipt(booking, user) {
  const now    = new Date().toLocaleString('en-IN');
  const txnid  = (booking.notes || '').match(/txnid:(SN-\S+)/)?.[1] || '—';
  const payuid = (booking.notes || '').match(/payuid:(\S+)/)?.[1]   || '—';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Payment Receipt — SpaceNexus</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#f8fafc; color:#1e293b; }
    .page { max-width:680px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,.10); }
    .header { background:linear-gradient(135deg,#2563eb,#6366f1); color:#fff; padding:36px 40px; }
    .header h1 { font-size:26px; font-weight:900; letter-spacing:-0.5px; margin-bottom:4px; }
    .header p  { font-size:13px; opacity:.8; }
    .badge { display:inline-block; background:rgba(255,255,255,.2); border-radius:20px; padding:5px 16px; font-size:12px; font-weight:700; margin-top:14px; }
    .body  { padding:36px 40px; }
    .section { margin-bottom:28px; }
    .section h2 { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#64748b; margin-bottom:14px; }
    .row { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f1f5f9; font-size:14px; }
    .row:last-child { border-bottom:none; }
    .row .label { color:#64748b; }
    .row .value { font-weight:600; color:#1e293b; text-align:right; }
    .total-row { background:#f0fdf4; border-radius:10px; padding:16px 18px; display:flex; justify-content:space-between; align-items:center; margin-top:20px; }
    .total-row .label { font-size:15px; font-weight:700; color:#166534; }
    .total-row .value { font-size:24px; font-weight:900; color:#166534; }
    .status-badge { display:inline-block; background:#dcfce7; color:#166534; border-radius:20px; padding:6px 18px; font-size:13px; font-weight:700; }
    .footer { background:#f8fafc; padding:22px 40px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #f1f5f9; }
    @media print { body { background:#fff; } .page { box-shadow:none; margin:0; border-radius:0; } }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <h1>🏢 SpaceNexus</h1>
    <p>Commercial Space Booking Platform</p>
    <div class="badge">✅ PAYMENT SUCCESSFUL</div>
  </div>

  <div class="body">
    <div class="section">
      <h2>Receipt Details</h2>
      <div class="row"><span class="label">Receipt Date</span><span class="value">${now}</span></div>
      <div class="row"><span class="label">Transaction ID (SpaceNexus)</span><span class="value">${txnid}</span></div>
      <div class="row"><span class="label">PayU Transaction ID</span><span class="value">${payuid}</span></div>
      <div class="row"><span class="label">Booking ID</span><span class="value">#${booking.id}</span></div>
      <div class="row"><span class="label">Payment Status</span><span class="value"><span class="status-badge">PAID</span></span></div>
    </div>

    <div class="section">
      <h2>Tenant Information</h2>
      <div class="row"><span class="label">Name</span><span class="value">${user.name}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${user.email}</span></div>
      <div class="row"><span class="label">Phone</span><span class="value">${user.phone || '—'}</span></div>
      ${user.business ? `<div class="row"><span class="label">Business</span><span class="value">${user.business}</span></div>` : ''}
      ${user.gst      ? `<div class="row"><span class="label">GST Number</span><span class="value">${user.gst}</span></div>` : ''}
    </div>

    <div class="section">
      <h2>Booking Details</h2>
      <div class="row"><span class="label">Unit</span><span class="value">${booking.unitNumber || booking.unit_number || booking.unit_id}</span></div>
      <div class="row"><span class="label">Space</span><span class="value">${booking.spaceName || booking.space_name || `Space #${booking.space_id}`}</span></div>
      <div class="row"><span class="label">From</span><span class="value">${booking.from || booking.from_date}</span></div>
      <div class="row"><span class="label">To</span><span class="value">${booking.to || booking.to_date}</span></div>
      <div class="row"><span class="label">Duration</span><span class="value">${booking.days || '—'} days</span></div>
    </div>

    <div class="total-row">
      <span class="label">Total Amount Paid</span>
      <span class="value">₹${Number(booking.total).toLocaleString('en-IN')}</span>
    </div>

    <p style="margin-top:20px;font-size:12px;color:#94a3b8;line-height:1.7;">
      This is an electronically generated receipt and does not require a physical signature.
      For any queries contact support@spacenexus.com
    </p>
  </div>

  <div class="footer">
    SpaceNexus · Commercial Space Booking Platform · Hyderabad, India<br/>
    support@spacenexus.com · www.spacenexus.com
  </div>
</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `SpaceNexus_Receipt_Booking_${booking.id}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Payment confirmation toast / modal (shown after PayU redirect) ────────────
export function PaymentSuccessModal({ booking, user, onClose }) {
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <div style={{ background:C.card,border:`1px solid ${C.border2}`,borderRadius:22,padding:40,maxWidth:480,width:'100%',textAlign:'center',animation:'scaleIn .2s ease',boxShadow:'0 40px 100px rgba(0,0,0,.6)' }}>
        {/* Success animation */}
        <div style={{ width:80,height:80,borderRadius:'50%',background:`${C.green}20`,border:`3px solid ${C.green}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,margin:'0 auto 20px' }}>
          ✅
        </div>

        <div style={{ fontSize:24,fontWeight:900,color:C.text,fontFamily:"'Syne',sans-serif",marginBottom:8 }}>
          Payment Successful!
        </div>
        <div style={{ fontSize:14,color:C.muted,marginBottom:24,lineHeight:1.7 }}>
          Your booking has been confirmed. A receipt has been downloaded automatically.
        </div>

        {/* Amount pill */}
        <div style={{ background:`${C.green}14`,border:`1px solid ${C.green}30`,borderRadius:14,padding:'14px 24px',marginBottom:24,display:'inline-block' }}>
          <div style={{ fontSize:11,color:C.green,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:4 }}>Amount Paid</div>
          <div style={{ fontSize:28,fontWeight:900,color:C.green,fontFamily:"'Syne',sans-serif" }}>
            ₹{Number(booking.total).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Details */}
        <div style={{ background:C.surface,borderRadius:12,padding:16,marginBottom:24,textAlign:'left' }}>
          {[
            ['Booking ID',  `#${booking.id}`],
            ['Unit',        booking.unitNumber || booking.unit_number || booking.unit_id],
            ['From',        booking.from || booking.from_date],
            ['To',          booking.to   || booking.to_date],
          ].map(([l, v]) => (
            <div key={l} style={{ display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.border}`,fontSize:13 }}>
              <span style={{ color:C.muted }}>{l}</span>
              <span style={{ color:C.text, fontWeight:600 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Email confirmation note */}
        <div style={{ background:`${C.accent}0d`,border:`1px solid ${C.accent}25`,borderRadius:10,padding:'10px 14px',marginBottom:20,fontSize:12,color:C.muted,display:'flex',alignItems:'center',gap:8 }}>
          <span style={{ fontSize:16 }}>📧</span>
          <span>Confirmation sent to <strong style={{ color:C.accentL }}>{user.email}</strong></span>
        </div>

        <div style={{ display:'flex',gap:10 }}>
          <Btn variant="ghost" style={{ flex:1 }} onClick={() => { downloadReceipt(booking, user); }}>
            📄 Download Receipt
          </Btn>
          <Btn style={{ flex:1 }} onClick={onClose}>
            Done ✓
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── Payment failure modal ─────────────────────────────────────────────────────
export function PaymentFailedModal({ reason, onClose, onRetry }) {
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <div style={{ background:C.card,border:`1px solid ${C.border2}`,borderRadius:22,padding:40,maxWidth:440,width:'100%',textAlign:'center',animation:'scaleIn .2s ease' }}>
        <div style={{ width:72,height:72,borderRadius:'50%',background:`${C.red}18`,border:`3px solid ${C.red}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,margin:'0 auto 18px' }}>
          ❌
        </div>
        <div style={{ fontSize:22,fontWeight:900,color:C.text,fontFamily:"'Syne',sans-serif",marginBottom:8 }}>Payment Failed</div>
        <div style={{ fontSize:14,color:C.muted,marginBottom:20,lineHeight:1.7 }}>
          {reason || 'Your payment could not be processed. Your booking is still approved — you can try again.'}
        </div>
        <div style={{ display:'flex',gap:10 }}>
          <Btn variant="ghost" style={{ flex:1 }} onClick={onClose}>Cancel</Btn>
          <Btn variant="danger" style={{ flex:1 }} onClick={onRetry}>Try Again</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Main PayU checkout button component ───────────────────────────────────────
export default function PayUCheckout({ booking, user, onSuccess, notify }) {
  const [loading, setLoading] = useState(false);

  const initiatePayment = async () => {
    setLoading(true);
    try {
      // Get payment params from backend
      const params = await api.payments.initiate(booking.id);

      // Build a hidden form and submit it to PayU
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = params.payuUrl;

      const fields = [
        'key','txnid','amount','productinfo','firstname','email',
        'phone','udf1','surl','furl','hash'
      ];

      fields.forEach(key => {
        if (params[key] !== undefined) {
          const input    = document.createElement('input');
          input.type     = 'hidden';
          input.name     = key;
          input.value    = params[key];
          form.appendChild(input);
        }
      });

      document.body.appendChild(form);
      form.submit();
      // Page will redirect to PayU — no need to setLoading(false)
    } catch (err) {
      setLoading(false);
      notify(err.message || 'Could not initiate payment', 'warn');
    }
  };

  return (
    <Btn
      size="sm"
      variant="success"
      disabled={loading}
      onClick={initiatePayment}
    >
      {loading ? '⏳ Loading…' : '💳 Pay Now'}
    </Btn>
  );
}

// ── Lease Agreement Download ──────────────────────────────────────────────────
export function downloadLease(booking, user) {
  const today     = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' });
  const fromDate  = booking.from_date || booking.from || '—';
  const toDate    = booking.to_date   || booking.to   || '—';
  const unit      = booking.unit_number || booking.unitNumber || booking.unit_id || '—';
  const space     = booking.space_name  || booking.spaceName  || `Space #${booking.space_id}` || '—';
  const days      = booking.days || '—';
  const total     = Number(booking.total || 0).toLocaleString('en-IN');
  const monthly   = booking.price_monthly || booking.priceMonthly || 0;
  const rent      = monthly ? `₹${Number(monthly).toLocaleString('en-IN')} per month` : `₹${total} for ${days} days`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Lease Agreement — SpaceNexus</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#f8fafc; color:#1e293b; line-height:1.7; }
    .page { max-width:750px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,.10); }
    .header { background:linear-gradient(135deg,#1e40af,#4f46e5); color:#fff; padding:40px 48px; }
    .header h1 { font-size:28px; font-weight:900; letter-spacing:-0.5px; margin-bottom:4px; }
    .header p { font-size:13px; opacity:.8; }
    .badge { display:inline-block; background:rgba(255,255,255,.18); border-radius:20px; padding:5px 18px; font-size:12px; font-weight:700; margin-top:14px; letter-spacing:1px; }
    .body { padding:40px 48px; }
    .title { font-size:20px; font-weight:900; text-align:center; margin-bottom:6px; color:#1e293b; letter-spacing:0.5px; }
    .subtitle { font-size:12px; text-align:center; color:#64748b; margin-bottom:32px; }
    .section { margin-bottom:28px; }
    .section-title { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; color:#3b82f6; margin-bottom:14px; padding-bottom:6px; border-bottom:2px solid #eff6ff; }
    .row { display:flex; justify-content:space-between; padding:9px 0; border-bottom:1px solid #f8fafc; font-size:14px; }
    .row:last-child { border-bottom:none; }
    .label { color:#64748b; font-weight:500; }
    .value { font-weight:700; color:#1e293b; text-align:right; max-width:60%; }
    .clause { margin-bottom:16px; font-size:14px; color:#334155; }
    .clause strong { color:#1e293b; }
    .clause-num { font-weight:800; color:#3b82f6; margin-right:6px; }
    .highlight { background:#eff6ff; border-left:4px solid #3b82f6; border-radius:0 8px 8px 0; padding:14px 18px; margin:20px 0; font-size:14px; color:#1e40af; font-weight:600; }
    .signatures { display:grid; grid-template-columns:1fr 1fr; gap:40px; margin-top:40px; }
    .sig-box { border-top:2px solid #1e293b; padding-top:10px; }
    .sig-label { font-size:11px; color:#64748b; font-weight:700; letter-spacing:1px; text-transform:uppercase; }
    .sig-name { font-size:14px; font-weight:800; color:#1e293b; margin-top:4px; }
    .sig-date { font-size:12px; color:#94a3b8; margin-top:2px; }
    .footer { background:#f8fafc; padding:22px 48px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #f1f5f9; margin-top:8px; }
    .watermark { text-align:center; font-size:11px; color:#cbd5e1; margin-top:16px; letter-spacing:2px; text-transform:uppercase; }
    @media print { body { background:#fff; } .page { box-shadow:none; margin:0; border-radius:0; } }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <h1>🏢 SpaceNexus</h1>
    <p>Commercial Space Booking Platform · Hyderabad, India</p>
    <div class="badge">📋 LEASE AGREEMENT</div>
  </div>

  <div class="body">
    <div class="title">COMMERCIAL SPACE LEASE AGREEMENT</div>
    <div class="subtitle">Booking Reference #${booking.id} · Generated on ${today}</div>

    <!-- Parties -->
    <div class="section">
      <div class="section-title">Parties to the Agreement</div>
      <div class="row"><span class="label">Lessor (Space Owner)</span><span class="value">SpaceNexus Commercial Properties Pvt. Ltd.</span></div>
      <div class="row"><span class="label">Lessee (Tenant Name)</span><span class="value">${user?.name || '—'}</span></div>
      <div class="row"><span class="label">Tenant Email</span><span class="value">${user?.email || '—'}</span></div>
      <div class="row"><span class="label">Tenant Phone</span><span class="value">${user?.phone || '—'}</span></div>
      ${user?.business ? `<div class="row"><span class="label">Business Name</span><span class="value">${user.business}</span></div>` : ''}
      ${user?.gst      ? `<div class="row"><span class="label">GST Number</span><span class="value">${user.gst}</span></div>` : ''}
    </div>

    <!-- Property -->
    <div class="section">
      <div class="section-title">Leased Premises</div>
      <div class="row"><span class="label">Commercial Space</span><span class="value">${space}</span></div>
      <div class="row"><span class="label">Unit Number</span><span class="value">${unit}</span></div>
      <div class="row"><span class="label">Lease Start Date</span><span class="value">${fromDate}</span></div>
      <div class="row"><span class="label">Lease End Date</span><span class="value">${toDate}</span></div>
      <div class="row"><span class="label">Duration</span><span class="value">${days} days</span></div>
    </div>

    <!-- Financial -->
    <div class="section">
      <div class="section-title">Financial Terms</div>
      <div class="row"><span class="label">Rent / License Fee</span><span class="value">${rent}</span></div>
      <div class="row"><span class="label">Total Amount</span><span class="value">₹${total}</span></div>
      <div class="row"><span class="label">Payment Status</span><span class="value">✅ PAID</span></div>
      <div class="row"><span class="label">Security Deposit</span><span class="value">As per agreement</span></div>
    </div>

    <div class="highlight">
      This lease is valid from <strong>${fromDate}</strong> to <strong>${toDate}</strong> for Unit <strong>${unit}</strong> at <strong>${space}</strong>.
    </div>

    <!-- Terms -->
    <div class="section">
      <div class="section-title">Terms and Conditions</div>

      <div class="clause"><span class="clause-num">1.</span><strong>Permitted Use:</strong> The leased premises shall be used solely for lawful commercial purposes as agreed. The lessee shall not sublet or assign the premises without prior written consent from the lessor.</div>

      <div class="clause"><span class="clause-num">2.</span><strong>Maintenance:</strong> The lessee agrees to maintain the premises in good condition and return it in the same state at the end of the lease term, subject to normal wear and tear.</div>

      <div class="clause"><span class="clause-num">3.</span><strong>Utilities:</strong> The lessee shall be responsible for all utility charges including electricity, water, and internet services consumed during the lease period.</div>

      <div class="clause"><span class="clause-num">4.</span><strong>Compliance:</strong> The lessee shall comply with all applicable laws, regulations, and building rules. Any violation may result in immediate termination of this lease.</div>

      <div class="clause"><span class="clause-num">5.</span><strong>Alterations:</strong> No structural alterations, modifications, or improvements shall be made to the premises without prior written approval from the lessor.</div>

      <div class="clause"><span class="clause-num">6.</span><strong>Termination:</strong> Either party may terminate this agreement with 30 days written notice. Early termination may be subject to penalties as agreed between parties.</div>

      <div class="clause"><span class="clause-num">7.</span><strong>Dispute Resolution:</strong> Any disputes arising from this agreement shall be resolved through mutual negotiation. If unresolved, disputes shall be subject to the jurisdiction of courts in Hyderabad, Telangana, India.</div>

      <div class="clause"><span class="clause-num">8.</span><strong>Governing Law:</strong> This agreement shall be governed by and construed in accordance with the laws of India.</div>
    </div>

    <!-- Signatures -->
    <div class="signatures">
      <div class="sig-box">
        <div class="sig-label">Lessor Signature</div>
        <div class="sig-name">SpaceNexus Pvt. Ltd.</div>
        <div class="sig-date">Authorized Signatory</div>
        <div class="sig-date">${today}</div>
      </div>
      <div class="sig-box">
        <div class="sig-label">Lessee Signature</div>
        <div class="sig-name">${user?.name || '—'}</div>
        <div class="sig-date">${user?.business || 'Tenant'}</div>
        <div class="sig-date">${today}</div>
      </div>
    </div>

    <div class="watermark" style="margin-top:28px;">— Electronically Generated · SpaceNexus Platform —</div>
  </div>

  <div class="footer">
    SpaceNexus Commercial Properties Pvt. Ltd. · Hyderabad, Telangana, India<br/>
    support@spacenexus.com · www.spacenexus.com · Booking ID: #${booking.id}
  </div>
</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `SpaceNexus_Lease_Booking_${booking.id}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
