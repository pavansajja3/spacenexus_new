import { useState } from 'react';
import { C } from '../theme';
import { PageHeader, Card, Btn, Input, Toggle } from '../components/UI';

export default function Settings({ user, setUser, notify }) {
  const [profile, setProfile] = useState({
    name:     user.name     || '',
    email:    user.email    || '',
    phone:    user.phone    || '',
    location: user.location || '',
  });
  const [pw,    setPw]  = useState({ cur:'', next:'', con:'' });
  const [notif, setN]   = useState({ email:true, whatsapp:true, sms:false, inapp:true });
  const [tfa,   setTfa] = useState(false);
  const [pwErr, setE]   = useState('');

  const pset = k => e => setProfile({ ...profile, [k]: e.target.value });
  const wset = k => e => setPw({ ...pw, [k]: e.target.value });

  const saveProfile = () => { setUser({ ...user, ...profile }); notify('Profile updated! ✅'); };

  const changePw = () => {
    if (!pw.cur)              { setE('Enter your current password'); return; }
    if (pw.next.length < 6)   { setE('New password: min 6 characters'); return; }
    if (pw.next !== pw.con)   { setE("Passwords don't match"); return; }
    setE(''); setPw({ cur:'', next:'', con:'' }); notify('Password changed! 🔒');
  };

  const SH = ({ c }) => (
    <div style={{ fontSize:14,fontWeight:800,color:C.text,fontFamily:"'Syne',sans-serif",marginBottom:16,paddingBottom:10,borderBottom:`1px solid ${C.border}` }}>{c}</div>
  );
  const Row = ({ label, sub, right }) => (
    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:`1px solid ${C.border}` }}>
      <div>
        <div style={{ fontSize:14,fontWeight:600,color:C.text }}>{label}</div>
        {sub && <div style={{ fontSize:12,color:C.muted,marginTop:2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );

  const roleLabel = (user.role||'').replace('_',' ').replace(/\b\w/g, c => c.toUpperCase());
  const roleIcon  = { super_owner:'👑', admin:'🏢', tenant:'🔑' }[user.role] || '👤';

  return (
    <div>
      <PageHeader title="Settings" sub="Manage your profile, security and notification preferences" />

      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:18 }}>

        {/* ── Profile ── */}
        <Card sx={{ padding:26 }}>
          <SH c="👤 Profile" />
          <div style={{ display:'flex',alignItems:'center',gap:14,marginBottom:22 }}>
            <div style={{ width:60,height:60,borderRadius:'50%',background:`linear-gradient(135deg,${C.accent}70,${C.indigo}70)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0 }}>
              {roleIcon}
            </div>
            <div>
              <div style={{ fontSize:16,fontWeight:800,color:C.text }}>{user.name}</div>
              <div style={{ fontSize:12,color:C.muted,marginTop:2 }}>{roleLabel}</div>
              <div style={{ fontSize:11,color:C.dim,marginTop:1 }}>{user.email}</div>
            </div>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:12,marginBottom:16 }}>
            <Input label="Full Name" value={profile.name}     onChange={pset('name')}     />
            <Input label="Email"     type="email" value={profile.email}    onChange={pset('email')}    />
            <Input label="Phone"     value={profile.phone}    onChange={pset('phone')}    />
            <Input label="Location"  value={profile.location} onChange={pset('location')} placeholder="City, State" />
          </div>
          {/* Upload prompt — tenants upload business images; others upload space photos */}
          <div style={{ border:`1.5px dashed ${C.border2}`,borderRadius:12,padding:16,textAlign:'center',cursor:'pointer',background:C.surface,marginBottom:16 }}>
            <div style={{ fontSize:22,marginBottom:4 }}>{user.role==='tenant' ? '🖼️' : '📸'}</div>
            <div style={{ fontSize:12,color:C.muted }}>
              {user.role==='tenant' ? 'Upload product / store images' : 'Upload space or venue photos'}
            </div>
          </div>
          <Btn onClick={saveProfile} full>Save Profile</Btn>
        </Card>

        {/* ── Password & Security ── */}
        <Card sx={{ padding:26 }}>
          <SH c="🔐 Change Password" />
          <div style={{ display:'flex',flexDirection:'column',gap:12,marginBottom:16 }}>
            <Input label="Current Password" type="password" value={pw.cur}  onChange={wset('cur')}  placeholder="Enter current password" />
            <Input label="New Password"     type="password" value={pw.next} onChange={wset('next')} placeholder="Min 6 characters" />
            <Input label="Confirm"          type="password" value={pw.con}  onChange={wset('con')}  placeholder="Repeat new password" />
          </div>
          {pwErr && <div style={{ fontSize:12,color:C.red,marginBottom:10 }}>⚠️ {pwErr}</div>}
          <Btn onClick={changePw} full>Update Password</Btn>

          <div style={{ marginTop:24 }}>
            <SH c="🔑 Security" />
            <Row label="Two-Factor Authentication" sub="Adds an extra layer of security"
              right={<Toggle on={tfa} onToggle={() => { setTfa(!tfa); notify(tfa?'2FA disabled.':'2FA enabled! 🔒'); }} />} />
            <Row label="Email Recovery"  sub="Reset password via registered email" right={<Btn size="sm" variant="ghost">Configure</Btn>} />
            <Row label="Active Sessions" sub="Devices currently signed in"         right={<Btn size="sm" variant="ghost">View</Btn>}      />
          </div>
        </Card>

        {/* ── Notifications ── */}
        <Card sx={{ padding:26 }}>
          <SH c="🔔 Notifications" />
          {[
            { k:'email',    l:'Email Notifications', s:'Booking confirmations & status updates' },
            { k:'whatsapp', l:'WhatsApp Updates',     s:'Real-time booking alerts'               },
            { k:'sms',      l:'SMS Alerts',           s:'Critical notifications via SMS'          },
            { k:'inapp',    l:'In-App Notifications', s:'Dashboard alerts and reminders'          },
          ].map(n => (
            <Row key={n.k} label={n.l} sub={n.s}
              right={<Toggle on={notif[n.k]} onToggle={() => setN({ ...notif, [n.k]:!notif[n.k] })} />} />
          ))}
        </Card>

        {/* ── Account actions + business info for tenants ── */}
        <Card sx={{ padding:26 }}>
          <SH c="⚠️ Account Actions" />
          <Row label="Export My Data"     sub="Download your data as JSON"   right={<Btn size="sm" variant="ghost">Export</Btn>}     />
          <Row label="Deactivate Account" sub="Temporarily disable"           right={<Btn size="sm" variant="ghost">Deactivate</Btn>} />
          <Row label="Delete Account"     sub="Permanently remove account"    right={<Btn size="sm" variant="danger">Delete</Btn>}   />

          {/* Tenant business details */}
          {user.role === 'tenant' && user.business && (
            <>
              <div style={{ fontSize:14,fontWeight:700,color:C.text,margin:'22px 0 12px',fontFamily:"'Syne',sans-serif" }}>
                🏪 Business Info
              </div>
              {[
                ['Business',      user.business        ],
                ['Type',          user.businessType||'—'],
                ['GST Number',    user.gst        ||'—' ],
                ['Location',      user.location   ||'—' ],
              ].map(([l, v]) => (
                <div key={l} style={{ display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:`1px solid ${C.border}`,fontSize:13 }}>
                  <span style={{ color:C.muted }}>{l}</span>
                  <span style={{ color:C.text,fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
