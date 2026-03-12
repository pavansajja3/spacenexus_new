import { useState } from 'react';
import { C } from '../theme';
import { Input, Btn, Select, Divider } from '../components/UI';
import api, { token } from '../api';

/* ── SHELL ───────────────────────────────────────────────────────────────────── */
function Shell({ children, title, subtitle, wide }) {
  return (
    <div style={{ minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20,position:'relative',overflow:'hidden' }}>
      <div style={{ position:'fixed',top:'-22%',left:'-12%',width:700,height:700,background:'radial-gradient(circle,rgba(37,99,235,.07) 0%,transparent 70%)',pointerEvents:'none' }} />
      <div style={{ position:'fixed',bottom:'-20%',right:'-12%',width:600,height:600,background:'radial-gradient(circle,rgba(99,102,241,.07) 0%,transparent 70%)',pointerEvents:'none' }} />
      <svg style={{ position:'fixed',inset:0,width:'100%',height:'100%',opacity:.025,pointerEvents:'none' }}>
        <defs><pattern id="ag" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke="#60a5fa" strokeWidth=".5"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#ag)"/>
      </svg>
      <div style={{ width:'100%',maxWidth:wide?600:470,position:'relative',animation:'fadeUp .4s ease' }}>
        <div style={{ textAlign:'center',marginBottom:30 }}>
          <div style={{ display:'inline-flex',alignItems:'center',gap:11,marginBottom:14 }}>
            <div style={{ width:40,height:40,background:`linear-gradient(135deg,${C.accent},${C.indigo})`,borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',fontSize:21,boxShadow:'0 8px 28px rgba(37,99,235,.45)' }}>🏢</div>
            <span style={{ fontSize:27,fontWeight:900,color:C.text,fontFamily:"'Syne',sans-serif",letterSpacing:-0.5 }}>Space<span style={{ color:C.accentL }}>Nexus</span></span>
          </div>
          <div style={{ fontSize:22,fontWeight:800,color:C.text,fontFamily:"'Syne',sans-serif",marginBottom:6 }}>{title}</div>
          <div style={{ fontSize:14,color:C.muted }}>{subtitle}</div>
        </div>
        <div style={{ background:C.card,border:`1px solid ${C.border2}`,borderRadius:22,padding:34,boxShadow:'0 40px 100px rgba(0,0,0,.55)' }}>
          {children}
        </div>
        <div style={{ textAlign:'center',marginTop:20,fontSize:11,color:C.dim }}>SpaceNexus · Commercial Space Booking Platform</div>
      </div>
    </div>
  );
}

/* ── LOGIN ───────────────────────────────────────────────────────────────────── */
export function LoginPage({ onLogin, onGo }) {
  const [form, setForm] = useState({ email:'', password:'' });
  const [err,  setErr]  = useState('');
  const [loading, setL] = useState(false);
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const DEMOS = [
    { name:'Pawan',  email:'owner@spacenexus.com',   role:'super_owner', icon:'👑', label:'Super Owner' },
    { name:'Rahul',  email:'admin@spacenexus.com',   role:'admin',       icon:'🏢', label:'Admin'       },
    { name:'Priya',  email:'tenant@spacenexus.com',  role:'tenant',      icon:'🔑', label:'Tenant'      },
    { name:'Arjun',  email:'tenant2@spacenexus.com', role:'tenant',      icon:'🔑', label:'Tenant 2'    },
  ];

  const submit = async () => {
    setErr('');
    if (!form.email || !form.password) { setErr('Please fill in all fields.'); return; }
    setL(true);
    try {
      const { user: u, token: t } = await api.auth.login(form.email, form.password);
      token.set(t);
      onLogin(u);
    } catch (e) {
      setErr(e.message || 'Invalid email or password.');
    } finally { setL(false); }
  };

  return (
    <Shell title="Welcome back" subtitle="Sign in to your SpaceNexus account">
      {/* Demo tiles */}
      <div style={{ background:'#0a1628',border:`1px solid ${C.accent}20`,borderRadius:13,padding:14,marginBottom:22 }}>
        <div style={{ fontSize:10,color:C.accentL,fontWeight:700,letterSpacing:1.2,textTransform:'uppercase',marginBottom:10 }}>
          🎯 Demo Accounts — click to autofill
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6 }}>
          {DEMOS.map(u => (
            <div key={u.email} onClick={() => setForm({ email:u.email, password:'password' })}
              style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'10px 6px',background:C.surface,borderRadius:9,cursor:'pointer',border:`1px solid ${C.border}`,transition:'border-color .15s',textAlign:'center' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.accentL}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <span style={{ fontSize:20 }}>{u.icon}</span>
              <div style={{ fontSize:11,fontWeight:700,color:C.text,lineHeight:1.2 }}>{u.name}</div>
              <div style={{ fontSize:9,color:C.accentL }}>{u.label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:10,color:C.dim,textAlign:'center',marginTop:8 }}>All passwords: <strong style={{color:C.text}}>password</strong></div>
      </div>

      <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
        <Input label="Email Address" type="email"    value={form.email}    onChange={set('email')}    placeholder="you@example.com" icon="📧" required />
        <Input label="Password"      type="password" value={form.password} onChange={set('password')} placeholder="Your password"    icon="🔒" required />
      </div>
      <div style={{ textAlign:'right',margin:'8px 0 16px' }}>
        <span onClick={() => onGo('forgot')} style={{ fontSize:13,color:C.accentL,cursor:'pointer',fontWeight:600 }}>Forgot password?</span>
      </div>
      {err && (
        <div style={{ background:'rgba(239,68,68,.10)',border:'1px solid rgba(239,68,68,.30)',borderRadius:10,padding:'10px 14px',marginBottom:14,fontSize:13,color:'#fca5a5' }}>
          ⚠️ {err}
        </div>
      )}
      <Btn onClick={submit} disabled={loading} full size="lg">{loading ? 'Signing in…' : 'Sign In →'}</Btn>
      <Divider label="or" />
      <div style={{ textAlign:'center',fontSize:14,color:C.muted }}>
        Don't have an account?{' '}
        <span onClick={() => onGo('signup')} style={{ color:C.accentL,cursor:'pointer',fontWeight:700 }}>Create one</span>
      </div>
    </Shell>
  );
}

/* ── SIGN UP ─────────────────────────────────────────────────────────────────── */
export function SignupPage({ onLogin, onGo }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name:'', email:'', phone:'', password:'', confirm:'', role:'tenant',
    business:'', businessType:'', location:'', website:'', gst:'',
  });
  const [errs, setErrs] = useState({});
  const [loading, setL] = useState(false);
  const [apiErr, setApiErr] = useState('');
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const ROLES = [
    { id:'super_owner', icon:'👑', label:'Super Owner', desc:'Platform supervisor'   },
    { id:'admin',       icon:'🏢', label:'Admin',       desc:'Manage spaces & units' },
    { id:'tenant',      icon:'🔑', label:'Tenant',      desc:'Browse & book slots'   },
  ];

  const validate1 = () => {
    const e = {};
    if (!form.name.trim())                               e.name     = 'Required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email   = 'Valid email required';
    if (!form.phone || form.phone.length < 10)            e.phone   = 'Min 10 digits';
    if (form.password.length < 6)                         e.password = 'Min 6 characters';
    if (form.password !== form.confirm)                   e.confirm  = "Passwords don't match";
    return e;
  };

  const next = () => {
    const e = validate1();
    if (Object.keys(e).length) { setErrs(e); return; }
    setErrs({}); setStep(2);
  };

  const submit = async () => {
    if (form.role === 'tenant' && (!form.business || !form.gst)) {
      setErrs({ business:'Required', gst:'Required' }); return;
    }
    setL(true); setApiErr('');
    try {
      const { user: u, token: t } = await api.auth.register({
        name: form.name, email: form.email, password: form.password,
        role: form.role, phone: form.phone,
        business: form.business, businessType: form.businessType,
        gst: form.gst, location: form.location, website: form.website,
      });
      token.set(t);
      onLogin(u);
    } catch (e) {
      setApiErr(e.message || 'Registration failed. Try again.');
    } finally { setL(false); }
  };

  return (
    <Shell title={step===1?'Create Account':'Your Details'} subtitle={step===1?'Join SpaceNexus today':'Complete your profile'} wide>
      <div style={{ display:'flex',gap:8,marginBottom:26 }}>
        {[1,2].map(s => <div key={s} style={{ flex:1,height:4,borderRadius:2,background:s<=step?C.accent:C.border,transition:'background .3s' }} />)}
      </div>

      {step === 1 && <>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14 }}>
          <div style={{ gridColumn:'1/-1' }}>
            <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="Your name" icon="👤" required error={errs.name} />
          </div>
          <Input label="Email"    type="email"    value={form.email}    onChange={set('email')}    placeholder="you@example.com"  icon="📧" required error={errs.email}    />
          <Input label="Phone"                    value={form.phone}    onChange={set('phone')}    placeholder="+91 XXXXX XXXXX"  icon="📱" required error={errs.phone}    />
          <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" icon="🔒" required error={errs.password} />
          <Input label="Confirm"  type="password" value={form.confirm}  onChange={set('confirm')}  placeholder="Repeat password"  icon="🔒" required error={errs.confirm}  />
        </div>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11,color:C.dim,marginBottom:8,fontWeight:600,textTransform:'uppercase',letterSpacing:.8 }}>Account Type *</div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8 }}>
            {ROLES.map(r => (
              <div key={r.id} onClick={() => setForm({ ...form, role:r.id })}
                style={{ border:`2px solid ${form.role===r.id?C.accent:C.border}`,borderRadius:12,padding:'12px 8px',cursor:'pointer',textAlign:'center',background:form.role===r.id?`${C.accent}12`:C.surface,transition:'all .2s' }}>
                <div style={{ fontSize:22,marginBottom:4 }}>{r.icon}</div>
                <div style={{ fontSize:12,fontWeight:700,color:form.role===r.id?C.accentL:C.text }}>{r.label}</div>
                <div style={{ fontSize:10,color:C.dim,marginTop:2 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <Btn onClick={next} full size="lg">Continue →</Btn>
      </>}

      {step === 2 && <>
        {apiErr && (
          <div style={{ background:'rgba(239,68,68,.10)',border:'1px solid rgba(239,68,68,.30)',borderRadius:10,padding:'10px 14px',marginBottom:14,fontSize:13,color:'#fca5a5' }}>⚠️ {apiErr}</div>
        )}
        {form.role === 'tenant' ? (
          <div style={{ display:'flex',flexDirection:'column',gap:14,marginBottom:20 }}>
            <div style={{ background:`${C.green}0d`,border:`1px solid ${C.green}25`,borderRadius:12,padding:14,fontSize:13,color:C.muted }}>
              🔑 As a <strong style={{ color:C.green }}>Tenant</strong> you can browse spaces, view blueprints and submit booking requests.
            </div>
            <Input label="Business Name" value={form.business} onChange={set('business')} placeholder="Company name" icon="🏪" required error={errs.business} />
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
              <Select label="Business Type" required value={form.businessType} onChange={set('businessType')}
                options={['Retail','F&B','Electronics','Fashion','Services','Entertainment','Healthcare','Advertising','Other']}
                placeholder="Select type" />
              <Input label="Location" value={form.location} onChange={set('location')} placeholder="Mumbai, MH" icon="📍" />
            </div>
            <Input label="Website (Optional)" value={form.website} onChange={set('website')} placeholder="https://yoursite.com" icon="🌐" />
            <Input label="GST Number" value={form.gst} onChange={set('gst')} placeholder="22AAAAA0000A1Z5" icon="📋" required error={errs.gst} />
          </div>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:14,marginBottom:20 }}>
            <div style={{ background:`${C.accent}0d`,border:`1px solid ${C.accent}28`,borderRadius:12,padding:16 }}>
              <div style={{ fontSize:13,color:C.accentL,fontWeight:700,marginBottom:5 }}>📋 Approval Required</div>
              <div style={{ fontSize:13,color:C.muted }}>
                {form.role === 'super_owner' ? 'Super Owner accounts are manually verified.' : 'Admin accounts require Super Owner approval.'}
              </div>
            </div>
            <Input label="Organisation" value={form.business}  onChange={set('business')}  placeholder="Company / Organisation" icon="🏢" />
            <Input label="Location"     value={form.location}  onChange={set('location')}  placeholder="City, State"            icon="📍" />
          </div>
        )}
        <div style={{ display:'flex',gap:10 }}>
          <Btn variant="ghost" onClick={() => setStep(1)} style={{ flex:1 }}>← Back</Btn>
          <Btn onClick={submit} disabled={loading} size="lg" style={{ flex:2 }}>{loading ? 'Creating…' : 'Create Account ✓'}</Btn>
        </div>
      </>}

      <Divider label="already have an account?" />
      <div style={{ textAlign:'center',fontSize:14,color:C.muted }}>
        <span onClick={() => onGo('login')} style={{ color:C.accentL,cursor:'pointer',fontWeight:700 }}>Sign In</span>
      </div>
    </Shell>
  );
}

