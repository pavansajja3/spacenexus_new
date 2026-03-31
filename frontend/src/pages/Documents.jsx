import { useState } from 'react';
import { C, rupee } from '../theme';
import { SearchBar } from '../components/UI';

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
</div>
</body>
</html>`;

const permissionHtml = (unitNumber, spaceName, tenant) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>Permission Letter — Unit ${unitNumber}</title></head>
<body style="font-family:Arial,sans-serif;padding:40px">
  <h1>Permission Letter</h1>
  <p>Unit: <strong>${unitNumber}</strong></p>
  <p>Property: <strong>${spaceName}</strong></p>
  <p>Issued to: <strong>${tenant.name}</strong> (${tenant.email})</p>
</body>
</html>`;

const gstHtml = (tenant) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>GST Certificate — ${tenant.name}</title></head>
<body style="font-family:Arial,sans-serif;padding:40px">
  <h1>GST Certificate</h1>
  <p>Name: <strong>${tenant.name}</strong></p>
  <p>Business: <strong>${tenant.business||tenant.name}</strong></p>
  <p>GST: <strong>${tenant.gst||'NOT PROVIDED'}</strong></p>
</body>
</html>`;

const idProofHtml = (tenant) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>ID Proof Record — ${tenant.name}</title></head>
<body style="font-family:Arial,sans-serif;padding:40px">
  <h1>ID Proof Record</h1>
  <p>Name: <strong>${tenant.name}</strong></p>
  <p>Email: <strong>${tenant.email}</strong></p>
</body>
</html>`;

const floorPlanSvg = (spaceName) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
  <rect width="900" height="600" fill="#f8fafc"/>
  <rect x="40" y="60" width="820" height="490" fill="none" stroke="#1e40af" stroke-width="3" rx="4"/>
  <rect x="0" y="0" width="900" height="52" fill="#2563eb"/>
  <text x="20" y="33" font-size="20" font-weight="900" fill="#fff">SpaceNexus — ${spaceName} · Floor Plan</text>
</svg>`;

const spacePhotosHtml = (spaceName) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>Space Photos Info — ${spaceName}</title></head>
<body style="font-family:Arial,sans-serif;padding:40px">
  <h1>Space Photos Package — ${spaceName}</h1>
  <p>Administrative and marketing use only.</p>
</body>
</html>`;

const buildDocList = (user, spaces, bookings) => {
  const spaceName = id => (spaces||[]).find(s=>s.id===id)?.name || `Space #${id}`;

  const approvedForTenant = (tenantId) =>
    (bookings||[]).filter(b => (b.tenantId ?? b.tenant_id) === tenantId && b.status === 'approved');

  const paidForTenant = (tenantId) =>
    (bookings||[]).filter(
      b => (b.tenantId ?? b.tenant_id) === tenantId && (b.paymentStatus ?? b.payment_status) === 'paid'
    );

  const tenants = [
    { id:3, name:'Priya Singh', email:'tenant@spacenexus.com', phone:'9988776655', business:'FreshMart Ltd', businessType:'Retail', gst:'27AAPFU0939F1ZV', location:'Mumbai' },
    { id:4, name:'Arjun Mehta', email:'tenant2@spacenexus.com', phone:'9222333444', business:'AdVision Corp', businessType:'Advertising', gst:'29AAGCA8719B1Z8', location:'Bangalore' },
  ];

  const getTenant = id => tenants.find(t=>t.id===id) || user;
  const docs = [];

  const leaseSrc = user.role === 'tenant'
    ? approvedForTenant(user.id)
    : (bookings||[]).filter(b => b.status === 'approved');

  leaseSrc.forEach(b => {
    const unitNum = b.unitNumber ?? b.unit_number;
    const tenant = user.role === 'tenant' ? user : getTenant(b.tenantId ?? b.tenant_id);
    docs.push({
      id: `lease-${b.id}`,
      name: `Lease Agreement — Unit ${unitNum}`,
      type: 'PDF',
      date: b.from ?? b.from_date,
      size: '~245 KB',
      icon: '📄',
      roles: ['tenant','admin','super_owner'],
      generate: () => ({
        filename: `Lease_Unit${unitNum}.html`,
        mimeType: 'text/html',
        content: leaseHtml(
          unitNum,
          spaceName(b.spaceId ?? b.space_id),
          tenant,
          b.from ?? b.from_date,
          b.to ?? b.to_date,
          b.total,
          b.paymentStatus ?? b.payment_status ?? 'unpaid'
        ),
      }),
    });
  });

  leaseSrc.forEach(b => {
    const unitNum = b.unitNumber ?? b.unit_number;
    const tenant = user.role === 'tenant' ? user : getTenant(b.tenantId ?? b.tenant_id);
    docs.push({
      id: `perm-${b.id}`,
      name: `Permission Letter — Unit ${unitNum}`,
      type: 'PDF',
      date: b.from ?? b.from_date,
      size: '~120 KB',
      icon: '📋',
      roles: ['tenant','admin','super_owner'],
      generate: () => ({
        filename: `Permission_Unit${unitNum}.html`,
        mimeType: 'text/html',
        content: permissionHtml(unitNum, spaceName(b.spaceId ?? b.space_id), tenant),
      }),
    });
  });

  const paymentSrc = user.role === 'tenant'
    ? paidForTenant(user.id)
    : (bookings||[]).filter(b => (b.paymentStatus ?? b.payment_status) === 'paid');

  paymentSrc.forEach(b => {
    const unitNum = b.unitNumber ?? b.unit_number;
    const tenant = user.role === 'tenant' ? user : getTenant(b.tenantId ?? b.tenant_id);
    docs.push({
      id: `pay-${b.id}`,
      name: `Payment Receipt — Unit ${unitNum}`,
      type: 'PDF',
      date: b.from ?? b.from_date,
      size: '~110 KB',
      icon: '💳',
      roles: ['tenant','admin','super_owner'],
      generate: () => ({
        filename: `PaymentReceipt_Unit${unitNum}.html`,
        mimeType: 'text/html',
        content: leaseHtml(
          unitNum,
          spaceName(b.spaceId ?? b.space_id),
          tenant,
          b.from ?? b.from_date,
          b.to ?? b.to_date,
          b.total,
          'paid'
        ),
      }),
    });
  });

  if (user.role !== 'tenant') {
    tenants.forEach(t => {
      docs.push({
        id: `gst-${t.id}`,
        name: `GST Certificate — ${t.business}`,
        type: 'PDF',
        date: '2025-01-10',
        size: '~180 KB',
        icon: '🧾',
        roles: ['admin','super_owner'],
        generate: () => ({
          filename: `GST_${t.business.replace(/\s/g,'_')}.html`,
          mimeType: 'text/html',
          content: gstHtml(t),
        }),
      });
    });

    tenants.forEach(t => {
      docs.push({
        id: `id-${t.id}`,
        name: `ID Proof Record — ${t.name}`,
        type: 'PDF',
        date: '2025-01-10',
        size: '~1.2 MB',
        icon: '🪪',
        roles: ['admin','super_owner'],
        generate: () => ({
          filename: `IDProof_${t.name.replace(/\s/g,'_')}.html`,
          mimeType: 'text/html',
          content: idProofHtml(t),
        }),
      });
    });

    (spaces||[]).filter(s=>s.status==='active').forEach(s => {
      docs.push({
        id: `floor-${s.id}`,
        name: `Floor Plan — ${s.name}`,
        type: 'SVG',
        date: s.createdAt || s.created_at,
        size: '~340 KB',
        icon: '🗺️',
        roles: ['admin','super_owner'],
        generate: () => ({
          filename: `FloorPlan_${s.name.replace(/\s/g,'_')}.svg`,
          mimeType: 'image/svg+xml',
          content: floorPlanSvg(s.name),
        }),
      });
    });

    (spaces||[]).filter(s=>s.status==='active').forEach(s => {
      docs.push({
        id: `photos-${s.id}`,
        name: `Space Photos — ${s.name}`,
        type: 'ZIP',
        date: s.createdAt || s.created_at,
        size: '~8 MB',
        icon: '🖼️',
        roles: ['admin','super_owner'],
        generate: () => ({
          filename: `SpacePhotos_${s.name.replace(/\s/g,'_')}.html`,
          mimeType: 'text/html',
          content: spacePhotosHtml(s.name),
        }),
      });
    });
  }

  return docs.filter(d => d.roles.includes(user.role));
};

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

