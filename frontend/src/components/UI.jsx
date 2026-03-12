import { useState } from 'react';
import { C, badge as bdg } from '../theme';

// ── TOAST ─────────────────────────────────────────────────────────────────────
export function Toast({ msg, type = 'success', onClose }) {
  const col = type === 'error' ? C.red : type === 'warn' ? C.amber : C.green;
  return (
    <div style={{ position:'fixed',top:22,right:22,zIndex:9999,background:`${col}12`,border:`1px solid ${col}`,borderRadius:14,padding:'13px 20px',display:'flex',alignItems:'center',gap:12,minWidth:300,maxWidth:440,boxShadow:'0 24px 64px rgba(0,0,0,.65)',animation:'slideIn .3s ease' }}>
      <span style={{fontSize:18}}>{type==='error'?'❌':type==='warn'?'⚠️':'✅'}</span>
      <span style={{flex:1,fontSize:14,color:C.text,lineHeight:1.45}}>{msg}</span>
      <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:C.dim,fontSize:22,padding:0,lineHeight:1}}>×</button>
    </div>
  );
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
export function Modal({ children, onClose, width = 500, title, subtitle }) {
  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20,backdropFilter:'blur(8px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.card,border:`1px solid ${C.border2}`,borderRadius:22,width:'100%',maxWidth:width,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 40px 100px rgba(0,0,0,.8)',animation:'scaleIn .22s ease' }}>
        {title && (
          <div style={{ padding:'26px 30px 0',display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
            <div>
              <div style={{ fontSize:18,fontWeight:800,color:C.text,fontFamily:"'Syne',sans-serif" }}>{title}</div>
              {subtitle && <div style={{ fontSize:13,color:C.muted,marginTop:4 }}>{subtitle}</div>}
            </div>
            <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:C.dim,fontSize:26,padding:0,lineHeight:1,marginTop:-4 }}>×</button>
          </div>
        )}
        <div style={{ padding:30 }}>{children}</div>
      </div>
    </div>
  );
}

// ── BADGE ─────────────────────────────────────────────────────────────────────
export function Badge({ status, label }) {
  const m = bdg(status);
  return (
    <span style={{ fontSize:10,padding:'3px 10px',borderRadius:20,fontWeight:700,textTransform:'uppercase',letterSpacing:.8,background:m.bg,color:m.color,border:`1px solid ${m.color}28`,whiteSpace:'nowrap' }}>
      {label || m.label}
    </span>
  );
}

// ── BUTTON ────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, style: sx = {}, type = 'button', full }) {
  const [hov, setHov] = useState(false);
  const sz = { sm:{p:'7px 14px',fs:12,r:8}, md:{p:'11px 22px',fs:14,r:10}, lg:{p:'14px 30px',fs:15,r:12} }[size];
  const vs = {
    primary  :{ background:hov&&!disabled?'#1d4ed8':`linear-gradient(135deg,${C.accent},${C.indigo})`,color:'#fff',border:'none' },
    ghost    :{ background:hov?C.border:'transparent',color:hov?C.text:C.muted,border:`1px solid ${hov?C.border2:C.border}` },
    danger   :{ background:hov?'#dc2626':C.red,color:'#fff',border:'none' },
    success  :{ background:hov?'#059669':C.green,color:'#fff',border:'none' },
    amber    :{ background:hov?'#d97706':C.amber,color:'#fff',border:'none' },
    secondary:{ background:hov?C.border2:C.border,color:C.muted,border:'none' },
  }[variant] || {};
  return (
    <button type={type} onClick={disabled ? undefined : onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding:sz.p,fontSize:sz.fs,borderRadius:sz.r,cursor:disabled?'not-allowed':'pointer',fontWeight:700,transition:'all .18s',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,opacity:disabled?.5:1,width:full?'100%':undefined,...vs,...sx }}>
      {children}
    </button>
  );
}

