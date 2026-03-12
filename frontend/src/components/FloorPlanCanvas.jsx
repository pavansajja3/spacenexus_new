/**
 * FloorPlanCanvas.jsx
 *
 * FLOW:
 *  1. Upload floor plan image → shown as background
 *  2. Admin clicks "+ Add Unit" → enters "placement mode"
 *  3. In placement mode: click anywhere on the map → drops a pin at that spot
 *  4. Unit form slides in on the right → fill details → Save
 *  5. Unit appears on the map at the clicked position
 *  6. Hovering any existing unit → right panel shows its details
 */
import { useState } from 'react';
import { C, rupee } from '../theme';
import { Btn, Input, Select } from './UI';

const STATUS_COLORS = {
  available   : { fill:'rgba(16,185,129,0.22)', stroke:'#10b981', label:'Available',   emoji:'🟢' },
  booked      : { fill:'rgba(239,68,68,0.22)',  stroke:'#ef4444', label:'Booked',      emoji:'🔴' },
  maintenance : { fill:'rgba(100,116,139,0.2)', stroke:'#64748b', label:'Maintenance', emoji:'🟡' },
};

const UNIT_TYPES = ['Advertisement Screen','Banner Slot','Booth','Shop','Digital Billboard','Kiosk','Storage'];

// ── Inline unit form (shown in right panel when placing) ──────────────────────
function PlacementForm({ pos, onSave, onCancel, spaceId, floor }) {
  const [f, setF] = useState({
    number:'', type:'Shop', width:'4', height:'3',
    priceDaily:'', priceWeekly:'', priceMonthly:'', status:'available',
  });
  const s = k => e => setF({ ...f, [k]: e.target.value });

  const save = () => {
    if (!f.number) return;
    onSave({
      ...f,
      floor        : +floor,
      width        : +f.width,
      height       : +f.height,
      priceDaily   : +f.priceDaily,
      priceWeekly  : +f.priceWeekly,
      priceMonthly : +f.priceMonthly,
      spaceId,
      pos_x: pos.x,
      pos_y: pos.y,
      w: 13,
      h: 11,
    });
  };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.border}`, background:`${C.green}10` }}>
        <div style={{ fontSize:12, fontWeight:800, color:C.green, letterSpacing:1, textTransform:'uppercase' }}>
          📍 Place New Unit
        </div>
        <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>
          Pinned at ({pos.x.toFixed(1)}%, {pos.y.toFixed(1)}%)
        </div>
      </div>

      {/* Form */}
      <div style={{ flex:1, padding:'16px 18px', overflowY:'auto', display:'flex', flexDirection:'column', gap:12 }}>
        <div>
          <div style={{ fontSize:11,color:C.muted,marginBottom:5,fontWeight:600 }}>Unit Number *</div>
          <input value={f.number} onChange={s('number')} placeholder="e.g. A1, B3, G12"
            style={{ width:'100%',background:C.surface,border:`1px solid ${C.border2}`,borderRadius:8,padding:'8px 12px',color:C.text,fontSize:13,outline:'none',boxSizing:'border-box' }}
          />
        </div>

        <div>
          <div style={{ fontSize:11,color:C.muted,marginBottom:5,fontWeight:600 }}>Unit Type</div>
          <select value={f.type} onChange={s('type')}
            style={{ width:'100%',background:C.surface,border:`1px solid ${C.border2}`,borderRadius:8,padding:'8px 12px',color:C.text,fontSize:13,outline:'none' }}>
            {UNIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <div>
            <div style={{ fontSize:11,color:C.muted,marginBottom:5,fontWeight:600 }}>Width (m)</div>
            <input type="number" value={f.width} onChange={s('width')}
              style={{ width:'100%',background:C.surface,border:`1px solid ${C.border2}`,borderRadius:8,padding:'8px 10px',color:C.text,fontSize:13,outline:'none',boxSizing:'border-box' }}/>
          </div>
          <div>
            <div style={{ fontSize:11,color:C.muted,marginBottom:5,fontWeight:600 }}>Height (m)</div>
            <input type="number" value={f.height} onChange={s('height')}
              style={{ width:'100%',background:C.surface,border:`1px solid ${C.border2}`,borderRadius:8,padding:'8px 10px',color:C.text,fontSize:13,outline:'none',boxSizing:'border-box' }}/>
          </div>
        </div>

        <div>
          <div style={{ fontSize:11,color:C.muted,marginBottom:5,fontWeight:600 }}>Daily Price (₹)</div>
          <input type="number" value={f.priceDaily} onChange={s('priceDaily')} placeholder="1500"
            style={{ width:'100%',background:C.surface,border:`1px solid ${C.border2}`,borderRadius:8,padding:'8px 12px',color:C.text,fontSize:13,outline:'none',boxSizing:'border-box' }}/>
        </div>
        <div>
          <div style={{ fontSize:11,color:C.muted,marginBottom:5,fontWeight:600 }}>Weekly Price (₹)</div>
          <input type="number" value={f.priceWeekly} onChange={s('priceWeekly')} placeholder="9000"
            style={{ width:'100%',background:C.surface,border:`1px solid ${C.border2}`,borderRadius:8,padding:'8px 12px',color:C.text,fontSize:13,outline:'none',boxSizing:'border-box' }}/>
        </div>
        <div>
          <div style={{ fontSize:11,color:C.muted,marginBottom:5,fontWeight:600 }}>Monthly Price (₹)</div>
          <input type="number" value={f.priceMonthly} onChange={s('priceMonthly')} placeholder="32000"
            style={{ width:'100%',background:C.surface,border:`1px solid ${C.border2}`,borderRadius:8,padding:'8px 12px',color:C.text,fontSize:13,outline:'none',boxSizing:'border-box' }}/>
        </div>

        <div>
          <div style={{ fontSize:11,color:C.muted,marginBottom:5,fontWeight:600 }}>Status</div>
          <select value={f.status} onChange={s('status')}
            style={{ width:'100%',background:C.surface,border:`1px solid ${C.border2}`,borderRadius:8,padding:'8px 12px',color:C.text,fontSize:13,outline:'none' }}>
            {['available','maintenance'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding:'14px 18px', borderTop:`1px solid ${C.border}`, display:'flex', gap:8 }}>
        <button onClick={save} disabled={!f.number}
          style={{ flex:1, padding:'10px', borderRadius:10, border:'none', background:f.number?C.accent:'#1e293b', color:'#fff', fontSize:13, fontWeight:700, cursor:f.number?'pointer':'not-allowed', transition:'all .15s' }}>
          ✅ Save Unit
        </button>
        <button onClick={onCancel}
          style={{ padding:'10px 14px', borderRadius:10, border:`1px solid ${C.border2}`, background:'transparent', color:C.muted, fontSize:13, cursor:'pointer' }}>
          ✕
        </button>
      </div>
    </div>
  );
}

// ── Right panel: unit details on hover ────────────────────────────────────────
function UnitInfoPanel({ unit, role, allUnits, onBook, onEdit }) {
  const available   = allUnits.filter(u => u.status==='available').length;
  const booked      = allUnits.filter(u => u.status==='booked').length;
  const maintenance = allUnits.filter(u => u.status==='maintenance').length;

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      {unit ? (() => {
        const col = STATUS_COLORS[unit.status] || STATUS_COLORS.available;
        return (
          <div style={{ padding:'18px', overflowY:'auto', flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ width:48, height:48, borderRadius:12, background:col.fill, border:`2px solid ${col.stroke}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>
                {col.emoji}
              </div>
              <div>
                <div style={{ fontSize:18, fontWeight:900, color:C.text, fontFamily:"'Syne',sans-serif" }}>Unit {unit.number}</div>
                <div style={{ marginTop:3, fontSize:10, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:col.stroke, background:`${col.stroke}18`, borderRadius:20, padding:'2px 9px', display:'inline-block' }}>
                  {col.label}
                </div>
              </div>
            </div>

            {[['Type', unit.type],['Floor',`Floor ${unit.floor}`],['Size',`${unit.width||'—'}m × ${unit.height||'—'}m`]].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:`1px solid ${C.border}`, fontSize:13 }}>
                <span style={{ color:C.muted }}>{l}</span>
                <span style={{ color:C.text, fontWeight:600 }}>{v}</span>
              </div>
            ))}

            <div style={{ marginTop:14, marginBottom:8, fontSize:11, color:C.dim, fontWeight:700, letterSpacing:1, textTransform:'uppercase' }}>Pricing</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 }}>
              {[['Daily',unit.priceDaily||unit.price_daily],['Weekly',unit.priceWeekly||unit.price_weekly],['Monthly',unit.priceMonthly||unit.price_monthly]].map(([l,v]) => (
                <div key={l} style={{ background:`${col.stroke}12`, border:`1px solid ${col.stroke}28`, borderRadius:10, padding:'10px 6px', textAlign:'center' }}>
                  <div style={{ fontSize:9, color:C.dim, marginBottom:4 }}>{l}</div>
                  <div style={{ fontSize:12, fontWeight:800, color:col.stroke }}>{rupee(v)}</div>
                </div>
              ))}
            </div>

            {unit.status==='available' && role==='tenant' && (
              <button onClick={() => onBook(unit)} style={{ width:'100%', padding:'11px', borderRadius:10, border:'none', background:C.accent, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                📅 Book This Unit
              </button>
            )}
            {unit.status==='booked' && (
              <div style={{ background:`${C.red}10`, border:`1px solid ${C.red}28`, borderRadius:10, padding:'10px', fontSize:12, color:C.red, fontWeight:600, textAlign:'center' }}>
                🔒 Already booked
              </div>
            )}
            {unit.status==='maintenance' && (
              <div style={{ background:`${C.amber}10`, border:`1px solid ${C.amber}28`, borderRadius:10, padding:'10px', fontSize:12, color:C.amber, fontWeight:600, textAlign:'center' }}>
                🔧 Under maintenance
              </div>
            )}
            {(role==='admin'||role==='super_owner') && (
              <button onClick={() => onEdit(unit)} style={{ width:'100%', marginTop:8, padding:'10px', borderRadius:10, border:`1px solid ${C.border2}`, background:'transparent', color:C.muted, fontSize:13, cursor:'pointer' }}>
                ✏️ Edit Unit
              </button>
            )}
          </div>
        );
      })() : (
        <div style={{ flex:1, padding:'18px' }}>
          <div style={{ textAlign:'center', padding:'28px 0 20px' }}>
            <div style={{ fontSize:36, marginBottom:10, opacity:.35 }}>🖱️</div>
            <div style={{ fontSize:13, color:C.muted, lineHeight:1.8 }}>
              Hover any unit on the map<br/>to see its details here
            </div>
          </div>
          <div style={{ marginTop:8 }}>
            <div style={{ fontSize:11, color:C.dim, fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:10 }}>Floor Summary</div>
            {[
              { label:'Available',   count:available,   col:STATUS_COLORS.available   },
              { label:'Booked',      count:booked,      col:STATUS_COLORS.booked      },
              { label:'Maintenance', count:maintenance, col:STATUS_COLORS.maintenance },
            ].map(({ label, count, col }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:10, marginBottom:6, background:col.fill, border:`1px solid ${col.stroke}25` }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:9, height:9, borderRadius:2, background:col.stroke }} />
                  <span style={{ fontSize:13, color:C.text }}>{label}</span>
                </div>
                <span style={{ fontSize:18, fontWeight:900, color:col.stroke, fontFamily:"'Syne',sans-serif" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function FloorPlanCanvas({
  units, floor, role, img,
  onUnitClick, selectedUnit,
  placementMode,        // bool — true when admin clicked "+ Add Unit"
  onPlaceUnit,          // fn(unitData) — called when form saved
  onCancelPlacement,    // fn() — called on cancel
  spaceId,
}) {
  const [hovered,     setHovered]   = useState(null);
  const [pendingPos,  setPending]   = useState(null);  // {x,y} in % where user clicked

  const shown    = units.filter(u => String(u.floor) === String(floor));
  const isManager = role==='admin' || role==='super_owner';

  // ── Map click: in placement mode → drop pin ───────────────────────────────
  const handleMapClick = (e) => {
    if (!placementMode || !isManager) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    setPending({ x, y });
  };

  const handleSavePlacement = (data) => {
    onPlaceUnit({ ...data, pos_x: pendingPos.x, pos_y: pendingPos.y });
    setPending(null);
  };

  const handleCancelPlacement = () => {
    setPending(null);
    onCancelPlacement();
  };

  return (
    <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>

      {/* ── LEFT: Map ── */}
      <div style={{ flex:1, position:'relative', minHeight:380 }}>

        {/* Placement mode banner */}
        {placementMode && !pendingPos && (
          <div style={{
            position:'absolute', top:0, left:0, right:0, zIndex:50,
            background:`${C.green}18`, border:`1.5px solid ${C.green}50`,
            borderRadius:'14px 14px 0 0', padding:'10px 18px',
            display:'flex', alignItems:'center', justifyContent:'space-between',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:18 }}>📍</span>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:C.green }}>Placement Mode Active</div>
                <div style={{ fontSize:11, color:C.muted }}>Click anywhere on the floor map to place a new unit</div>
              </div>
            </div>
            <button onClick={handleCancelPlacement}
              style={{ background:'transparent', border:`1px solid ${C.border2}`, borderRadius:8, padding:'5px 12px', color:C.muted, fontSize:12, cursor:'pointer' }}>
              Cancel
            </button>
          </div>
        )}

        {/* Map container */}
        <div
          onClick={handleMapClick}
          style={{
            position:'relative', width:'100%', paddingBottom:'56%',
            borderRadius: placementMode && !pendingPos ? '0 0 14px 14px' : 14,
            overflow:'hidden',
            border:`2px solid ${placementMode ? C.green : C.border2}`,
            background: img ? '#f8fafc' : '#0a0f1e',
            cursor: placementMode && !pendingPos ? 'crosshair' : 'default',
            userSelect:'none',
            transition:'border-color .2s',
            marginTop: placementMode && !pendingPos ? 0 : 0,
          }}
        >
          {/* Background */}
          {img ? (
            <img src={img} alt="Floor plan" style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain' }} />
          ) : (
            <>
              <div style={{ position:'absolute',inset:0,background:'linear-gradient(148deg,#07090f,#0d1228)' }} />
              <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',opacity:.06 }}>
                <defs><pattern id="fpg" width="5%" height="5%" patternUnits="userSpaceOnUse">
                  <path d="M100 0L0 0 0 100" fill="none" stroke="#3b82f6" strokeWidth=".5"/>
                </pattern></defs>
                <rect width="100%" height="100%" fill="url(#fpg)"/>
              </svg>
              <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,pointerEvents:'none' }}>
                <div style={{ fontSize:36,opacity:.2 }}>🗺️</div>
                <div style={{ fontSize:12,color:C.dim,opacity:.5 }}>Upload a floor plan to start placing units</div>
              </div>
            </>
          )}

          {/* Crosshair hint in placement mode */}
          {placementMode && !pendingPos && (
            <div style={{ position:'absolute',inset:0,zIndex:5,
              backgroundImage:'radial-gradient(circle, rgba(16,185,129,0.06) 1px, transparent 1px)',
              backgroundSize:'24px 24px', pointerEvents:'none' }} />
          )}

          {/* SVG: existing units */}
          <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',zIndex:10 }}
            viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="hatch" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="4" stroke="#64748b" strokeWidth="1" opacity="0.4"/>
              </pattern>
              <style>{`
                @keyframes fp-pulse{0%,100%{opacity:.82}50%{opacity:.5}}
                .fp-avail{animation:fp-pulse 2.5s ease-in-out infinite}
              `}</style>
            </defs>

            {shown.map(u => {
              const col = STATUS_COLORS[u.status] || STATUS_COLORS.available;
              const sel = selectedUnit?.id === u.id;
              const isH = hovered?.id === u.id;
              const x=u.pos_x??10, y=u.pos_y??10, w=u.w??13, h=u.h??11;
              return (
                <g key={u.id}
                  style={{ cursor: placementMode?'crosshair': u.status==='available'||!isManager?'pointer':'pointer' }}
                  onMouseEnter={() => !placementMode && setHovered(u)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={e => { if (placementMode) return; e.stopPropagation(); onUnitClick(u); }}
                >
                  {(sel||isH) && <rect x={x-1} y={y-1} width={w+2} height={h+2} rx="1.8" fill="none" stroke={col.stroke} strokeWidth="0.7" opacity="0.6"/>}
                  <rect x={x} y={y} width={w} height={h} rx="1"
                    fill={u.status==='maintenance'?'url(#hatch)':col.fill}
                    stroke={col.stroke}
                    strokeWidth={sel||isH?'0.7':'0.4'}
                    className={u.status==='available'&&!isH?'fp-avail':''}
                    opacity={isH||sel?1:.82}
                  />
                  <text x={x+w/2} y={y+h/2} textAnchor="middle" dominantBaseline="middle"
                    fill={col.stroke} fontSize="2.2" fontWeight="800" fontFamily="monospace"
                    style={{ pointerEvents:'none' }}>
                    {u.number}
                  </text>
                  <circle cx={x+w-1.8} cy={y+1.8} r="1" fill={col.stroke} style={{ pointerEvents:'none' }}/>
                </g>
              );
            })}

            {/* Pending pin (where user clicked) */}
            {pendingPos && (
              <g>
                <circle cx={pendingPos.x} cy={pendingPos.y} r="3" fill={`${C.green}30`} stroke={C.green} strokeWidth="0.5"/>
                <circle cx={pendingPos.x} cy={pendingPos.y} r="1.2" fill={C.green}/>
                <line x1={pendingPos.x} y1={pendingPos.y-5} x2={pendingPos.x} y2={pendingPos.y-3} stroke={C.green} strokeWidth="0.4" opacity="0.6"/>
                <line x1={pendingPos.x} y1={pendingPos.y+3} x2={pendingPos.x} y2={pendingPos.y+5} stroke={C.green} strokeWidth="0.4" opacity="0.6"/>
                <line x1={pendingPos.x-5} y1={pendingPos.y} x2={pendingPos.x-3} y2={pendingPos.y} stroke={C.green} strokeWidth="0.4" opacity="0.6"/>
                <line x1={pendingPos.x+3} y1={pendingPos.y} x2={pendingPos.x+5} y2={pendingPos.y} stroke={C.green} strokeWidth="0.4" opacity="0.6"/>
              </g>
            )}
          </svg>

          {/* Floor label */}
          <div style={{ position:'absolute',top:10,left:12,zIndex:20,background:'rgba(6,13,31,0.82)',borderRadius:7,padding:'3px 10px',fontSize:10,color:C.accentL,fontFamily:'monospace',letterSpacing:1.5,border:`1px solid ${C.border}`,pointerEvents:'none' }}>
            FLOOR {floor} · {shown.length} UNITS
          </div>
        </div>
      </div>

      {/* ── RIGHT: Panel ── */}
      <div style={{
        width:272, flexShrink:0,
        background:C.card, border:`1px solid ${C.border2}`,
        borderRadius:16, display:'flex', flexDirection:'column',
        overflow:'hidden', minHeight:380,
      }}>
        {/* Panel header */}
        <div style={{ padding:'13px 18px', borderBottom:`1px solid ${C.border}`, background:C.surface }}>
          <div style={{ fontSize:11, color: pendingPos ? C.green : C.accentL, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase' }}>
            {pendingPos ? '📍 New Unit' : '🗺️ Unit Details'}
          </div>
          <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>
            {pendingPos ? 'Fill in details and save' : 'Hover a unit to inspect'}
          </div>
        </div>

        {/* Panel body */}
        {pendingPos ? (
          <PlacementForm
            pos={pendingPos}
            floor={floor}
            spaceId={spaceId}
            onSave={handleSavePlacement}
            onCancel={handleCancelPlacement}
          />
        ) : (
          <UnitInfoPanel
            unit={hovered}
            role={role}
            allUnits={shown}
            onBook={onUnitClick}
            onEdit={onUnitClick}
          />
        )}

        {/* Legend */}
        <div style={{ padding:'10px 18px', borderTop:`1px solid ${C.border}`, background:C.surface }}>
          <div style={{ display:'flex', justifyContent:'space-around' }}>
            {Object.entries(STATUS_COLORS).map(([key, col]) => (
              <div key={key} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:C.muted }}>
                <div style={{ width:8, height:8, borderRadius:2, background:col.stroke }} />
                {col.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
