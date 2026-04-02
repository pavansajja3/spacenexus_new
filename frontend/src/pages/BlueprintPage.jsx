import { useState, useRef, useEffect } from 'react';
import { C, rupee } from '../theme';
import { PageHeader, Badge, Btn, Table, Card } from '../components/UI';
import MallMap from '../components/MallMap';
import api from '../api';

export default function BlueprintPage({ space, units, setUnits, role, user, addBooking, onSaveUnit, notify }) {
  const [floor, setFloor] = useState(1);
  const [floorImgs, setFloorImgs] = useState({});
  const [floorImgNames, setFloorImgNames] = useState({});
  const [dragging, setDragging] = useState(false);
  const [placementMode, setPlacement] = useState(false);
  const [filterStatus, setFilter] = useState('all');
  const [imgLoading, setImgLoading] = useState(false);

  const fileRef = useRef();

  const isManager = role === 'admin' || role === 'super_owner';
  const spaceUnits = units.filter(u => (u.spaceId ?? u.space_id) === space.id);
  const floorUnits = spaceUnits.filter(u => String(u.floor) === String(floor));
  const floors = Array.from({ length: +space.floors || 1 }, (_, i) => i + 1);
  const filtered = filterStatus === 'all' ? floorUnits : floorUnits.filter(u => u.status === filterStatus);

  const stats = [
    { label: 'Total',       val: spaceUnits.length,                                   color: C.accent   },
    { label: 'Available',   val: spaceUnits.filter(u => u.status === 'available').length,   color: '#34d399' },
    { label: 'Booked',      val: spaceUnits.filter(u => u.status === 'booked').length,      color: '#f87171' },
    { label: 'Maintenance', val: spaceUnits.filter(u => u.status === 'maintenance').length, color: '#fbbf24' },
  ];

  useEffect(() => {
    if (!space?.id) return;

    setImgLoading(true);

    api.spaces.getFloorImages(space.id)
      .then(data => {
        if (data?.floor_images && typeof data.floor_images === 'object') {
          setFloorImgs(data.floor_images);
        }
      })
      .catch(() => {})
      .finally(() => setImgLoading(false));
  }, [space?.id]);

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify('Please upload a PNG, JPG or SVG image', 'warn');
      return;
    }

    notify(`Uploading Floor ${floor} plan...`);

    try {
      const res = await api.spaces.uploadFloorImage(space.id, floor, file);

      setFloorImgs(prev => ({
        ...prev,
        [String(floor)]: res.file,
      }));

      setFloorImgNames(prev => ({
        ...prev,
        [String(floor)]: file.name,
      }));

      notify(`Floor ${floor} uploaded successfully! ✅`);
    } catch (err) {
      console.error(err);
      notify(`Upload failed: ${err.message}`, 'warn');
    }
  };

  const handleSaveUnit = async (data) => {
    const payload = {
      ...data,
      id: data.id || `${space.id}-${data.number}-${Date.now()}`,
      space_id: space.id,
      spaceId: space.id,
    };
    await onSaveUnit(payload);
  };

  const handleDeleteUnit = async (id) => {
    if (!window.confirm('Delete this unit?')) return;

    setUnits(prev => prev.filter(u => u.id !== id));

    try {
      await api.units.delete(id);
    } catch (e) {}
  };

  const handleAddBooking = async (data) => {
    return await addBooking({ ...data, spaceId: space.id, space_id: space.id });
  };

  const cols = [
    { key: 'num',  label: 'Unit'    },
    { key: 'type', label: 'Type'    },
    { key: 'sz',   label: 'Size'    },
    { key: 'dprc', label: 'Daily'   },
    { key: 'mprc', label: 'Monthly' },
    { key: 'st',   label: 'Status'  },
  ];

  const rows = floorUnits.map(u => ({
    num : <span style={{ fontFamily:'monospace', fontWeight:800, color:C.text }}>{u.number}</span>,
    type: <span style={{ color:C.muted, fontSize:12 }}>{u.type}</span>,
    sz  : <span style={{ color:C.muted }}>{u.width || '—'}×{u.height || '—'}m</span>,
    dprc: <span style={{ color:C.text, fontWeight:600 }}>{rupee(u.priceDaily || u.price_daily)}</span>,
    mprc: <span style={{ color:C.text, fontWeight:600 }}>{rupee(u.priceMonthly || u.price_monthly)}</span>,
    st  : <Badge status={u.status} />,
  }));

  const currentImgRaw = floorImgs[String(floor)] || floorImgs[floor] || null;
  const currentImg = currentImgRaw
    ? currentImgRaw.startsWith('http') || currentImgRaw.startsWith('data:')
      ? currentImgRaw
      : `http://localhost:5000${currentImgRaw}`
    : null;

  return (
    <div>
      <PageHeader
        title={space.name}
        sub={`${space.type} · ${space.location} · ${space.floors} Floor${+space.floors > 1 ? 's' : ''}`}
        action={
          <>
            {isManager && (
              <>
                <Btn size="sm" variant="ghost" onClick={() => fileRef.current.click()}>
                  📤 {currentImg ? 'Replace Floor Plan' : 'Upload Floor Plan'}
                </Btn>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display:'none' }}
                  onChange={e => handleFile(e.target.files[0])}
                />

                <Btn
                  size="sm"
                  variant={placementMode ? 'danger' : 'primary'}
                  onClick={() => setPlacement(!placementMode)}
                >
                  {placementMode ? '✕ Cancel Drawing' : '+ Add Unit'}
                </Btn>
              </>
            )}
          </>
        }
      />

      {!(space.ownerApproved ?? space.owner_approved) && (
        <div
          style={{
            background:`${C.amber}0c`,
            border:`1px solid ${C.amber}30`,
            borderRadius:12,
            padding:'12px 18px',
            marginBottom:18,
            fontSize:13,
            color:C.amber
          }}
        >
          ⚠️ Pending Super Owner approval. Bookings disabled until approved.
        </div>
      )}

      {!isManager && !currentImg && !imgLoading && (
        <div
          style={{
            background:`${C.accent}0c`,
            border:`1px solid ${C.accent}28`,
            borderRadius:12,
            padding:'12px 18px',
            marginBottom:18,
            fontSize:13,
            color:C.muted
          }}
        >
          🗺️ Admin has not uploaded a floor plan for Floor {floor} yet. Units are listed below.
        </div>
      )}

      {imgLoading && (
        <div
          style={{
            background:C.card,
            border:`1px solid ${C.border}`,
            borderRadius:12,
            padding:'12px 18px',
            marginBottom:18,
            fontSize:13,
            color:C.muted
          }}
        >
          ⏳ Loading floor plan...
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
        {stats.map(s => (
          <Card
            key={s.label}
            sx={{ padding:'13px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}
          >
            <span style={{ fontSize:11, color:C.muted }}>{s.label}</span>
            <span style={{ fontSize:22, fontWeight:800, color:s.color, fontFamily:"'Syne',sans-serif" }}>
              {s.val}
            </span>
          </Card>
        ))}
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <span
            style={{
              fontSize:10,
              color:'#334155',
              letterSpacing:1.5,
              textTransform:'uppercase',
              fontWeight:700,
              marginRight:2
            }}
          >
            Filter
          </span>

          {['all','available','booked','maintenance'].map(f => {
            const clr =
              f === 'all' ? '#64748b' :
              f === 'available' ? '#34d399' :
              f === 'booked' ? '#f87171' :
              '#fbbf24';

            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding:'4px 12px',
                  borderRadius:8,
                  border:`1px solid ${filterStatus === f ? clr + '50' : '#1e293b'}`,
                  background:filterStatus === f ? `${clr}15` : 'transparent',
                  color:filterStatus === f ? clr : '#475569',
                  fontSize:11,
                  fontWeight:700,
                  cursor:'pointer',
                  fontFamily:'inherit',
                  textTransform:'capitalize',
                  letterSpacing:.5,
                  transition:'all .15s'
                }}
              >
                {f}
              </button>
            );
          })}

          {placementMode && (
            <span style={{ fontSize:11, color:'#34d399', fontWeight:700, marginLeft:8 }}>
              📍 Drag on the map to draw a unit
            </span>
          )}
        </div>

        <div style={{ display:'flex', gap:6 }}>
          {floors.map(f => (
            <Btn
              key={f}
              size="sm"
              variant={floor === f ? 'primary' : 'ghost'}
              onClick={() => {
                setFloor(f);
                setPlacement(false);
              }}
            >
              Floor {f}
              {(floorImgs[String(f)] || floorImgs[f]) && (
                <span
                  style={{
                    display:'inline-block',
                    width:6,
                    height:6,
                    borderRadius:'50%',
                    background:'#34d399',
                    marginLeft:5,
                    verticalAlign:'middle'
                  }}
                />
              )}
            </Btn>
          ))}
        </div>
      </div>

      {!currentImg && isManager && !imgLoading ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files[0]);
          }}
          onClick={() => fileRef.current.click()}
          style={{
            border:`2.5px dashed ${dragging ? '#60a5fa' : C.border2}`,
            borderRadius:16,
            padding:'56px 28px',
            textAlign:'center',
            cursor:'pointer',
            background:dragging ? 'rgba(37,99,235,0.05)' : C.surface,
            transition:'all .22s',
            marginBottom:16
          }}
        >
          <div style={{ fontSize:52, marginBottom:14 }}>🗺️</div>
          <div
            style={{
              fontSize:18,
              fontWeight:800,
              color:C.text,
              fontFamily:"'Syne',sans-serif",
              marginBottom:8
            }}
          >
            Upload Floor Plan Image
          </div>
          <div style={{ fontSize:13, color:C.muted, marginBottom:6, lineHeight:1.9 }}>
            Drag & drop your floor plan here or click to browse.
            <br />
            Upload a separate image for each floor.
            <br />
            <span style={{ color:'#34d399', fontSize:12 }}>
              ✅ Each floor will be saved as a different image
            </span>
          </div>
          <div style={{ fontSize:11, color:C.dim }}>PNG · JPG · SVG</div>
        </div>
      ) : (
        !imgLoading && (
          <MallMap
            units={filtered}
            floor={floor}
            role={role}
            img={currentImg}
            onSaveUnit={handleSaveUnit}
            onDeleteUnit={handleDeleteUnit}
            addBooking={handleAddBooking}
            selectedUnit={null}
            placementMode={placementMode}
            onCancelPlacement={() => setPlacement(false)}
            spaceId={space.id}
            space={space}
            user={user}
            notify={notify}
          />
        )
      )}

      <div style={{ marginTop:22 }}>
        <div
          style={{
            fontSize:13,
            fontWeight:700,
            color:C.text,
            marginBottom:12,
            display:'flex',
            alignItems:'center',
            gap:8
          }}
        >
          Floor {floor} Units
          <span style={{ fontSize:11, color:C.muted, fontWeight:400 }}>
            ({floorUnits.length})
          </span>
        </div>

        <Table
          cols={cols}
          rows={rows}
          empty={`No units on Floor ${floor} — ${
            isManager
              ? 'upload a floor plan then drag to draw units'
              : 'admin has not added units to this floor yet'
          }`}
        />
      </div>
    </div>
  );
}