/* ── FORGOT PASSWORD ──────────────────────────────────────────────────────────── */
export function ForgotPage({ onGo }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp]   = useState(Array(6).fill(''));
  const [pass, setPass] = useState({ next:'', confirm:'' });
  const [err, setErr]   = useState('');
  const [loading, setL] = useState(false);
  const LABELS = ['Email','Verify OTP','New Password','Done'];

  const sendOtp   = () => { if (!email||!/\S+@\S+\.\S+/.test(email)){setErr('Enter a valid email.');return;} setErr('');setL(true);setTimeout(()=>{setL(false);setStep(2);},900); };
  const verifyOtp = () => { if(otp.join('').length<6){setErr('Enter all 6 digits.');return;} setErr('');setL(true);setTimeout(()=>{setL(false);setStep(3);},700); };
  const resetPass = () => { if(pass.next.length<6){setErr('Min 6 chars.');return;} if(pass.next!==pass.confirm){setErr("Passwords don't match.");return;} setErr('');setL(true);setTimeout(()=>{setL(false);setStep(4);},900); };
  const changeOtp = (i,v) => { if(!/^\d?$/.test(v))return; const n=[...otp];n[i]=v;setOtp(n); if(v&&i<5)document.getElementById(`otp${i+1}`)?.focus(); };

  return (
    <Shell title="Reset Password" subtitle="We'll get you back in quickly">
      <div style={{ display:'flex',alignItems:'center',marginBottom:28 }}>
        {LABELS.map((l,i) => (
          <div key={l} style={{ display:'flex',alignItems:'center',flex:i<LABELS.length-1?1:'none' }}>
            <div style={{ width:30,height:30,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,flexShrink:0,
              background:i<step-1?C.accent:i===step-1?`${C.accent}25`:C.border,
              color:i<step-1?'#fff':i===step-1?C.accentL:C.dim,
              border:`2px solid ${i<step?C.accent:C.border}`,transition:'all .3s' }}>
              {i<step-1?'✓':i+1}
            </div>
            {i<LABELS.length-1&&<div style={{ flex:1,height:2,background:i<step-1?C.accent:C.border,margin:'0 5px',transition:'background .3s' }}/>}
          </div>
        ))}
      </div>
      {step===1&&<><p style={{fontSize:14,color:C.muted,marginBottom:18,lineHeight:1.6}}>Enter your registered email — we'll send a 6-digit OTP.</p>
        <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" icon="📧" required/>
        {err&&<div style={{color:C.red,fontSize:12,margin:'8px 0'}}>{err}</div>}
        <Btn onClick={sendOtp} disabled={loading} full size="lg" style={{marginTop:16}}>{loading?'Sending…':'Send OTP'}</Btn></>}
      {step===2&&<><p style={{fontSize:14,color:C.muted,marginBottom:18,lineHeight:1.6}}>
        Code sent to <strong style={{color:C.text}}>{email}</strong>. <span style={{color:C.dim}}>(Demo: </span><strong style={{color:C.accentL}}>1 2 3 4 5 6</strong><span style={{color:C.dim}}>)</span></p>
        <div style={{display:'flex',gap:10,justifyContent:'center',marginBottom:22}}>
          {otp.map((d,i)=><input key={i} id={`otp${i}`} maxLength={1} value={d} onChange={e=>changeOtp(i,e.target.value)}
            onKeyDown={e=>e.key==='Backspace'&&!d&&i>0&&document.getElementById(`otp${i-1}`)?.focus()}
            style={{width:50,height:58,background:C.surface,border:`2px solid ${d?C.accent:C.border}`,borderRadius:12,textAlign:'center',fontSize:26,fontWeight:800,color:C.text,outline:'none',fontFamily:'monospace'}}/>)}
        </div>
        {err&&<div style={{color:C.red,fontSize:12,marginBottom:8,textAlign:'center'}}>{err}</div>}
        <Btn onClick={verifyOtp} disabled={loading} full size="lg">{loading?'Verifying…':'Verify Code'}</Btn></>}
      {step===3&&<><p style={{fontSize:14,color:C.muted,marginBottom:18}}>Choose a strong new password.</p>
        <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:20}}>
          <Input label="New Password" type="password" value={pass.next} onChange={e=>setPass({...pass,next:e.target.value})} placeholder="Min 6 characters" icon="🔒" required/>
          <Input label="Confirm" type="password" value={pass.confirm} onChange={e=>setPass({...pass,confirm:e.target.value})} placeholder="Repeat" icon="🔒" required/>
        </div>
        {err&&<div style={{color:C.red,fontSize:12,marginBottom:8}}>{err}</div>}
        <Btn onClick={resetPass} disabled={loading} full size="lg">{loading?'Updating…':'Reset Password'}</Btn></>}
      {step===4&&<div style={{textAlign:'center',padding:'14px 0 22px'}}>
        <div style={{fontSize:66,marginBottom:14}}>🎉</div>
        <div style={{fontSize:22,fontWeight:800,color:C.text,fontFamily:"'Syne',sans-serif",marginBottom:8}}>Password Reset!</div>
        <div style={{fontSize:14,color:C.muted,marginBottom:28,lineHeight:1.6}}>Your password has been updated. Sign in with your new credentials.</div>
        <Btn onClick={()=>onGo('login')} full size="lg">Back to Sign In →</Btn>
      </div>}
      {step<4&&<div style={{textAlign:'center',marginTop:18,fontSize:13,color:C.muted}}>
        <span onClick={()=>onGo('login')} style={{color:C.accentL,cursor:'pointer',fontWeight:600}}>← Back to Sign In</span>
      </div>}
    </Shell>
  );
}