// ── INPUT ─────────────────────────────────────────────────────────────────────
export function Input({ label, required, icon, type = 'text', value, onChange, placeholder, error, hint, disabled, name }) {
  const [foc, setFoc] = useState(false);
  const [sp, setSp] = useState(false);
  const isP = type === 'password';
  return (
    <div>
      {label && <label style={{ fontSize:11,color:C.dim,display:'block',marginBottom:5,fontWeight:600,textTransform:'uppercase',letterSpacing:.8 }}>{label}{required && <span style={{ color:C.accentL }}> *</span>}</label>}
      <div style={{ position:'relative' }}>
        {icon && <span style={{ position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',fontSize:15,opacity:.45,pointerEvents:'none' }}>{icon}</span>}
        <input name={name} type={isP && sp ? 'text' : type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
          onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
          style={{ width:'100%',outline:'none',background:disabled?C.surface:foc?'#0f1525':C.surface,border:`1.5px solid ${error?C.red:foc?C.accentL:C.border}`,borderRadius:10,color:C.text,fontSize:14,padding:`11px ${isP?'42px':'14px'} 11px ${icon?'42px':'14px'}`,transition:'all .2s',opacity:disabled?.6:1 }} />
        {isP && <button type="button" onClick={() => setSp(!sp)} style={{ position:'absolute',right:13,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:C.dim,fontSize:16 }}>{sp ? '🙈' : '👁️'}</button>}
      </div>
      {error && <div style={{ fontSize:11,color:C.red,marginTop:4 }}>{error}</div>}
      {hint  && <div style={{ fontSize:11,color:C.dim, marginTop:4 }}>{hint}</div>}
    </div>
  );
}

// ── SELECT ────────────────────────────────────────────────────────────────────
export function Select({ label, required, value, onChange, options, placeholder }) {
  return (
    <div>
      {label && <label style={{ fontSize:11,color:C.dim,display:'block',marginBottom:5,fontWeight:600,textTransform:'uppercase',letterSpacing:.8 }}>{label}{required && <span style={{ color:C.accentL }}> *</span>}</label>}
      <select value={value} onChange={onChange}
        style={{ width:'100%',background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:10,padding:'11px 14px',color:value?C.text:C.dim,fontSize:14,outline:'none' }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color = C.accent, icon, pct = 60 }) {
  return (
    <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:'20px 22px' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12 }}>
        <div style={{ fontSize:11,color:C.dim,textTransform:'uppercase',letterSpacing:1.5,fontWeight:600 }}>{label}</div>
        <div style={{ width:38,height:38,borderRadius:10,background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>{icon}</div>
      </div>
      <div style={{ fontSize:26,fontWeight:800,color:C.text,fontFamily:"'Syne',sans-serif",marginBottom:3 }}>{value}</div>
      {sub && <div style={{ fontSize:12,color:C.muted }}>{sub}</div>}
      <div style={{ height:3,background:C.border,borderRadius:2,marginTop:14 }}>
        <div style={{ height:'100%',width:`${Math.min(pct,100)}%`,background:`linear-gradient(90deg,${color},${color}80)`,borderRadius:2 }} />
      </div>
    </div>
  );
}

// ── BAR CHART ─────────────────────────────────────────────────────────────────
export function BarChart({ data, color = C.accent, labels, height = 86 }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display:'flex',alignItems:'flex-end',gap:4,height }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4,height:'100%',justifyContent:'flex-end' }}>
          <div style={{ width:'100%',background:`linear-gradient(180deg,${color},${color}50)`,borderRadius:'4px 4px 2px 2px',height:`${Math.max((v / max) * 100, 3)}%`,minHeight:4,transition:'height .9s ease' }} />
          {labels && <div style={{ fontSize:9,color:C.dim,flexShrink:0 }}>{labels[i]}</div>}
        </div>
      ))}
    </div>
  );
}

