import { useState } from 'react';
import { C, rupee } from '../theme';
import { PageHeader, Btn, Card, SearchBar } from '../components/UI';

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT CATALOGUE
// Each entry carries a `generate(user, spaces, bookings)` function that returns
// { filename, mimeType, content } — content is a string (HTML / SVG / CSV / txt)
// ─────────────────────────────────────────────────────────────────────────────

const leaseHtml = (unitNumber, spaceName, tenant, from, to, total, paymentStatus) => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Lease Agreement — Unit ${unitNumber}</title>
<style>
  body{font-family:Arial,sans-serif;margin:0;padding:0;background:#fff;color:#111}
  .page{max-width:780px;margin:auto;padding:48px 56px;border:1px solid #ddd}
  .logo{display:flex;align-items:center;gap:12px;margin-bottom:36px}
  .logo-icon{width:44px;height:44px;background:linear-gradient(135deg,#2563eb,#6366f1);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;color:#fff}
  .logo-text{font-size:24px;font-weight:900;color:#0f172a}
  .logo-text span{color:#3b82f6}
  h1{font-size:22px;color:#0f172a;border-bottom:2px solid #e2e8f0;padding-bottom:12px;margin-bottom:28px}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:10px 40px;margin-bottom:28px}
  .meta-item label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;display:block;margin-bottom:3px}
  .meta-item span{font-size:14px;color:#0f172a;font-weight:600}
  .section{background:#f8fafc;border-radius:10px;padding:18px 22px;margin-bottom:20px}
  .section h3{font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin:0 0 12px}
  .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;font-size:13px}
  .row:last-child{border-bottom:none}
  .row .label{color:#64748b} .row .value{font-weight:700;color:#0f172a}
  .total-row{display:flex;justify-content:space-between;padding:12px 0;font-size:16px;font-weight:800;color:#2563eb}
  .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase}
  .badge-paid{background:#dcfce7;color:#15803d}
  .badge-unpaid{background:#fef9c3;color:#854d0e}
  .terms{font-size:12px;color:#64748b;line-height:1.7;margin-bottom:24px}
  .sigs{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px}
  .sig-line{border-top:1.5px solid #cbd5e1;padding-top:8px;font-size:11px;color:#94a3b8}
  .footer{margin-top:36px;text-align:center;font-size:10px;color:#cbd5e1}
</style>
</head>
<body>
<div class="page">
  <div class="logo">
    <div class="logo-icon">🏢</div>
    <div class="logo-text">Space<span>Nexus</span></div>
  </div>
  <h1>Commercial Space Lease Agreement</h1>
  <div class="meta">
    <div class="meta-item"><label>Document No.</label><span>SN-LEASE-${Date.now().toString().slice(-6)}</span></div>
    <div class="meta-item"><label>Date Issued</label><span>${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</span></div>
    <div class="meta-item"><label>Unit Number</label><span>${unitNumber}</span></div>
    <div class="meta-item"><label>Space / Property</label><span>${spaceName}</span></div>
    <div class="meta-item"><label>Payment Status</label><span><span class="badge badge-${paymentStatus}">${paymentStatus.toUpperCase()}</span></span></div>
  </div>
  <div class="section">
    <h3>Parties</h3>
    <div class="row"><span class="label">Lessor (Space Owner)</span><span class="value">SpaceNexus Platform Pvt. Ltd.</span></div>
    <div class="row"><span class="label">Lessee (Tenant)</span><span class="value">${tenant.name}</span></div>
    <div class="row"><span class="label">Tenant Email</span><span class="value">${tenant.email}</span></div>
    <div class="row"><span class="label">Tenant Phone</span><span class="value">${tenant.phone||'—'}</span></div>
    <div class="row"><span class="label">Business Name</span><span class="value">${tenant.business||'—'}</span></div>
    <div class="row"><span class="label">GST Number</span><span class="value">${tenant.gst||'—'}</span></div>
  </div>
  <div class="section">
    <h3>Lease Terms</h3>
    <div class="row"><span class="label">Lease Start Date</span><span class="value">${from}</span></div>
    <div class="row"><span class="label">Lease End Date</span><span class="value">${to}</span></div>
    <div class="row"><span class="label">Unit</span><span class="value">${unitNumber} — ${spaceName}</span></div>
    <div class="total-row"><span>Total Amount</span><span>${rupee(total)}</span></div>
  </div>
  <div class="section">
    <h3>Cancellation & Refund Policy</h3>
    <div class="row"><span class="label">≥ 10 days before start</span><span class="value">85% refund</span></div>
    <div class="row"><span class="label">5–9 days before start</span><span class="value">70% refund</span></div>
    <div class="row"><span class="label">2–4 days before start</span><span class="value">40% refund</span></div>
    <div class="row"><span class="label">< 2 days before start</span><span class="value">No refund</span></div>
  </div>
  <div class="terms">
    <strong>Terms & Conditions:</strong><br/>
    1. The lessee agrees to use the leased unit solely for the purpose stated in the booking request.<br/>
    2. The lessee shall not sublet or transfer the unit without written consent from SpaceNexus.<br/>
    3. The lessee is responsible for any damage caused to the unit during the lease period.<br/>
    4. SpaceNexus reserves the right to terminate the lease with 48-hour notice in case of policy violation.<br/>
    5. Payment must be completed within 24 hours of booking approval; failure will result in auto-cancellation.<br/>
    6. All disputes are subject to jurisdiction of Mumbai courts.
  </div>
  <div class="sigs">
    <div><div class="sig-line">Authorised Signatory — SpaceNexus</div></div>
    <div><div class="sig-line">Lessee Signature — ${tenant.name}</div></div>
  </div>
  <div class="footer">SpaceNexus Platform Pvt. Ltd. · support@spacenexus.com · This is a system-generated document.</div>
</div>
</body>
</html>`;

const permissionHtml = (unitNumber, spaceName, tenant) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>Permission Letter — Unit ${unitNumber}</title>
<style>
  body{font-family:Arial,sans-serif;margin:0;padding:0;background:#fff;color:#111}
  .page{max-width:720px;margin:auto;padding:56px 60px}
  .logo{display:flex;align-items:center;gap:12px;margin-bottom:40px}
  .logo-icon{width:40px;height:40px;background:linear-gradient(135deg,#2563eb,#6366f1);border-radius:9px;font-size:20px;color:#fff;display:flex;align-items:center;justify-content:center}
  .logo-text{font-size:22px;font-weight:900;color:#0f172a}
  .logo-text span{color:#3b82f6}
  h1{font-size:18px;color:#0f172a;margin-bottom:8px}
  .date{color:#94a3b8;font-size:13px;margin-bottom:32px}
  p{font-size:14px;color:#334155;line-height:1.8;margin-bottom:16px}
  .highlight{background:#eff6ff;border-left:4px solid #3b82f6;padding:14px 18px;border-radius:4px;margin:24px 0;font-size:14px;color:#1e40af}
  .sig{margin-top:56px;border-top:1.5px solid #e2e8f0;padding-top:12px;font-size:12px;color:#94a3b8}
  .footer{margin-top:40px;text-align:center;font-size:10px;color:#cbd5e1}
</style>
</head>
<body>
<div class="page">
  <div class="logo"><div class="logo-icon">🏢</div><div class="logo-text">Space<span>Nexus</span></div></div>
  <h1>Permission & Authorisation Letter</h1>
  <div class="date">${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</div>
  <p>To Whom It May Concern,</p>
  <p>This letter is to certify that <strong>${tenant.name}</strong> (${tenant.business||'Individual'}, GST: ${tenant.gst||'N/A'}) has been granted permission to occupy and use the commercial advertising unit described below, in accordance with the terms agreed upon through the SpaceNexus platform.</p>
  <div class="highlight">
    <strong>Unit:</strong> ${unitNumber} &nbsp;|&nbsp; <strong>Property:</strong> ${spaceName}<br/>
    <strong>Issued to:</strong> ${tenant.name} &nbsp;|&nbsp; <strong>Email:</strong> ${tenant.email}
  </div>
  <p>This permission is granted for the specific booking period as mentioned in the corresponding Lease Agreement. The holder of this document is authorised to set up and operate advertising materials within the allocated unit boundaries only.</p>
  <p>Any misuse, subletting or unauthorised modification of the unit will result in immediate termination of this permission without refund.</p>
  <p>Please allow the bearer access to the above-mentioned unit during the approved dates.</p>
  <p>Regards,<br/><strong>SpaceNexus Platform Pvt. Ltd.</strong></p>
  <div class="sig">Authorised Signatory — SpaceNexus Platform Pvt. Ltd.</div>
  <div class="footer">SpaceNexus · This document is system-generated and digitally authorised.</div>
</div>
</body>
</html>`;

const gstHtml = (tenant) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>GST Certificate — ${tenant.name}</title>
<style>
  body{font-family:Arial,sans-serif;margin:0;padding:0;background:#fff;color:#111}
  .page{max-width:720px;margin:auto;padding:48px 56px;border:2px solid #2563eb}
  .header{text-align:center;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #e2e8f0}
  .logo-text{font-size:26px;font-weight:900;color:#0f172a;margin-bottom:6px}
  .logo-text span{color:#3b82f6}
  .cert-title{font-size:18px;color:#2563eb;font-weight:700;letter-spacing:1px;text-transform:uppercase}
  .cert-no{font-size:12px;color:#94a3b8;margin-top:4px}
  .fields{margin:24px 0}
  .field{display:flex;padding:12px 0;border-bottom:1px solid #f1f5f9}
  .field label{width:220px;font-size:12px;text-transform:uppercase;letter-spacing:.8px;color:#94a3b8;font-weight:600;padding-top:2px}
  .field span{flex:1;font-size:14px;font-weight:700;color:#0f172a}
  .gst-box{background:#eff6ff;border:2px solid #3b82f6;border-radius:12px;padding:20px 24px;text-align:center;margin:24px 0}
  .gst-box label{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#3b82f6;font-weight:700;display:block;margin-bottom:8px}
  .gst-box span{font-size:28px;font-weight:900;color:#1e40af;letter-spacing:2px;font-family:monospace}
  .footer-note{font-size:11px;color:#94a3b8;text-align:center;margin-top:24px;line-height:1.6}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo-text">Space<span>Nexus</span></div>
    <div class="cert-title">GST Registration Certificate</div>
    <div class="cert-no">Cert No: SN-GST-${Date.now().toString().slice(-6)} · Issued: ${new Date().toLocaleDateString('en-IN')}</div>
  </div>
  <div class="gst-box">
    <label>GST Identification Number</label>
    <span>${tenant.gst||'NOT PROVIDED'}</span>
  </div>
  <div class="fields">
    <div class="field"><label>Business / Taxpayer Name</label><span>${tenant.business||tenant.name}</span></div>
    <div class="field"><label>Authorised Person</label><span>${tenant.name}</span></div>
    <div class="field"><label>Email Address</label><span>${tenant.email}</span></div>
    <div class="field"><label>Phone</label><span>${tenant.phone||'—'}</span></div>
    <div class="field"><label>Business Type</label><span>${tenant.businessType||'Commercial'}</span></div>
    <div class="field"><label>Location</label><span>${tenant.location||'—'}</span></div>
    <div class="field"><label>Registration Status</label><span style="color:#15803d">✓ Active</span></div>
  </div>
  <div class="footer-note">
    This certificate is auto-generated by SpaceNexus platform for record purposes.<br/>
    Verify GST details at <strong>www.gst.gov.in</strong> using the GSTIN above.
  </div>
</div>
</body>
</html>`;

const idProofHtml = (tenant) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>ID Proof Record — ${tenant.name}</title>
<style>
  body{font-family:Arial,sans-serif;margin:0;padding:48px 56px;background:#fff;color:#111}
  .logo-text{font-size:22px;font-weight:900;color:#0f172a;margin-bottom:32px}
  .logo-text span{color:#3b82f6}
  h1{font-size:18px;margin-bottom:24px;color:#0f172a;border-bottom:2px solid #e2e8f0;padding-bottom:10px}
  .field{display:flex;padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px}
  .field label{width:200px;color:#64748b;font-weight:600}
  .field span{flex:1;color:#0f172a;font-weight:700}
  .placeholder{margin:28px 0;background:#f8fafc;border:2px dashed #cbd5e1;border-radius:12px;padding:40px;text-align:center;color:#94a3b8;font-size:13px}
  .note{margin-top:24px;font-size:12px;color:#94a3b8;line-height:1.6}
</style>
</head>
<body>
  <div class="logo-text">Space<span>Nexus</span></div>
  <h1>Identity Proof — Verification Record</h1>
  <div class="field"><label>Full Name</label><span>${tenant.name}</span></div>
  <div class="field"><label>Email</label><span>${tenant.email}</span></div>
  <div class="field"><label>Phone</label><span>${tenant.phone||'—'}</span></div>
  <div class="field"><label>Business</label><span>${tenant.business||'—'}</span></div>
  <div class="field"><label>GST</label><span>${tenant.gst||'—'}</span></div>
  <div class="field"><label>Verification Status</label><span style="color:#15803d">✓ Verified</span></div>
  <div class="field"><label>Date Uploaded</label><span>${new Date().toLocaleDateString('en-IN')}</span></div>
  <div class="placeholder">
    📎 Original ID proof document (Aadhaar / PAN / Passport)<br/>
    uploaded by tenant at registration — stored securely on server
  </div>
  <div class="note">This record is for internal SpaceNexus administrative use only. ID documents are handled in compliance with applicable data protection regulations.</div>
</body>
</html>`;

const floorPlanSvg = (spaceName) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0L0 0 0 40" fill="none" stroke="#e2e8f0" stroke-width="1"/>
    </pattern>
    <style>
      text { font-family: Arial, sans-serif; }
      .unit-label { font-size:11px; font-weight:700; fill:#1e40af; }
      .unit-type  { font-size:9px;  fill:#64748b; }
      .unit-price { font-size:9px;  fill:#059669; font-weight:600; }
    </style>
  </defs>
  <!-- Background -->
  <rect width="900" height="600" fill="#f8fafc"/>
  <rect width="900" height="600" fill="url(#grid)"/>
  <!-- Outer walls -->
  <rect x="40" y="60" width="820" height="490" fill="none" stroke="#1e40af" stroke-width="3" rx="4"/>
  <!-- Title bar -->
  <rect x="0" y="0" width="900" height="52" fill="#2563eb"/>
  <text x="20" y="33" font-size="20" font-weight="900" fill="#fff">SpaceNexus — ${spaceName} · Floor Plan</text>
  <text x="700" y="33" font-size="12" fill="#93c5fd">Generated: ${new Date().toLocaleDateString('en-IN')}</text>
  <!-- Internal corridors -->
  <line x1="40" y1="310" x2="860" y2="310" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6,4"/>
  <line x1="330" y1="60" x2="330" y2="550" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6,4"/>
  <line x1="600" y1="60" x2="600" y2="550" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6,4"/>
  <!-- Units Row 1 -->
  <rect x="56"  y="76"  width="110" height="90" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="68"  y="117" class="unit-label">Unit A1</text>
  <text x="68"  y="131" class="unit-type">Advert Screen</text>
  <text x="68"  y="145" class="unit-price">₹1,500/day</text>

  <rect x="180" y="76"  width="110" height="90" rx="6" fill="#fee2e2" stroke="#ef4444" stroke-width="2"/>
  <text x="192" y="117" class="unit-label">Unit A2</text>
  <text x="192" y="131" class="unit-type">Banner Slot</text>
  <text x="192" y="145" class="unit-price">Booked</text>

  <rect x="346" y="76"  width="115" height="90" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="358" y="117" class="unit-label">Unit A3</text>
  <text x="358" y="131" class="unit-type">Booth</text>
  <text x="358" y="145" class="unit-price">₹2,000/day</text>

  <rect x="475" y="76"  width="115" height="90" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="487" y="117" class="unit-label">Unit A4</text>
  <text x="487" y="131" class="unit-type">Shop</text>
  <text x="487" y="145" class="unit-price">₹3,500/day</text>

  <rect x="615" y="76"  width="130" height="90" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="627" y="117" class="unit-label">Unit A5</text>
  <text x="627" y="131" class="unit-type">Digital Billboard</text>
  <text x="627" y="145" class="unit-price">₹5,000/day</text>

  <!-- Units Row 2 -->
  <rect x="56"  y="180" width="130" height="95" rx="6" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>
  <text x="72"  y="222" class="unit-label">Unit B1</text>
  <text x="72"  y="236" class="unit-type">Digital Billboard</text>
  <text x="72"  y="250" style="font-size:9px;fill:#f59e0b;font-weight:700">Maintenance</text>

  <rect x="200" y="180" width="110" height="95" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="212" y="222" class="unit-label">Unit B2</text>
  <text x="212" y="236" class="unit-type">Banner Slot</text>
  <text x="212" y="250" class="unit-price">₹700/day</text>

  <rect x="346" y="180" width="115" height="95" rx="6" fill="#fee2e2" stroke="#ef4444" stroke-width="2"/>
  <text x="358" y="222" class="unit-label">Unit B3</text>
  <text x="358" y="236" class="unit-type">Advert Screen</text>
  <text x="358" y="250" class="unit-price">Booked</text>

  <rect x="475" y="180" width="115" height="95" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="487" y="222" class="unit-label">Unit B4</text>
  <text x="487" y="236" class="unit-type">Booth</text>
  <text x="487" y="250" class="unit-price">₹2,200/day</text>

  <rect x="615" y="180" width="130" height="95" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="627" y="222" class="unit-label">Unit B5</text>
  <text x="627" y="236" class="unit-type">Shop</text>
  <text x="627" y="250" class="unit-price">₹3,000/day</text>

  <!-- Labels -->
  <text x="56"  y="320" font-size="11" fill="#94a3b8" font-style="italic">— — — Floor 1 / Floor 2 divider — — —</text>
  <!-- Lower units -->
  <rect x="56"  y="330" width="150" height="110" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="70"  y="385" class="unit-label">Unit C1 (F2)</text>
  <text x="70"  y="399" class="unit-type">Shop · 7×5m</text>
  <text x="70"  y="413" class="unit-price">₹4,000/day</text>

  <rect x="220" y="330" width="175" height="110" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="234" y="385" class="unit-label">Unit C2 (F2)</text>
  <text x="234" y="399" class="unit-type">Digital Billboard 10×8m</text>
  <text x="234" y="413" class="unit-price">₹6,000/day</text>

  <rect x="410" y="330" width="110" height="110" rx="6" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>
  <text x="422" y="385" class="unit-label">Unit C3 (F2)</text>
  <text x="422" y="399" class="unit-type">Banner Slot</text>
  <text x="422" y="413" style="font-size:9px;fill:#f59e0b;font-weight:700">Maintenance</text>

  <rect x="534" y="330" width="120" height="110" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="546" y="385" class="unit-label">Unit C4 (F2)</text>
  <text x="546" y="399" class="unit-type">Booth · 5×4m</text>
  <text x="546" y="413" class="unit-price">₹2,500/day</text>

  <rect x="668" y="330" width="110" height="110" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="680" y="385" class="unit-label">Unit C5 (F2)</text>
  <text x="680" y="399" class="unit-type">Advert Screen</text>
  <text x="680" y="413" class="unit-price">₹1,600/day</text>

  <!-- Legend -->
  <rect x="56" y="468" width="820" height="60" rx="8" fill="#f1f5f9" stroke="#e2e8f0"/>
  <rect x="72"  y="484" width="14" height="14" rx="3" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="92"  y="496" font-size="11" fill="#334155">Available</text>
  <rect x="172" y="484" width="14" height="14" rx="3" fill="#fee2e2" stroke="#ef4444" stroke-width="2"/>
  <text x="192" y="496" font-size="11" fill="#334155">Booked</text>
  <rect x="272" y="484" width="14" height="14" rx="3" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>
  <text x="292" y="496" font-size="11" fill="#334155">Maintenance</text>
  <text x="560" y="499" font-size="10" fill="#94a3b8">SpaceNexus Platform · Auto-generated floor plan</text>
</svg>`;

const spacePhotosHtml = (spaceName) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>Space Photos Info — ${spaceName}</title>
<style>
  body{font-family:Arial,sans-serif;padding:48px 56px;background:#fff;color:#111}
  .logo-text{font-size:22px;font-weight:900;color:#0f172a;margin-bottom:32px}
  .logo-text span{color:#3b82f6}
  h1{font-size:18px;margin-bottom:8px;color:#0f172a}
  .sub{color:#94a3b8;font-size:13px;margin-bottom:28px}
  .gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px}
  .ph{background:#f1f5f9;border:2px solid #e2e8f0;border-radius:12px;padding:40px 20px;text-align:center}
  .ph .emoji{font-size:36px;margin-bottom:8px}
  .ph .label{font-size:12px;color:#64748b}
  .note{font-size:12px;color:#94a3b8;line-height:1.7;background:#f8fafc;padding:16px;border-radius:8px}
</style>
</head>
<body>
<div class="logo-text">Space<span>Nexus</span></div>
<h1>Space Photos Package — ${spaceName}</h1>
<div class="sub">Photography documentation for administrative and marketing use</div>
<div class="gallery">
  <div class="ph"><div class="emoji">🏢</div><div class="label">Main Entrance</div></div>
  <div class="ph"><div class="emoji">🗺️</div><div class="label">Floor 1 Overview</div></div>
  <div class="ph"><div class="emoji">📍</div><div class="label">Unit Locations</div></div>
  <div class="ph"><div class="emoji">🎯</div><div class="label">Premium Units</div></div>
  <div class="ph"><div class="emoji">🚶</div><div class="label">Footfall Areas</div></div>
  <div class="ph"><div class="emoji">💡</div><div class="label">Lighting & Display</div></div>
</div>
<div class="note">
  In a production deployment, this document would be a ZIP archive containing high-resolution JPEG photographs of all common areas, unit locations and entry points for <strong>${spaceName}</strong>.<br/><br/>
  Generated by SpaceNexus Platform on ${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}.
</div>
</body>
</html>`;

// ─────────────────────────────────────────────────────────────────────────────
// MASTER DOCUMENT LIST — generate() receives (user, spaces, bookings)
// ─────────────────────────────────────────────────────────────────────────────
const buildDocList = (user, spaces, bookings) => {
  const spaceName = id => (spaces||[]).find(s=>s.id===id)?.name || `Space #${id}`;

  // Find approved bookings for tenants
  const approvedForTenant = (tenantId) =>
    (bookings||[]).filter(b => b.tenantId===tenantId && b.status==='approved');

  const tenants = [
    { id:3, name:'Priya Singh',  email:'tenant@spacenexus.com',  phone:'9988776655', business:'FreshMart Ltd', businessType:'Retail',      gst:'27AAPFU0939F1ZV', location:'Mumbai'    },
    { id:4, name:'Arjun Mehta',  email:'tenant2@spacenexus.com', phone:'9222333444', business:'AdVision Corp',  businessType:'Advertising', gst:'29AAGCA8719B1Z8', location:'Bangalore' },
  ];
  const getTenant = id => tenants.find(t=>t.id===id) || user;

  const docs = [];

  // ── Lease agreements (one per approved booking) ───────────────────────────
  const leaseSrc = user.role==='tenant'
    ? approvedForTenant(user.id)
    : (bookings||[]).filter(b=>b.status==='approved');

  leaseSrc.forEach(b => {
    const tenant = user.role==='tenant' ? user : getTenant(b.tenantId);
    docs.push({
      id      : `lease-${b.id}`,
      name    : `Lease Agreement — Unit ${b.unitNumber}`,
      type    : 'PDF',
      date    : b.from,
      size    : '~245 KB',
      icon    : '📄',
      roles   : ['tenant','admin','super_owner'],
      generate: () => ({
        filename : `Lease_Unit${b.unitNumber}_${b.from}.html`,
        mimeType : 'text/html',
        content  : leaseHtml(b.unitNumber, spaceName(b.spaceId), tenant, b.from, b.to, b.total, b.paymentStatus),
      }),
    });
  });

  // ── Permission letters (one per approved booking) ─────────────────────────
  leaseSrc.forEach(b => {
    const tenant = user.role==='tenant' ? user : getTenant(b.tenantId);
    docs.push({
      id      : `perm-${b.id}`,
      name    : `Permission Letter — Unit ${b.unitNumber}`,
      type    : 'PDF',
      date    : b.from,
      size    : '~120 KB',
      icon    : '📋',
      roles   : ['tenant','admin','super_owner'],
      generate: () => ({
        filename : `Permission_Unit${b.unitNumber}.html`,
        mimeType : 'text/html',
        content  : permissionHtml(b.unitNumber, spaceName(b.spaceId), tenant),
      }),
    });
  });

  // ── GST Certificates (admin/super_owner only) ──────────────────────────────
  if (user.role !== 'tenant') {
    tenants.forEach(t => {
      docs.push({
        id      : `gst-${t.id}`,
        name    : `GST Certificate — ${t.business}`,
        type    : 'PDF',
        date    : '2025-01-10',
        size    : '~180 KB',
        icon    : '🧾',
        roles   : ['admin','super_owner'],
        generate: () => ({
          filename : `GST_${t.business.replace(/\s/g,'_')}.html`,
          mimeType : 'text/html',
          content  : gstHtml(t),
        }),
      });
    });

    // ── ID Proof records ──────────────────────────────────────────────────────
    tenants.forEach(t => {
      docs.push({
        id      : `id-${t.id}`,
        name    : `ID Proof Record — ${t.name}`,
        type    : 'PDF',
        date    : '2025-01-10',
        size    : '~1.2 MB',
        icon    : '🪪',
        roles   : ['admin','super_owner'],
        generate: () => ({
          filename : `IDProof_${t.name.replace(/\s/g,'_')}.html`,
          mimeType : 'text/html',
          content  : idProofHtml(t),
        }),
      });
    });
  }

  // ── Floor plans (SVG) — visible to all ───────────────────────────────────
  (spaces||[]).filter(s=>s.status==='active').forEach(s => {
    docs.push({
      id      : `floor-${s.id}`,
      name    : `Floor Plan — ${s.name}`,
      type    : 'SVG',
      date    : s.createdAt,
      size    : '~340 KB',
      icon    : '🗺️',
      roles   : ['tenant','admin','super_owner'],
      generate: () => ({
        filename : `FloorPlan_${s.name.replace(/\s/g,'_')}.svg`,
        mimeType : 'image/svg+xml',
        content  : floorPlanSvg(s.name),
      }),
    });
  });

  // ── Space photos info ─────────────────────────────────────────────────────
  (spaces||[]).filter(s=>s.status==='active').forEach(s => {
    docs.push({
      id      : `photos-${s.id}`,
      name    : `Space Photos — ${s.name}`,
      type    : 'ZIP',
      date    : s.createdAt,
      size    : '~8 MB',
      icon    : '🖼️',
      roles   : ['tenant','admin','super_owner'],
      generate: () => ({
        filename : `SpacePhotos_${s.name.replace(/\s/g,'_')}.html`,
        mimeType : 'text/html',
        content  : spacePhotosHtml(s.name),
      }),
    });
  });

  return docs.filter(d => d.roles.includes(user.role));
};

// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOAD HELPER — creates a Blob and triggers browser download
// ─────────────────────────────────────────────────────────────────────────────
function triggerDownload(filename, mimeType, content) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
const TC = {
  PDF:{ bg:'rgba(239,68,68,.16)',  c:'#fca5a5' },
  SVG:{ bg:'rgba(16,185,129,.16)', c:'#6ee7b7' },
  ZIP:{ bg:'rgba(245,158,11,.16)', c:'#fde68a' },
};

export default function Documents({ role, user, spaces, bookings }) {
  const [search,   setSearch]   = useState('');
  const [typeF,    setTypeF]    = useState('');
  const [downloading, setDL]    = useState(null);

  const allDocs = buildDocList(user, spaces, bookings);

  const docs = allDocs
    .filter(d => !typeF || d.type === typeF)
    .filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  const handleDownload = (doc) => {
    setDL(doc.id);
    // Small timeout to show feedback, then generate & download
    setTimeout(() => {
      try {
        const { filename, mimeType, content } = doc.generate();
        triggerDownload(filename, mimeType, content);
      } catch(e) {
        console.error('Download error', e);
      }
      setDL(null);
    }, 300);
  };

  return (
    <div>
      <div style={{ marginBottom:16,background:`${C.accent}0d`,border:`1px solid ${C.accent}28`,borderRadius:12,padding:'11px 18px',fontSize:13,color:C.muted }}>
        💡 Documents are <strong style={{color:C.text}}>generated dynamically</strong> from your booking data. Leases open as HTML — use your browser's <strong style={{color:C.text}}>File → Print → Save as PDF</strong> to get a PDF copy.
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:26}}>
        <div>
          <h2 style={{fontSize:26,fontWeight:800,color:'#f1f5f9',fontFamily:"'Syne',sans-serif",margin:0}}>Documents</h2>
          <p style={{color:'#94a3b8',fontSize:14,margin:'5px 0 0'}}>Lease agreements, floor plans & verification documents ({docs.length})</p>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <select value={typeF} onChange={e=>setTypeF(e.target.value)}
            style={{background:'#101420',border:'1px solid #1a2035',borderRadius:10,padding:'8px 14px',color:typeF?'#f1f5f9':'#475569',fontSize:13,outline:'none'}}>
            <option value="">All Types</option>
            {['PDF','SVG','ZIP'].map(t=><option key={t}>{t}</option>)}
          </select>
          <SearchBar value={search} onChange={setSearch} placeholder="Search documents…"/>
        </div>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14 }}>
        {docs.map(d => {
          const t   = TC[d.type] || { bg:'rgba(71,85,105,.2)', c:'#94a3b8' };
          const busy = downloading === d.id;
          return (
            <div key={d.id}
              style={{ background:'#101420',border:`1px solid #1a2035`,borderRadius:16,padding:18,display:'flex',alignItems:'center',gap:14,transition:'border-color .2s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#3b82f6'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#1a2035'}>
              {/* Icon */}
              <div style={{ width:50,height:50,borderRadius:13,background:t.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:23,flexShrink:0 }}>
                {d.icon}
              </div>
              {/* Info */}
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:13,fontWeight:700,color:'#f1f5f9',marginBottom:5,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{d.name}</div>
                <div style={{ display:'flex',gap:8,alignItems:'center' }}>
                  <span style={{ fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:6,background:t.bg,color:t.c }}>{d.type}</span>
                  <span style={{ fontSize:10,color:'#475569' }}>{d.date}</span>
                  <span style={{ fontSize:10,color:'#475569' }}>{d.size}</span>
                </div>
              </div>
              {/* Download button */}
              <button
                onClick={() => handleDownload(d)}
                disabled={busy}
                style={{ flexShrink:0,padding:'8px 14px',borderRadius:9,border:`1px solid ${busy?'#3b82f6':'#1a2035'}`,background:busy?'rgba(37,99,235,.18)':'transparent',color:busy?'#93c5fd':'#475569',cursor:busy?'default':'pointer',fontSize:13,fontWeight:700,transition:'all .18s',display:'flex',alignItems:'center',gap:6,fontFamily:"'DM Sans',sans-serif" }}
                onMouseEnter={e=>{if(!busy){e.currentTarget.style.borderColor='#3b82f6';e.currentTarget.style.color='#93c5fd';e.currentTarget.style.background='rgba(37,99,235,.12)';}}}
                onMouseLeave={e=>{if(!busy){e.currentTarget.style.borderColor='#1a2035';e.currentTarget.style.color='#475569';e.currentTarget.style.background='transparent';}}}>
                {busy
                  ? <><span style={{display:'inline-block',animation:'spin .7s linear infinite'}}>⟳</span> Generating…</>
                  : <>⬇ Download</>
                }
              </button>
            </div>
          );
        })}

        {docs.length === 0 && (
          <div style={{ gridColumn:'1/-1',textAlign:'center',padding:70,color:'#475569' }}>
            <div style={{ fontSize:48,marginBottom:14,opacity:.35 }}>📂</div>
            <div style={{ fontSize:15,fontWeight:600,color:'#94a3b8',marginBottom:6 }}>No documents yet</div>
            <div style={{ fontSize:13 }}>
              {role==='tenant'
                ? 'Documents appear here once your bookings are approved.'
                : 'No documents match your current filter.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

