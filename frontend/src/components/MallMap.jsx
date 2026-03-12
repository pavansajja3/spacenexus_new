/**
 * MallMap.jsx — Interactive floor map for SpaceNexus
 *
 * OWNER / ADMIN:
 *   - Upload floor plan image per floor
 *   - DRAG on image to draw a new unit box → fill form → saved to DB via onSaveUnit
 *   - Double-click existing unit → edit modal → saved to DB
 *   - Right panel shows unit list + stats
 *
 * TENANT:
 *   - Sees uploaded floor image with real DB units overlaid
 *   - Hover → tooltip with pricing
 *   - Click available unit → booking modal → saved to DB via addBooking
 *   - Right panel shows unit detail
 *
 * FIX: price_daily / price_weekly / price_monthly now correctly sent to backend
 */
import { useState, useRef, useCallback } from 'react';
import { rupee } from '../theme';

// ── config ────────────────────────────────────────────────────────────────────
const S = {
  available   : { fill:'rgba(52,211,153,0.16)',  stroke:'#34d399', label:'Available',   dot:'#34d399' },
  booked      : { fill:'rgba(248,113,113,0.16)', stroke:'#f87171', label:'Booked',      dot:'#f87171' },
  maintenance : { fill:'rgba(251,191,36,0.13)',  stroke:'#fbbf24', label:'Maintenance', dot:'#fbbf24' },
};
const TYPES  = ['Shop','Booth','Kiosk','Food Court','Anchor Store','Fashion','Beauty','Tech','Sports','Pharmacy','Bank','Entertainment','Storage','Advertisement Screen','Banner Slot','Digital Billboard','Other'];
const TICONS = { Shop:'🛍️',Booth:'🎪',Kiosk:'🏮','Food Court':'🍜','Anchor Store':'🏬',Fashion:'👗',Beauty:'💄',Tech:'💻',Sports:'⚽',Pharmacy:'💊',Bank:'🏦',Entertainment:'🎬',Storage:'📦','Advertisement Screen':'📺','Banner Slot':'🪧','Digital Billboard':'💡',Other:'🏪' };

const clamp = (v,lo,hi) => Math.max(lo, Math.min(hi, v));

// ── tiny UI primitives ────────────────────────────────────────────────────────
const F = ({ label, children }) => (
  <div style={{ marginBottom:12 }}>
    <div style={{ fontSize:10,color:'#475569',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:5 }}>{label}</div>
    {children}
  </div>
);
const Inp = ({ value, onChange, type='text', placeholder, min }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min}
    style={{ width:'100%',background:'#0f1117',border:'1px solid #1e293b',borderRadius:8,
      padding:'8px 11px',color:'#f1f5f9',fontSize:13,outline:'none',fontFamily:'inherit',
      boxSizing:'border-box',colorScheme:'dark',transition:'border-color .2s' }}
    onFocus={e=>e.target.style.borderColor='#34d399'}
    onBlur={e=>e.target.style.borderColor='#1e293b'} />
);
const Sel = ({ value, onChange, options }) => (
  <select value={value} onChange={onChange}
    style={{ width:'100%',background:'#0f1117',border:'1px solid #1e293b',borderRadius:8,
      padding:'8px 11px',color:'#f1f5f9',fontSize:13,outline:'none',fontFamily:'inherit' }}>
    {options.map(o=><option key={o} value={o}>{o}</option>)}
  </select>
);
const PBtn = ({ children, onClick, color='#34d399', disabled, ghost }) => (
  <button onClick={disabled?undefined:onClick} disabled={disabled}
    style={{ padding:'10px 0',borderRadius:10,border:ghost?`1px solid #1e293b`:'none',
      background:ghost?'transparent':disabled?'#1e293b':color,
      color:ghost?'#475569':disabled?'#334155':color==='#34d399'?'#000':'#fff',
      fontSize:13,fontWeight:700,cursor:disabled?'not-allowed':'pointer',
      fontFamily:'inherit',width:'100%',transition:'all .15s',opacity:disabled?.6:1 }}>
    {children}
  </button>
);

