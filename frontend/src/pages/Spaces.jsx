import { useState } from 'react';
import { C } from '../theme';
import { PageHeader, Badge, Card, Btn, Input, Select, SearchBar, Modal } from '../components/UI';

const TYPE_ICON = { Mall:'🏬', Theatre:'🎬', 'Bus Stand':'🚌', 'Transit Hub':'🚇', 'Exhibition Center':'🏛️', Other:'🏢' };

function SpaceFormModal({ onSave, onClose }) {
  const [f, setF] = useState({ name:'', type:'Mall', location:'', floors:'1', area:'' });
  const s = k => e => setF({ ...f, [k]: e.target.value });
  return (
    <Modal title="➕ Register New Space" subtitle="Space will be submitted to Super Owner for approval before going live" onClose={onClose} width={560}>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
        <div style={{ gridColumn:'1/-1' }}>
          <Input label="Space Name" value={f.name} onChange={s('name')} placeholder="e.g. Grand Central Mall" required />
        </div>
        <Select label="Space Type" required value={f.type} onChange={s('type')} options={['Mall','Theatre','Bus Stand','Transit Hub','Exhibition Center','Other']} />
        <Input label="Location" value={f.location} onChange={s('location')} placeholder="City, State" icon="📍" required />
        <Input label="Total Area (sqm)" type="number" value={f.area} onChange={s('area')} placeholder="12000" />
        <Input label="Number of Floors" type="number" value={f.floors} onChange={s('floors')} placeholder="3" />
      </div>
      <div style={{ display:'flex',gap:10,marginTop:22 }}>
        <Btn onClick={() => f.name && f.location && onSave({ ...f, id:Date.now(), status:'pending', adminId:2, ownerApproved:false, floors:+f.floors, area:+f.area })} full>
          Submit for Approval
        </Btn>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
      </div>
    </Modal>
  );
}

export default function Spaces({ spaces, setSpaces, units, role, onViewBlueprint, notify }) {
  const [search, setSearch]   = useState('');
  const [typeF, setTypeF]     = useState('');
  const [showForm, setForm]   = useState(false);

  const canAdd = role === 'admin' || role === 'super_owner';

  const filtered = spaces
    .filter(s => !typeF || s.type === typeF)
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.location.toLowerCase().includes(search.toLowerCase()));

  const handleSave = data => { setSpaces(p => [...p, data]); setForm(false); notify('Space submitted for Super Owner approval! 📋'); };

  const handleApprove = id => {
    setSpaces(p => p.map(s => s.id === id ? { ...s, status:'active', ownerApproved:true } : s));
    notify('Space approved — now live for booking! ✅');
  };
  const handleReject = id => {
    setSpaces(p => p.map(s => s.id === id ? { ...s, status:'inactive' } : s));
    notify('Space request rejected.', 'warn');
  };

  return (
    <div>
      <PageHeader title="Spaces" sub={`${spaces.length} commercial spaces registered`}
        action={<>
          <select value={typeF} onChange={e => setTypeF(e.target.value)}
            style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'8px 14px',color:typeF?C.text:C.dim,fontSize:13,outline:'none' }}>
            <option value="">All Types</option>
            {['Mall','Theatre','Bus Stand','Transit Hub','Exhibition Center','Other'].map(t => <option key={t}>{t}</option>)}
          </select>
          <SearchBar value={search} onChange={setSearch} placeholder="Search spaces…" />
          {canAdd && <Btn onClick={() => setForm(true)}>+ Add Space</Btn>}
        </>}
      />

      {/* Owner approval banner */}
      {role === 'super_owner' && spaces.filter(s => s.status === 'pending').length > 0 && (
        <div style={{ background:`${C.amber}0d`,border:`1px solid ${C.amber}30`,borderRadius:12,padding:'12px 18px',marginBottom:20,fontSize:13,color:C.amber }}>
          ⚠️ {spaces.filter(s=>s.status==='pending').length} space(s) awaiting your approval — approve to make them available for tenant bookings.
        </div>
      )}

      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16 }}>
        {filtered.map(s => {
          const uAll    = units.filter(u => u.spaceId === s.id);
          const uBooked = uAll.filter(u => u.status === 'booked').length;
          return (
            <Card key={s.id} onClick={() => onViewBlueprint(s)} sx={{ padding:22 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14 }}>
                <div style={{ fontSize:30 }}>{TYPE_ICON[s.type] || '🏢'}</div>
                <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4 }}>
                  <Badge status={s.status} />
                  {s.ownerApproved
                    ? <span style={{ fontSize:9,color:C.green }}>✓ Owner Approved</span>
                    : <span style={{ fontSize:9,color:C.amber }}>⏳ Awaiting Approval</span>}
                </div>
              </div>

              <div style={{ fontSize:16,fontWeight:800,color:C.text,fontFamily:"'Syne',sans-serif",marginBottom:3 }}>{s.name}</div>
              <div style={{ fontSize:13,color:C.muted,marginBottom:16 }}>📍 {s.location}</div>

              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14 }}>
                {[['Type',s.type],['Floors',s.floors],['Area',`${Number(s.area||0).toLocaleString()} m²`],['Units',uAll.length]].map(([l,v]) => (
                  <div key={l} style={{ background:C.surface,borderRadius:8,padding:'8px 12px' }}>
                    <div style={{ fontSize:9,color:C.dim,textTransform:'uppercase',letterSpacing:1,marginBottom:2 }}>{l}</div>
                    <div style={{ fontSize:13,color:C.text,fontWeight:700 }}>{v}</div>
                  </div>
                ))}
              </div>

              {uAll.length > 0 && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',fontSize:10,color:C.dim,marginBottom:4 }}>
                    <span>Occupancy</span>
                    <span>{uBooked}/{uAll.length} booked</span>
                  </div>
                  <div style={{ height:4,background:C.border,borderRadius:2 }}>
                    <div style={{ height:'100%',width:`${(uBooked/uAll.length)*100}%`,background:C.red,borderRadius:2,transition:'width .6s ease' }} />
                  </div>
                </div>
              )}

              <div style={{ display:'flex',gap:8 }} onClick={e => e.stopPropagation()}>
                <Btn size="sm" variant="ghost" onClick={() => onViewBlueprint(s)} style={{ flex:1 }}>🗺️ Blueprint</Btn>
                {role === 'super_owner' && s.status === 'pending' && (
                  <>
                    <Btn size="sm" variant="success" onClick={() => handleApprove(s.id)} style={{ flex:1 }}>✓ Approve</Btn>
                    <Btn size="sm" variant="danger"  onClick={() => handleReject(s.id)}>✕</Btn>
                  </>
                )}
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ gridColumn:'1/-1',textAlign:'center',padding:70,color:C.dim }}>
            <div style={{ fontSize:44,marginBottom:12,opacity:.4 }}>🔍</div>
            <div style={{ fontSize:15,fontWeight:600 }}>No spaces found</div>
            {canAdd && <div style={{ fontSize:13,marginTop:6 }}>Click "+ Add Space" to register a new commercial space</div>}
          </div>
        )}
      </div>

      {showForm && <SpaceFormModal onSave={handleSave} onClose={() => setForm(false)} />}
    </div>
  );
}