const TC = {
  PDF:{ bg:'rgba(239,68,68,.16)',  c:'#fca5a5' },
  SVG:{ bg:'rgba(16,185,129,.16)', c:'#6ee7b7' },
  ZIP:{ bg:'rgba(245,158,11,.16)', c:'#fde68a' },
};

export default function Documents({ role, user, spaces, bookings }) {
  const [search, setSearch] = useState('');
  const [typeF, setTypeF] = useState('');
  const [downloading, setDL] = useState(null);

  const allDocs = buildDocList(user, spaces, bookings);

  const docs = allDocs
    .filter(d => !typeF || d.type === typeF)
    .filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  const handleDownload = (doc) => {
    setDL(doc.id);
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
          <p style={{color:'#94a3b8',fontSize:14,margin:'5px 0 0'}}>
            {role === 'tenant'
              ? `Lease and payment documents (${docs.length})`
              : `Lease agreements, floor plans & verification documents (${docs.length})`}
          </p>
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
          const t = TC[d.type] || { bg:'rgba(71,85,105,.2)', c:'#94a3b8' };
          const busy = downloading === d.id;
          return (
            <div key={d.id}
              style={{ background:'#101420',border:`1px solid #1a2035`,borderRadius:16,padding:18,display:'flex',alignItems:'center',gap:14,transition:'border-color .2s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#3b82f6'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#1a2035'}>
              <div style={{ width:50,height:50,borderRadius:13,background:t.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:23,flexShrink:0 }}>
                {d.icon}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:13,fontWeight:700,color:'#f1f5f9',marginBottom:5,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{d.name}</div>
                <div style={{ display:'flex',gap:8,alignItems:'center' }}>
                  <span style={{ fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:6,background:t.bg,color:t.c }}>{d.type}</span>
                  <span style={{ fontSize:10,color:'#475569' }}>{d.date}</span>
                  <span style={{ fontSize:10,color:'#475569' }}>{d.size}</span>
                </div>
              </div>
              <button
                onClick={() => handleDownload(d)}
                disabled={busy}
                style={{ flexShrink:0,padding:'8px 14px',borderRadius:9,border:`1px solid ${busy?'#3b82f6':'#1a2035'}`,background:busy?'rgba(37,99,235,.18)':'transparent',color:busy?'#93c5fd':'#475569',cursor:busy?'default':'pointer',fontSize:13,fontWeight:700,transition:'all .18s',display:'flex',alignItems:'center',gap:6,fontFamily:"'DM Sans',sans-serif" }}
              >
                {busy
                  ? <><span style={{display:'inline-block',animation:'spin .7s linear infinite'}}>⟳</span> Generating…</>
                  : <>⬇ Download</>}
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
                ? 'Only lease and payment documents for your approved bookings appear here.'
                : 'No documents match your current filter.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}