// ── Unit form (place new OR edit existing) ────────────────────────────────────
function UnitForm({ initial, onSave, onDelete, onCancel, isNew }) {
  const def = { number:'', type:'Shop', priceDaily:'', priceWeekly:'', priceMonthly:'', status:'available' };
  const [f, setF] = useState(initial
    ? { ...initial,
        number       : initial.number        || '',
        type         : initial.type          || 'Shop',
        status       : initial.status        || 'available',
        priceDaily   : String(initial.price_daily   || initial.priceDaily   || ''),
        priceWeekly  : String(initial.price_weekly  || initial.priceWeekly  || ''),
        priceMonthly : String(initial.price_monthly || initial.priceMonthly || ''),
      }
    : def);
  const s = k => e => setF(p=>({...p,[k]:e.target.value}));

  const handleSave = () => {
    if (!f.number) return;
    const daily   = Number(f.priceDaily)   || 0;
    const weekly  = Number(f.priceWeekly)  || 0;
    const monthly = Number(f.priceMonthly) || 0;
    onSave({
      ...f,
      // send BOTH camelCase and snake_case to be safe
      priceDaily   : daily,
      priceWeekly  : weekly,
      priceMonthly : monthly,
      price_daily  : daily,
      price_weekly : weekly,
      price_monthly: monthly,
    });
  };

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100%' }}>
      <div style={{ padding:'12px 16px',background:'rgba(52,211,153,0.06)',
        borderBottom:'1px solid #ffffff08',flexShrink:0 }}>
        <div style={{ fontSize:10,color:'#34d399',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase' }}>
          {isNew ? '📍 New Unit' : `✏️ Edit Unit ${f.number}`}
        </div>
      </div>

      <div style={{ flex:1,padding:'14px 16px',overflowY:'auto' }}>
        <F label="Unit Number *"><Inp value={f.number} onChange={s('number')} placeholder="e.g. A1, G-12"/></F>
        <F label="Type"><Sel value={f.type} onChange={s('type')} options={TYPES}/></F>
        <F label="Status"><Sel value={f.status} onChange={s('status')} options={['available','booked','maintenance']}/></F>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
          <F label="Daily (₹)"><Inp type="number" value={f.priceDaily}   onChange={s('priceDaily')}   placeholder="2500" min="0"/></F>
          <F label="Weekly (₹)"><Inp type="number" value={f.priceWeekly}  onChange={s('priceWeekly')}  placeholder="15000" min="0"/></F>
        </div>
        <F label="Monthly (₹)"><Inp type="number" value={f.priceMonthly} onChange={s('priceMonthly')} placeholder="55000" min="0"/></F>
      </div>

      <div style={{ padding:'12px 16px',borderTop:'1px solid #ffffff08',display:'flex',flexDirection:'column',gap:8,flexShrink:0 }}>
        <PBtn onClick={handleSave} disabled={!f.number}>
          {isNew ? '✅ Save Unit' : '✅ Save Changes'}
        </PBtn>
        {!isNew && onDelete && (
          <PBtn onClick={()=>onDelete(initial.id)} color='#f87171'>🗑 Delete Unit</PBtn>
        )}
        <PBtn onClick={onCancel} ghost>Cancel</PBtn>
      </div>
    </div>
  );
}

// ── Booking form (tenant) ─────────────────────────────────────────────────────
function BookingForm({ unit, onSubmit, onCancel }) {
  const [from, setFrom] = useState('');
  const [to,   setTo]   = useState('');
  const today = new Date().toISOString().split('T')[0];
  const days  = from && to ? Math.max(1, Math.ceil((new Date(to)-new Date(from))/86400000)) : 0;
  const price = unit.price_daily || unit.priceDaily || 0;
  const total = days * price;
  const col   = S[unit.status] || S.available;

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100%' }}>
      <div style={{ padding:'14px 16px',borderBottom:'1px solid #ffffff08',flexShrink:0 }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:6 }}>
          <div style={{ fontSize:24 }}>{TICONS[unit.type]||'🏪'}</div>
          <div>
            <div style={{ fontSize:15,fontWeight:800,color:'#f1f5f9' }}>Unit {unit.number}</div>
            <div style={{ fontSize:11,color:col.stroke }}>{unit.type}</div>
          </div>
        </div>
        <div style={{ background:`${col.stroke}10`,border:`1px solid ${col.stroke}25`,
          borderRadius:10,padding:'10px 14px' }}>
          <div style={{ fontSize:10,color:'#475569',marginBottom:3 }}>DAILY RATE</div>
          <div style={{ fontSize:22,fontWeight:900,color:col.stroke }}>
            {rupee(price)}<span style={{ fontSize:11,color:'#475569',fontWeight:400 }}>/day</span>
          </div>
          {days>0 && <div style={{ fontSize:13,color:'#94a3b8',marginTop:4 }}>
            {days} days = <strong style={{color:'#f1f5f9'}}>{rupee(total)}</strong>
          </div>}
        </div>
      </div>

      <div style={{ flex:1,padding:'14px 16px',overflowY:'auto' }}>
        <F label="From Date *"><Inp type="date" value={from} min={today} onChange={e=>setFrom(e.target.value)}/></F>
        <F label="To Date *"><Inp type="date" value={to} min={from||today} onChange={e=>setTo(e.target.value)}/></F>
        <div style={{ fontSize:11,color:'#334155',lineHeight:1.8,marginTop:8 }}>
          ⏳ Booking requires admin approval<br/>
          💳 Payment due within 24 hrs of approval<br/>
          📈 Discounts apply for long-term bookings
        </div>
      </div>

      <div style={{ padding:'12px 16px',borderTop:'1px solid #ffffff08',display:'flex',flexDirection:'column',gap:8,flexShrink:0 }}>
        <PBtn onClick={()=>days&&onSubmit({from,to,days,total})} disabled={!days}>
          📅 Submit Booking Request
        </PBtn>
        <PBtn onClick={onCancel} ghost>Cancel</PBtn>
      </div>
    </div>
  );
}