// ── PIE CHART ─────────────────────────────────────────────────────────────────
export function PieChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const colors = [C.accent, C.green, C.amber, C.pink, C.cyan];
  let acc = 0;
  const P = a => ({ x: 50 + 40 * Math.cos(a * 2 * Math.PI - Math.PI / 2), y: 50 + 40 * Math.sin(a * 2 * Math.PI - Math.PI / 2) });
  return (
    <div style={{ display:'flex',alignItems:'center',gap:20 }}>
      <svg width={110} height={110} viewBox="0 0 100 100">
        {data.map((d, i) => {
          const p = d.value / total; const s = P(acc); acc += p; const e = P(acc);
          return <path key={i} d={`M50 50L${s.x} ${s.y}A40 40 0 ${p > .5 ? 1 : 0} 1 ${e.x} ${e.y}Z`} fill={colors[i]} opacity={.85} />;
        })}
        <circle cx={50} cy={50} r={22} fill={C.card} />
      </svg>
      <div style={{ display:'flex',flexDirection:'column',gap:7 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display:'flex',alignItems:'center',gap:8 }}>
            <div style={{ width:10,height:10,borderRadius:3,background:colors[i],flexShrink:0 }} />
            <span style={{ fontSize:12,color:C.muted,flex:1 }}>{d.label}</span>
            <span style={{ fontSize:12,color:C.text,fontWeight:700 }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PAGE HEADER ───────────────────────────────────────────────────────────────
export function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:26 }}>
      <div>
        <h2 style={{ fontSize:26,fontWeight:800,color:C.text,fontFamily:"'Syne',sans-serif",margin:0 }}>{title}</h2>
        {sub && <p style={{ color:C.muted,fontSize:14,margin:'5px 0 0' }}>{sub}</p>}
      </div>
      {action && <div style={{ display:'flex',gap:8,alignItems:'center',flexShrink:0,flexWrap:'wrap' }}>{action}</div>}
    </div>
  );
}

// ── CARD ──────────────────────────────────────────────────────────────────────
export function Card({ children, style: sx = {}, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => onClick && setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:C.card,border:`1px solid ${hov ? C.accentL : C.border}`,borderRadius:16,transition:'border-color .2s, box-shadow .2s',cursor:onClick?'pointer':'default',boxShadow:hov?'0 8px 32px rgba(37,99,235,.08)':'none',...sx }}>
      {children}
    </div>
  );
}

// ── TABLE ─────────────────────────────────────────────────────────────────────
export function Table({ cols, rows, empty = 'No records found.' }) {
  return (
    <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:'hidden' }}>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%',borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:C.surface }}>
              {cols.map(c => <th key={c.key} style={{ padding:'11px 18px',fontSize:11,color:C.dim,textAlign:'left',textTransform:'uppercase',letterSpacing:1,fontWeight:600,whiteSpace:'nowrap' }}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={cols.length} style={{ textAlign:'center',padding:52,color:C.dim,fontSize:14 }}>{empty}</td></tr>
              : rows.map((row, i) => (
                <tr key={i} style={{ borderTop:`1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = C.card2}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {cols.map(c => <td key={c.key} style={{ padding:'13px 18px',fontSize:13,color:C.text }}>{row[c.key]}</td>)}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── SEARCH BAR ────────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search…', width = 240 }) {
  return (
    <div style={{ position:'relative',width }}>
      <span style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14,opacity:.4 }}>🔍</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%',background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'9px 14px 9px 36px',color:C.text,fontSize:13,outline:'none' }} />
    </div>
  );
}

// ── TOGGLE ────────────────────────────────────────────────────────────────────
export function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} style={{ width:42,height:23,borderRadius:12,background:on?C.accent:C.border,cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0 }}>
      <div style={{ position:'absolute',top:3,left:on?22:3,width:17,height:17,borderRadius:'50%',background:'#fff',transition:'left .2s' }} />
    </div>
  );
}

// ── DIVIDER ───────────────────────────────────────────────────────────────────
export function Divider({ label }) {
  return (
    <div style={{ display:'flex',alignItems:'center',gap:12,margin:'8px 0' }}>
      <div style={{ flex:1,height:1,background:C.border }} />
      {label && <span style={{ fontSize:12,color:C.dim,whiteSpace:'nowrap' }}>{label}</span>}
      <div style={{ flex:1,height:1,background:C.border }} />
    </div>
  );
}
