import { useState, useEffect, useCallback } from 'react';
import { C } from './theme';
import { LoginPage, SignupPage, ForgotPage } from './pages/Auth';
import Dashboard    from './pages/Dashboard';
import Spaces       from './pages/Spaces';
import BlueprintPage from './pages/BlueprintPage';
import Bookings     from './pages/Bookings';
import Documents    from './pages/Documents';
import Settings     from './pages/Settings';
import { Toast }    from './components/UI';
import api, { token } from './api';
import { PaymentSuccessModal, PaymentFailedModal, downloadReceipt } from './components/PayUCheckout';

const TABS = [
  { id:'home',      icon:'⚡', label:'Dashboard' },
  { id:'spaces',    icon:'🏢', label:'Spaces'    },
  { id:'blueprint', icon:'🗺️', label:'Blueprint' },
  { id:'bookings',  icon:'📅', label:'Bookings'  },
  { id:'documents', icon:'📂', label:'Documents' },
  { id:'settings',  icon:'⚙️', label:'Settings'  },
];

function UserMenu({ user, onLogout, onSettings }) {
  const [open, setOpen] = useState(false);
  const roleLabel = { super_owner:'Super Owner', admin:'Admin', tenant:'Tenant' }[user.role] || user.role;
  return (
    <div style={{ position:'relative' }}>
      <button onClick={() => setOpen(!open)}
        style={{ display:'flex',alignItems:'center',gap:10,background:open?C.card2:C.card,border:`1px solid ${open?C.accentL:C.border}`,borderRadius:12,padding:'8px 14px 8px 10px',cursor:'pointer',transition:'all .18s' }}>
        <div style={{ width:34,height:34,borderRadius:'50%',background:`linear-gradient(135deg,${C.accent}70,${C.indigo}70)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>{user.avatar||'👤'}</div>
        <div style={{ textAlign:'left' }}>
          <div style={{ fontSize:13,fontWeight:700,color:C.text,lineHeight:1.2 }}>{user.name?.split(' ')[0]}</div>
          <div style={{ fontSize:10,color:C.accentL,fontWeight:600 }}>{roleLabel}</div>
        </div>
        <span style={{ fontSize:10,color:C.dim,marginLeft:2 }}>{open?'▲':'▼'}</span>
      </button>
      {open && <div onClick={() => setOpen(false)} style={{ position:'fixed',inset:0,zIndex:400 }}/>}
      {open && (
        <div style={{ position:'absolute',top:'calc(100% + 8px)',right:0,background:C.card,border:`1px solid ${C.border2}`,borderRadius:14,minWidth:210,boxShadow:'0 24px 60px rgba(0,0,0,.65)',zIndex:500,overflow:'hidden',animation:'scaleIn .15s ease' }}>
          <div style={{ padding:'14px 18px',borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontSize:14,fontWeight:700,color:C.text }}>{user.name}</div>
            <div style={{ fontSize:12,color:C.muted,marginTop:2 }}>{user.email}</div>
            <div style={{ fontSize:11,color:C.accentL,marginTop:3,fontWeight:600 }}>{roleLabel}</div>
          </div>
          {[
            { icon:'⚙️', label:'Settings', fn:()=>{ onSettings(); setOpen(false); } },
            { icon:'🚪', label:'Sign Out',  fn:()=>{ onLogout();   setOpen(false); }, danger:true },
          ].map(item => (
            <button key={item.label} onClick={item.fn}
              style={{ width:'100%',display:'flex',alignItems:'center',gap:10,padding:'12px 18px',background:'none',border:'none',cursor:'pointer',color:item.danger?C.red:C.muted,fontSize:14,fontWeight:item.danger?700:400,textAlign:'left',transition:'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = C.card2}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}

function TopNav({ tab, setTab, user, onLogout, onSettings, pendingBadge }) {
  const [hov, setHov] = useState(null);
  return (
    <header style={{ position:'fixed',top:0,left:0,right:0,zIndex:200,background:`${C.surface}ee`,borderBottom:`1px solid ${C.border}`,backdropFilter:'blur(12px)',height:58,display:'flex',alignItems:'center',paddingInline:28 }}>
      <div style={{ display:'flex',alignItems:'center',gap:10,marginRight:32,flexShrink:0 }}>
        <div style={{ width:32,height:32,background:`linear-gradient(135deg,${C.accent},${C.indigo})`,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,boxShadow:'0 4px 14px rgba(37,99,235,.4)' }}>🏢</div>
        <span style={{ fontSize:20,fontWeight:900,color:C.text,fontFamily:"'Syne',sans-serif",letterSpacing:-0.5 }}>Space<span style={{ color:C.accentL }}>Nexus</span></span>
      </div>
      <nav style={{ display:'flex',gap:2,flex:1 }}>
        {TABS.map(t => {
          const active = tab === t.id, h = hov === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              onMouseEnter={() => setHov(t.id)} onMouseLeave={() => setHov(null)}
              style={{ display:'flex',alignItems:'center',gap:7,padding:'7px 14px',borderRadius:9,border:'none',cursor:'pointer',background:active?`${C.accent}20`:h?`${C.border}80`:'transparent',color:active?C.accentL:h?C.muted:C.dim,fontSize:13,fontWeight:active?700:400,transition:'all .15s',position:'relative',whiteSpace:'nowrap' }}>
              <span style={{ fontSize:16 }}>{t.icon}</span>
              <span>{t.label}</span>
              {t.id==='bookings' && pendingBadge > 0 && (
                <span style={{ position:'absolute',top:4,right:4,background:C.red,color:'#fff',fontSize:9,fontWeight:800,borderRadius:'50%',width:15,height:15,display:'flex',alignItems:'center',justifyContent:'center' }}>{pendingBadge}</span>
              )}
              {active && <div style={{ position:'absolute',bottom:2,left:'50%',transform:'translateX(-50%)',width:20,height:2,background:C.accentL,borderRadius:1 }}/>}
            </button>
          );
        })}
      </nav>
      <div style={{ display:'flex',alignItems:'center',gap:10,flexShrink:0 }}>
        <div style={{ fontSize:10,color:C.accentL,background:`${C.accent}14`,border:`1px solid ${C.accent}30`,borderRadius:20,padding:'3px 10px',fontWeight:700,textTransform:'uppercase',letterSpacing:.8 }}>
          {{ super_owner:'Super Owner', admin:'Admin', tenant:'Tenant' }[user.role] || user.role}
        </div>
        <UserMenu user={user} onLogout={onLogout} onSettings={onSettings}/>
      </div>
    </header>
  );
}

/* ── ROOT APP ─────────────────────────────────────────────────────────────── */
export default function App() {
  const [authPage, setAuth] = useState('login');
  const [user,     setUser] = useState(null);
  const [tab,      setTab]  = useState('home');
  const [toast,    setToast]= useState(null);

  // ── API data state ─────────────────────────────────────────────────────
  const [spaces,   setSpaces]   = useState([]);
  const [units,    setUnits]    = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeSpace, setAS]    = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [paySuccess, setPaySuccess] = useState(null);  // { booking }
  const [payFailed,  setPayFailed]  = useState(null);  // reason string

  const notify = (msg, type='success') => {
    setToast({ msg, type, k: Date.now() });
    setTimeout(() => setToast(null), 4200);
  };

  // ── Load all data from API ─────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    if (!token.get()) return;
    setLoading(true);
    try {
      const [sp, un, bk] = await Promise.all([
        api.spaces.getAll(),
        api.units.getAll(),
        api.bookings.getAll(),
      ]);
      setSpaces(sp);
      setUnits(un);
      setBookings(bk);
      if (sp.length && !activeSpace) setAS(sp[0]);
    } catch (e) {
      console.error('Load error:', e.message);
    } finally { setLoading(false); }
  }, []); // eslint-disable-line

  // ── Auto-login if token exists ─────────────────────────────────────────
  useEffect(() => {
    const t = token.get();
    if (!t) return;
    api.auth.me()
      .then(u => { setUser(u); loadAll(); })
      .catch(() => { token.clear(); });
  }, [loadAll]);

  // ── Auth handlers ──────────────────────────────────────────────────────
  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem('sn_user', JSON.stringify(u));
    setTab('home');
    loadAll();
  };

  const handleLogout = () => {
    token.clear();
    setUser(null);
    setSpaces([]); setUnits([]); setBookings([]);
    setAuth('login');
  };

  // ── Spaces ─────────────────────────────────────────────────────────────
  const handleCreateSpace = async (data) => {
    const sp = await api.spaces.create(data);
    setSpaces(p => [sp, ...p]);
    return sp;
  };
  const handleUpdateSpace = async (id, data) => {
    const sp = await api.spaces.update(id, data);
    setSpaces(p => p.map(s => s.id===id ? sp : s));
    return sp;
  };
  const handleApproveSpace = async (id) => {
    const sp = await api.spaces.approve(id);
    setSpaces(p => p.map(s => s.id===id ? sp : s));
    notify('Space approved! ✅');
  };
  const handleRejectSpace = async (id) => {
    const sp = await api.spaces.reject(id);
    setSpaces(p => p.map(s => s.id===id ? sp : s));
    notify('Space rejected.', 'warn');
  };

  // ── Units ──────────────────────────────────────────────────────────────
  const handleSaveUnit = async (data) => {
    // Ensure id is set before sending to backend
    const payload = {
      ...data,
      id      : data.id       || `${data.space_id || data.spaceId}-${data.number}`,
      space_id: data.space_id || data.spaceId,
    };
    const exists = units.find(u => u.id === payload.id);
    if (exists) {
      const un = await api.units.update(payload.id, payload);
      setUnits(p => p.map(u => u.id===payload.id ? un : u));
    } else {
      const un = await api.units.create(payload);
      setUnits(p => [...p, un]);
    }
  };

  // ── Bookings ───────────────────────────────────────────────────────────
  const addBooking = async (data) => {
    const bk = await api.bookings.create(data);
    setBookings(p => [bk, ...p]);
    return bk;
  };
  const approveBooking = async (id) => {
    const bk = await api.bookings.approve(id);
    setBookings(p => p.map(b => b.id===id ? bk : b));
    // Update unit status in local state
    setUnits(p => p.map(u => u.id===bk.unit_id ? {...u, status:'booked'} : u));
    notify('Booking approved! Tenant notified. ✅');
  };
  const rejectBooking = async (id) => {
    const bk = await api.bookings.reject(id);
    setBookings(p => p.map(b => b.id===id ? bk : b));
    notify('Booking rejected.', 'warn');
  };
  const cancelBooking = async (id) => {
    const bk = await api.bookings.cancel(id);
    setBookings(p => p.map(b => b.id===id ? bk : b));
    setUnits(p => p.map(u => u.id===bk.unit_id ? {...u, status:'available'} : u));
    notify('Booking cancelled. Refund will be processed.', 'warn');
  };

  // ── Pending badge ──────────────────────────────────────────────────────
  const pendingBadge = user
    ? (user.role==='super_owner'||user.role==='admin')
      ? bookings.filter(b => b.status==='pending').length
      : bookings.filter(b => b.tenant_id===user.id && b.status==='pending').length
    : 0;

  // ── Auth screens ───────────────────────────────────────────────────────
  if (!user) {
    if (authPage==='signup') return <SignupPage onLogin={handleLogin} onGo={setAuth}/>;
    if (authPage==='forgot') return <ForgotPage onGo={setAuth}/>;
    return <LoginPage onLogin={handleLogin} onGo={setAuth}/>;
  }

  const handlePaymentSuccess = (bookingId) => {
    setBookings(p => p.map(b => b.id===bookingId ? {...b,payment_status:'paid',paymentStatus:'paid',status:'approved'} : b));
    loadAll();
  };

  const goBlueprint = (space) => { setAS(space); setTab('blueprint'); };

  // Normalise booking field names (API uses snake_case, UI uses camelCase)
  const normBookings = bookings.map(b => ({
    ...b,
    tenantId    : b.tenant_id    || b.tenantId,
    tenantName  : b.tenant_name  || b.tenantName,
    unitNumber  : b.unit_number  || b.unitNumber,
    spaceId     : b.space_id     || b.spaceId,
    paymentStatus: b.payment_status || b.paymentStatus,
    from        : b.from_date    || b.from,
    to          : b.to_date      || b.to,
  }));

  const normUnits = units.map(u => ({
    ...u,
    spaceId      : u.space_id      || u.spaceId,
    priceDaily   : u.price_daily   || u.priceDaily,
    priceWeekly  : u.price_weekly  || u.priceWeekly,
    priceMonthly : u.price_monthly || u.priceMonthly,
  }));

  const normSpaces = spaces.map(s => ({
    ...s,
    ownerApproved: s.owner_approved ?? s.ownerApproved,
    adminId      : s.admin_id       || s.adminId,
  }));

  return (
    <div style={{ minHeight:'100vh',background:C.bg }}>
      <TopNav tab={tab} setTab={setTab} user={user}
        onLogout={handleLogout} onSettings={() => setTab('settings')}
        pendingBadge={pendingBadge}/>

      <main style={{ paddingTop:58 }}>
        {toast && <Toast key={toast.k} msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

        {loading && (
          <div style={{ position:'fixed',top:58,left:0,right:0,height:3,background:`linear-gradient(90deg,${C.accent},${C.indigo})`,zIndex:300,animation:'pulse 1s infinite' }}/>
        )}

        <div style={{ padding:'32px 36px',maxWidth:1400,margin:'0 auto' }}>
          {tab==='home'      && <Dashboard   bookings={normBookings} spaces={normSpaces}/>}
          {tab==='spaces'    && <Spaces      spaces={normSpaces} setSpaces={setSpaces}
                                  units={normUnits} role={user.role}
                                  onViewBlueprint={goBlueprint} notify={notify}
                                  onCreateSpace={handleCreateSpace}
                                  onApproveSpace={handleApproveSpace}
                                  onRejectSpace={handleRejectSpace}/>}
          {tab==='blueprint' && activeSpace && (
            <BlueprintPage space={normSpaces.find(s=>s.id===activeSpace.id)||activeSpace}
              units={normUnits} setUnits={setUnits}
              role={user.role} user={user}
              addBooking={addBooking}
              onSaveUnit={handleSaveUnit}
              notify={notify}/>)}
          {tab==='bookings'  && <Bookings    bookings={normBookings}
                                  setBookings={setBookings}
                                  role={user.role} user={user} spaces={normSpaces}
                                  notify={notify}
                                  onApprove={approveBooking}
                                  onPaymentSuccess={handlePaymentSuccess}
                                  onReject={rejectBooking}
                                  onCancel={cancelBooking}/>}
          {tab==='documents' && <Documents   role={user.role} user={user}
                                  spaces={normSpaces} bookings={normBookings}/>}
          {tab==='settings'  && <Settings    user={user} setUser={setUser} notify={notify}/>}
        </div>
      </main>

      {/* PayU payment success modal (after redirect back) */}
      {paySuccess && (
        <PaymentSuccessModal
          booking={paySuccess}
          user={user}
          onClose={() => setPaySuccess(null)}
        />
      )}

      {/* PayU payment failed modal */}
      {payFailed && (
        <PaymentFailedModal
          reason={payFailed}
          onClose={() => setPayFailed(null)}
          onRetry={() => { setPayFailed(null); setTab('bookings'); }}
        />
      )}
    </div>
  );
}