// ── Right panel (tenant view — unit info) ─────────────────────────────────────
function TenantPanel({ unit, onBook, allUnits }) {
  if (!unit) {
    const avail  = allUnits.filter(u=>u.status==='available').length;
    const booked = allUnits.filter(u=>u.status==='booked').length;
    const maint  = allUnits.filter(u=>u.status==='maintenance').length;
    return (
      <div style={{ display:'flex',flexDirection:'column',height:'100%' }}>
        <div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',
          justifyContent:'center',padding:24,textAlign:'center' }}>
          <div style={{ fontSize:44,opacity:.12,marginBottom:14 }}>🏬</div>
          <div style={{ fontSize:13,color:'#334155',lineHeight:1.9 }}>
            Hover or click any unit<br/>on the map to see details
          </div>
        </div>
        <div style={{ padding:'16px',borderTop:'1px solid #ffffff08' }}>
          <div style={{ fontSize:10,color:'#334155',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:10 }}>Floor Summary</div>
          {[['Available',avail,S.available],['Booked',booked,S.booked],['Maintenance',maint,S.maintenance]].map(([l,v,c])=>(
            <div key={l} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',
              padding:'8px 12px',borderRadius:9,marginBottom:6,background:c.fill,border:`1px solid ${c.stroke}25` }}>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <div style={{ width:7,height:7,borderRadius:2,background:c.stroke }}/>
                <span style={{ fontSize:12,color:'#94a3b8' }}>{l}</span>
              </div>
              <span style={{ fontSize:17,fontWeight:900,color:c.stroke }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const col = S[unit.status] || S.available;
  const pd  = unit.price_daily   || unit.priceDaily   || 0;
  const pw  = unit.price_weekly  || unit.priceWeekly  || 0;
  const pm  = unit.price_monthly || unit.priceMonthly || 0;

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100%',animation:'snSlide .2s ease' }}>
      <style>{`@keyframes snSlide{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <div style={{ flex:1,padding:'16px',overflowY:'auto' }}>
        <div style={{ display:'flex',alignItems:'flex-start',gap:12,marginBottom:14 }}>
          <div style={{ width:48,height:48,borderRadius:12,background:col.fill,
            border:`1.5px solid ${col.stroke}40`,display:'flex',alignItems:'center',
            justifyContent:'center',fontSize:22,flexShrink:0 }}>
            {TICONS[unit.type]||'🏪'}
          </div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:17,fontWeight:900,color:'#f1f5f9',marginBottom:3 }}>Unit {unit.number}</div>
            <div style={{ display:'flex',alignItems:'center',gap:6 }}>
              <div style={{ width:6,height:6,borderRadius:'50%',background:col.dot,
                boxShadow:`0 0 5px ${col.dot}` }}/>
              <span style={{ fontSize:10,color:col.stroke,fontWeight:700,letterSpacing:1.2,textTransform:'uppercase' }}>{col.label}</span>
            </div>
          </div>
        </div>
        <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:14 }}>
          {[unit.type,`Floor ${unit.floor}`,unit.width&&unit.height?`${unit.width}×${unit.height}m`:null].filter(Boolean).map(t=>(
            <span key={t} style={{ fontSize:10,color:'#475569',background:'#1e293b',
              border:'1px solid #334155',borderRadius:6,padding:'3px 8px',fontWeight:600 }}>{t}</span>
          ))}
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:14 }}>
          {[['Daily',pd],['Weekly',pw],['Monthly',pm]].map(([l,v])=>(
            <div key={l} style={{ background:`${col.stroke}0e`,border:`1px solid ${col.stroke}25`,
              borderRadius:10,padding:'10px 8px',textAlign:'center' }}>
              <div style={{ fontSize:9,color:'#475569',letterSpacing:1,marginBottom:4 }}>{l.toUpperCase()}</div>
              <div style={{ fontSize:13,fontWeight:800,color:col.stroke }}>{rupee(v)}</div>
            </div>
          ))}
        </div>
        {unit.tenant_name && (
          <div style={{ background:'#0f1117',border:'1px solid #1e293b',borderRadius:10,padding:'12px',marginBottom:12 }}>
            <div style={{ fontSize:9,color:'#334155',letterSpacing:1.5,textTransform:'uppercase',marginBottom:6 }}>Current Tenant</div>
            <div style={{ fontSize:13,fontWeight:700,color:'#94a3b8' }}>🔑 {unit.tenant_name}</div>
          </div>
        )}
      </div>
      <div style={{ padding:'12px 16px',borderTop:'1px solid #ffffff08',flexShrink:0 }}>
        {unit.status==='available'
          ? <PBtn onClick={()=>onBook(unit)}>📅 Book This Unit</PBtn>
          : <div style={{ textAlign:'center',padding:'11px',borderRadius:10,
              background:`${col.stroke}0a`,border:`1px solid ${col.stroke}25`,
              fontSize:13,color:col.stroke,fontWeight:600 }}>
              {unit.status==='booked'?'🔒 Currently Occupied':'🔧 Under Maintenance'}
            </div>
        }
      </div>
    </div>
  );
}

// ── Owner right panel — unit list ─────────────────────────────────────────────
function OwnerPanel({ units, onEdit }) {
  const avail  = units.filter(u=>u.status==='available').length;
  const booked = units.filter(u=>u.status==='booked').length;
  const maint  = units.filter(u=>u.status==='maintenance').length;
  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100%' }}>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,padding:'14px 16px',borderBottom:'1px solid #ffffff08',flexShrink:0 }}>
        {[['Avail',avail,'#34d399'],['Booked',booked,'#f87171'],['Maint',maint,'#fbbf24']].map(([l,v,c])=>(
          <div key={l} style={{ background:'#0f1117',border:`1px solid #1e293b`,borderRadius:10,padding:'10px 8px',textAlign:'center' }}>
            <div style={{ fontSize:20,fontWeight:900,color:c }}>{v}</div>
            <div style={{ fontSize:9,color:'#475569',letterSpacing:.8 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize:10,color:'#334155',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',
        padding:'12px 16px 6px' }}>Units on this floor ({units.length})</div>

      <div style={{ flex:1,overflowY:'auto',padding:'0 10px 10px' }}>
        {units.length===0 && (
          <div style={{ textAlign:'center',padding:'28px 0',fontSize:12,color:'#1e293b' }}>
            Drag on the map to draw units
          </div>
        )}
        {units.map(u=>{
          const col = S[u.status]||S.available;
          const pd  = u.price_daily || u.priceDaily || 0;
          return (
            <div key={u.id} onClick={()=>onEdit(u)}
              style={{ display:'flex',alignItems:'center',gap:10,background:'#0f1117',
                border:'1px solid #1e293b',borderRadius:10,padding:'10px 12px',marginBottom:6,
                cursor:'pointer',transition:'border-color .15s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=col.stroke}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#1e293b'}>
              <div style={{ fontSize:18 }}>{TICONS[u.type]||'🏪'}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:12,fontWeight:700,color:'#f1f5f9' }}>Unit {u.number}</div>
                <div style={{ fontSize:10,color:'#475569' }}>{u.type}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:10,color:col.stroke,fontWeight:600 }}>{col.label}</div>
                <div style={{ fontSize:10,color:'#334155' }}>{rupee(pd)}/d</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Canvas — the actual map with drag-to-draw + unit overlays ─────────────────
function MapCanvas({ imgSrc, units, isOwner, floor, placementMode, onDrawComplete, onUnitHover, onUnitClick, onUnitDblClick, hoveredId, selectedId }) {
  const ref        = useRef(null);
  const [drag, setDrag] = useState(null);
  const [rect, setRect] = useState(null);

  const pct = useCallback(e => {
    const r = ref.current.getBoundingClientRect();
    return {
      x: clamp(((e.clientX-r.left)/r.width)*100,  0, 100),
      y: clamp(((e.clientY-r.top) /r.height)*100, 0, 100),
    };
  },[]);

  const onMD = e => {
    if (!isOwner || !placementMode) return;
    e.preventDefault();
    const p = pct(e);
    setDrag(p); setRect({x:p.x,y:p.y,w:0,h:0});
  };

  const onMM = useCallback(e => {
    if (drag && placementMode) {
      const p = pct(e);
      setRect({ x:Math.min(drag.x,p.x), y:Math.min(drag.y,p.y),
        w:Math.abs(p.x-drag.x), h:Math.abs(p.y-drag.y) });
    }
    if (!drag) {
      const r  = ref.current.getBoundingClientRect();
      const px = ((e.clientX-r.left)/r.width)*100;
      const py = ((e.clientY-r.top) /r.height)*100;
      let found = null;
      for (let i=units.length-1;i>=0;i--) {
        const u=units[i];
        const ux=u.pos_x??0, uy=u.pos_y??0, uw=u.w??13, uh=u.h??10;
        if (px>=ux && px<=ux+uw && py>=uy && py<=uy+uh) { found=u; break; }
      }
      onUnitHover(found||null);
    }
  },[drag,placementMode,pct,units,onUnitHover]);

  const onMU = useCallback(e => {
    if (!drag) return;
    const p   = pct(e);
    const box = { x:Math.min(drag.x,p.x), y:Math.min(drag.y,p.y),
      w:Math.abs(p.x-drag.x), h:Math.abs(p.y-drag.y) };
    setDrag(null); setRect(null);
    if (box.w>2 && box.h>2) onDrawComplete(box);
  },[drag,pct,onDrawComplete]);

  const onCLICK = useCallback(e => {
    if (placementMode && isOwner) return;
    const r  = ref.current.getBoundingClientRect();
    const px = ((e.clientX-r.left)/r.width)*100;
    const py = ((e.clientY-r.top) /r.height)*100;
    for (let i=units.length-1;i>=0;i--) {
      const u=units[i];
      const ux=u.pos_x??0,uy=u.pos_y??0,uw=u.w??13,uh=u.h??10;
      if (px>=ux && px<=ux+uw && py>=uy && py<=uy+uh) { onUnitClick(u); return; }
    }
  },[isOwner,placementMode,units,onUnitClick]);

  const onDBL = useCallback(e => {
    if (!isOwner) return;
    const r  = ref.current.getBoundingClientRect();
    const px = ((e.clientX-r.left)/r.width)*100;
    const py = ((e.clientY-r.top) /r.height)*100;
    for (let i=units.length-1;i>=0;i--) {
      const u=units[i];
      const ux=u.pos_x??0,uy=u.pos_y??0,uw=u.w??13,uh=u.h??10;
      if (px>=ux && px<=ux+uw && py>=uy && py<=uy+uh) { onUnitDblClick(u); return; }
    }
  },[isOwner,units,onUnitDblClick]);

  const cursor = isOwner && placementMode ? (drag?'crosshair':'copy')
               : hoveredId ? 'pointer' : 'default';

  return (
    <div ref={ref}
      style={{ position:'relative',width:'100%',height:'520px',
        background:imgSrc?'transparent':'#080c14',
        border:'1px solid #1e293b',borderRadius:16,overflow:'hidden',
        userSelect:'none', cursor }}
      onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU}
      onMouseLeave={()=>{setDrag(null);setRect(null);onUnitHover(null);}}
      onClick={onCLICK} onDoubleClick={onDBL}>

      {/* Floor plan image */}
      {imgSrc
        ? <img src={imgSrc} alt="floor plan"
            style={{ position:'absolute',inset:0,width:'100%',height:'100%',
              objectFit:'fill',pointerEvents:'none',userSelect:'none',display:'block' }}
            draggable={false}/>
        : <div style={{ position:'absolute',inset:0,background:'linear-gradient(148deg,#07090f,#0d1228)',
            display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:8 }}>
            <div style={{ fontSize:36,opacity:.08 }}>🏬</div>
            <div style={{ fontSize:11,color:'#1e293b',fontFamily:'monospace' }}>Upload a floor plan image to get started</div>
          </div>
      }

      {/* Dot grid overlay in placement mode */}
      {isOwner && placementMode && (
        <div style={{ position:'absolute',inset:0,pointerEvents:'none',zIndex:1,
          backgroundImage:'radial-gradient(circle,rgba(52,211,153,0.07) 1px,transparent 1px)',
          backgroundSize:'24px 24px' }}/>
      )}

      {/* Unit overlays */}
      <style>{`
        @keyframes snPulse{0%,100%{opacity:.88}50%{opacity:.45}}
        .sn-avail{animation:snPulse 2.8s ease-in-out infinite}
      `}</style>
      {units.map(u=>{
        const col  = S[u.status]||S.available;
        const isH  = hoveredId===u.id;
        const isSel= selectedId===u.id;
        const x=u.pos_x??10, y=u.pos_y??10, w=u.w??13, h=u.h??10;
        return (
          <div key={u.id} style={{
            position:'absolute', left:`${x}%`, top:`${y}%`, width:`${w}%`, height:`${h}%`,
            background:isH?`${col.stroke}26`:col.fill,
            border:`${isSel?2.5:1.5}px solid ${col.stroke}`,
            borderRadius:6,
            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
            transition:'background .15s',
            zIndex:isSel?20:isH?10:2,
            boxShadow:isSel?`0 0 0 3px ${col.stroke}28,0 0 22px ${col.stroke}20`
                     :isH?`0 0 14px ${col.stroke}25`:'none',
            pointerEvents:'auto',
          }}
          className={u.status==='available'&&!isH?'sn-avail':''}
          onMouseEnter={()=>onUnitHover(u)}
          onMouseLeave={()=>onUnitHover(null)}
          onClick={e=>{e.stopPropagation();onUnitClick(u);}}
          onDoubleClick={e=>{e.stopPropagation();onUnitDblClick(u);}}>
            <div style={{ position:'absolute',top:0,left:'10%',right:'10%',height:1,
              background:`linear-gradient(90deg,transparent,${col.stroke}55,transparent)`,
              pointerEvents:'none' }}/>
            <div style={{ fontSize:w>12?11:9,fontWeight:800,color:col.stroke,
              fontFamily:'monospace',lineHeight:1.1,textAlign:'center',
              padding:'0 3px',wordBreak:'break-all',pointerEvents:'none' }}>{u.number}</div>
            {w>10&&h>8&&<div style={{ fontSize:8,color:col.stroke,opacity:.65,marginTop:2,pointerEvents:'none' }}>{u.type}</div>}
            {isH&&(u.price_daily||u.priceDaily)>0&&(
              <div style={{ fontSize:8,color:col.stroke,opacity:.8,marginTop:3,fontFamily:'monospace',pointerEvents:'none' }}>
                {rupee(u.price_daily||u.priceDaily)}/d
              </div>
            )}
            <div style={{ position:'absolute',top:4,right:5,width:5,height:5,
              borderRadius:'50%',background:col.dot,boxShadow:`0 0 5px ${col.dot}`,
              pointerEvents:'none' }}/>
          </div>
        );
      })}

      {/* Live drag rectangle */}
      {rect&&rect.w>1&&rect.h>1&&(
        <div style={{ position:'absolute',left:`${rect.x}%`,top:`${rect.y}%`,
          width:`${rect.w}%`,height:`${rect.h}%`,border:'2px dashed #e8c97a',
          background:'rgba(201,168,76,0.08)',borderRadius:6,zIndex:50,pointerEvents:'none',
          display:'flex',alignItems:'center',justifyContent:'center' }}>
          <span style={{ fontSize:10,color:'#e8c97a',fontFamily:'monospace' }}>
            {rect.w.toFixed(0)}% × {rect.h.toFixed(0)}%
          </span>
        </div>
      )}

      {/* Hover tooltip (tenant) */}
      {!isOwner&&hoveredId&&(()=>{
        const u = units.find(u=>u.id===hoveredId);
        if (!u) return null;
        const col = S[u.status]||S.available;
        const x=u.pos_x??0,y=u.pos_y??0,uw=u.w??13;
        const pd = u.price_daily||u.priceDaily||0;
        const pw = u.price_weekly||u.priceWeekly||0;
        const pm = u.price_monthly||u.priceMonthly||0;
        return (
          <div style={{
            position:'absolute',
            left:`${clamp(x+uw+1,0,60)}%`, top:`${clamp(y,5,65)}%`,
            background:'#0a0f1e',border:`1px solid ${col.stroke}30`,borderRadius:13,
            padding:'13px 16px',minWidth:175,zIndex:100,pointerEvents:'none',
            boxShadow:'0 16px 48px rgba(0,0,0,.85)',backdropFilter:'blur(12px)',
          }}>
            <div style={{ fontSize:20,marginBottom:6 }}>{TICONS[u.type]||'🏪'}</div>
            <div style={{ fontSize:14,fontWeight:800,color:'#f1f5f9',marginBottom:3 }}>Unit {u.number}</div>
            <div style={{ fontSize:11,color:'#475569',marginBottom:10 }}>{u.type}</div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6 }}>
              {[['Daily',pd],['Weekly',pw],['Monthly',pm]].map(([l,v])=>(
                <div key={l} style={{ background:`${col.stroke}12`,borderRadius:7,padding:'5px 6px',textAlign:'center' }}>
                  <div style={{ fontSize:8,color:'#334155',marginBottom:2 }}>{l}</div>
                  <div style={{ fontSize:10,fontWeight:700,color:col.stroke }}>{rupee(v)}</div>
                </div>
              ))}
            </div>
            {u.status==='available'&&(
              <div style={{ marginTop:9,fontSize:10,color:'#34d399',fontWeight:600,textAlign:'center' }}>Click to book →</div>
            )}
          </div>
        );
      })()}

      {/* Corner badge */}
      <div style={{ position:'absolute',top:12,left:12,zIndex:20,
        background:'rgba(6,10,18,0.85)',border:'1px solid #ffffff10',
        borderRadius:8,padding:'4px 11px',backdropFilter:'blur(8px)',pointerEvents:'none' }}>
        <span style={{ fontSize:9,color:isOwner&&placementMode?'#34d399':'#4a6aaa',
          fontFamily:'monospace',letterSpacing:1.5 }}>
          {isOwner&&placementMode ? '✏️ DRAG TO DRAW UNIT' : `FL.${floor} · ${units.length} UNITS`}
        </span>
      </div>
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function MallMap({
  units, floor, role, img,
  onUnitClick, onSaveUnit, onDeleteUnit, addBooking,
  selectedUnit, placementMode, onCancelPlacement, spaceId, space, user, notify,
}) {
  const isOwner = role==='admin'||role==='super_owner';

  const [panel,      setPanel]     = useState('idle');
  const [drawRect,   setDrawRect]  = useState(null);
  const [editTarget, setEditTarget]= useState(null);
  const [bookTarget, setBookTarget]= useState(null);
  const [hoveredId,  setHoveredId] = useState(null);
  const [selId,      setSelId]     = useState(null);

  // units are already filtered by floor from BlueprintPage; keep as-is
  const shown = units;

  // draw complete → open new unit form
  const handleDraw = box => { setDrawRect(box); setPanel('drawForm'); };

  // save new unit — send both camelCase and snake_case
  const handleSaveNew = async data => {
    try {
      const daily   = Number(data.priceDaily   || data.price_daily)   || 0;
      const weekly  = Number(data.priceWeekly  || data.price_weekly)  || 0;
      const monthly = Number(data.priceMonthly || data.price_monthly) || 0;

      const payload = {
        ...data,
        id           : `${spaceId}-${data.number}-${Date.now()}`,
        space_id     : spaceId,
        spaceId,
        floor,
        pos_x        : drawRect.x,
        pos_y        : drawRect.y,
        w            : drawRect.w,
        h            : drawRect.h,
        width        : 4,
        height       : 3,
        price_daily  : daily,
        price_weekly : weekly,
        price_monthly: monthly,
        priceDaily   : daily,
        priceWeekly  : weekly,
        priceMonthly : monthly,
      };
      await onSaveUnit(payload);
      setPanel('idle'); setDrawRect(null);
      notify?.(`Unit ${data.number} saved! ✅`);
    } catch(e) { notify?.(e.message||'Save failed','warn'); }
  };

  // edit existing unit — send both camelCase and snake_case
  const handleEdit     = u => { setEditTarget(u); setPanel('editForm'); };
  const handleSaveEdit = async data => {
    try {
      const daily   = Number(data.priceDaily   || data.price_daily)   || 0;
      const weekly  = Number(data.priceWeekly  || data.price_weekly)  || 0;
      const monthly = Number(data.priceMonthly || data.price_monthly) || 0;

      await onSaveUnit({
        ...editTarget,
        ...data,
        price_daily  : daily,
        price_weekly : weekly,
        price_monthly: monthly,
        priceDaily   : daily,
        priceWeekly  : weekly,
        priceMonthly : monthly,
      });
      setPanel('idle'); setEditTarget(null);
      notify?.('Unit updated ✅');
    } catch(e) { notify?.(e.message||'Update failed','warn'); }
  };

  const handleDelete = async id => {
    try {
      await onDeleteUnit?.(id);
      setPanel('idle'); setEditTarget(null);
      notify?.('Unit deleted','warn');
    } catch(e) { notify?.(e.message||'Delete failed','warn'); }
  };

  // book unit (tenant)
  const handleBook = u => { setBookTarget(u); setSelId(u.id); setPanel('bookForm'); };
  const handleBookSubmit = async ({ from, to, days, total }) => {
    try {
      await addBooking({
        // exact field names the backend POST /api/bookings expects
        unit_id   : bookTarget.id,
        space_id  : spaceId,
        from_date : from,
        to_date   : to,
        days,
        total,
        notes     : '',
      });
      setPanel('idle'); setBookTarget(null); setSelId(null); setHoveredId(null);
      notify?.('Booking request submitted! Track it in My Bookings. 📩');
    } catch(e) { notify?.(e.message||'Booking failed','warn'); }
  };

  const handleCancelPanel = () => {
    setPanel('idle'); setDrawRect(null); setEditTarget(null);
    setBookTarget(null); setSelId(null);
    if (panel==='drawForm') onCancelPlacement?.();
  };

  const handleUnitClick = u => {
    if (isOwner) return;
    setSelId(u.id);
    setHoveredId(u.id);   // keep right panel showing this unit
    if (u.status==='available') handleBook(u);
  };

  // right panel content
  const renderPanel = () => {
    if (panel==='drawForm')
      return <UnitForm initial={null} onSave={handleSaveNew} onCancel={handleCancelPanel} isNew/>;
    if (panel==='editForm')
      return <UnitForm initial={editTarget} onSave={handleSaveEdit} onDelete={handleDelete} onCancel={handleCancelPanel} isNew={false}/>;
    if (panel==='bookForm')
      return <BookingForm unit={bookTarget} onSubmit={handleBookSubmit} onCancel={handleCancelPanel}/>;
    if (isOwner)
      return <OwnerPanel units={shown} onEdit={handleEdit}/>;
    return <TenantPanel unit={shown.find(u=>u.id===hoveredId||u.id===selId)||null} onBook={handleBook} allUnits={shown}/>;
  };

  return (
    <div style={{ display:'flex',gap:14,alignItems:'stretch' }}>
      {/* Map area */}
      <div style={{ flex:1,minWidth:0 }}>
        <MapCanvas
          imgSrc={img}
          units={shown}
          isOwner={isOwner}
          floor={floor}
          placementMode={placementMode}
          onDrawComplete={handleDraw}
          onUnitHover={u=>setHoveredId(u?.id||null)}
          onUnitClick={handleUnitClick}
          onUnitDblClick={isOwner?handleEdit:()=>{}}
          hoveredId={hoveredId}
          selectedId={selId}
        />

        {/* Legend */}
        <div style={{ display:'flex',gap:14,marginTop:10,flexWrap:'wrap',alignItems:'center' }}>
          {Object.entries(S).map(([k,v])=>(
            <div key={k} style={{ display:'flex',alignItems:'center',gap:6 }}>
              <div style={{ width:10,height:10,borderRadius:3,background:v.fill,border:`1.5px solid ${v.stroke}` }}/>
              <span style={{ fontSize:11,color:'#475569' }}>{v.label}</span>
            </div>
          ))}
          {isOwner&&<span style={{ marginLeft:'auto',fontSize:11,color:'#334155',fontFamily:'monospace' }}>
            Drag to draw · Dbl-click to edit
          </span>}
          {!isOwner&&<span style={{ marginLeft:'auto',fontSize:11,color:'#334155',fontFamily:'monospace' }}>
            Click green units to book
          </span>}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width:268,flexShrink:0,background:'#07090f',
        border:'1px solid #ffffff0a',borderRadius:16,display:'flex',
        flexDirection:'column',overflow:'hidden',minHeight:480 }}>
        <div style={{ padding:'11px 16px',borderBottom:'1px solid #ffffff08',
          background:'#0f1117',flexShrink:0 }}>
          <div style={{ fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',
            color:panel==='drawForm'||panel==='editForm'?'#34d399':panel==='bookForm'?'#f87171':'#60a5fa' }}>
            {panel==='drawForm'?'📍 New Unit'
            :panel==='editForm'?'✏️ Edit Unit'
            :panel==='bookForm'?'📅 Book Unit'
            :isOwner?'🗂 Unit Manager':'🔍 Unit Details'}
          </div>
        </div>
        <div style={{ flex:1,overflow:'hidden',display:'flex',flexDirection:'column' }}>
          {renderPanel()}
        </div>
      </div>
    </div>
  );
}
