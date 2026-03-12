import { C, rupee } from '../theme';
import { StatCard, BarChart, PieChart, PageHeader, Card } from '../components/UI';
import { ANALYTICS } from '../data';

export default function Dashboard({ bookings, spaces }) {
  const pending  = bookings.filter(b => b.status === 'pending').length;
  const approved = bookings.filter(b => b.status === 'approved').length;
  const revenue  = bookings.filter(b => b.status === 'approved' && b.paymentStatus === 'paid').reduce((s, b) => s + b.total, 0) || ANALYTICS.totalRevenue;
  const activeSpaces = spaces.filter(s => s.status === 'active' && s.ownerApproved).length;

  return (
    <div>
      <PageHeader title="System Dashboard" sub="Live analytics, occupancy and revenue insights" />

      {/* KPI Row */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:22 }}>
        <StatCard label="Total Revenue"    value={rupee(revenue)}    sub="Paid bookings"     color={C.accent} icon="💰" pct={72} />
        <StatCard label="Occupancy Rate"   value={`${ANALYTICS.occupancyRate}%`} sub="All spaces" color={C.green} icon="📊" pct={72} />
        <StatCard label="Active Spaces"    value={activeSpaces}      sub="Approved & live"   color={C.amber}  icon="🏢" pct={activeSpaces * 25} />
        <StatCard label="Pending Requests" value={pending}           sub="Awaiting action"   color={C.red}    icon="⏳" pct={pending * 15} />
      </div>

      {/* Charts row */}
      <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:16 }}>
        <Card sx={{ padding:24 }}>
          <div style={{ fontSize:15,fontWeight:700,color:C.text,fontFamily:"'Syne',sans-serif",marginBottom:3 }}>Weekly Visitors</div>
          <div style={{ fontSize:12,color:C.dim,marginBottom:16 }}>Mon – Sun this week</div>
          <BarChart data={ANALYTICS.weeklyVisitors} color={C.accent} labels={['Mon','Tue','Wed','Thu','Fri','Sat','Sun']} height={90} />
        </Card>
        <Card sx={{ padding:24 }}>
          <div style={{ fontSize:15,fontWeight:700,color:C.text,fontFamily:"'Syne',sans-serif",marginBottom:3 }}>Space Types</div>
          <div style={{ fontSize:12,color:C.dim,marginBottom:16 }}>Distribution</div>
          <PieChart data={ANALYTICS.spaceTypes} />
        </Card>
      </div>

      {/* Revenue + Top Spaces */}
      <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:16 }}>
        <Card sx={{ padding:24 }}>
          <div style={{ fontSize:15,fontWeight:700,color:C.text,fontFamily:"'Syne',sans-serif",marginBottom:3 }}>Monthly Revenue 2025</div>
          <div style={{ fontSize:12,color:C.dim,marginBottom:16 }}>Jan – Dec</div>
          <BarChart data={ANALYTICS.monthlyRevenue} color={C.green} labels={['J','F','M','A','M','J','J','A','S','O','N','D']} height={90} />
        </Card>
        <Card sx={{ padding:24 }}>
          <div style={{ fontSize:15,fontWeight:700,color:C.text,fontFamily:"'Syne',sans-serif",marginBottom:16 }}>🏆 Top Spaces</div>
          {ANALYTICS.topSpaces.map((s, i) => (
            <div key={s.name} style={{ display:'flex',alignItems:'center',gap:12,marginBottom:i<3?14:0 }}>
              <div style={{ width:26,height:26,borderRadius:7,background:`${[C.amber,C.muted,C.dim,'#6b7280'][i]}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:[C.amber,C.muted,C.dim,'#6b7280'][i],flexShrink:0 }}>#{i+1}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:12,fontWeight:700,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{s.name}</div>
                <div style={{ fontSize:10,color:C.dim }}>{s.bookings} bookings</div>
              </div>
              <div style={{ fontSize:12,fontWeight:700,color:C.green,flexShrink:0 }}>{rupee(s.revenue)}</div>
            </div>
          ))}
        </Card>
      </div>

      {/* Booking summary */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14 }}>
        {[
          { label:'Pending Bookings',  count:pending,         color:C.amber, icon:'⏳' },
          { label:'Approved Bookings', count:approved,        color:C.green, icon:'✅' },
          { label:'Total Bookings',    count:bookings.length, color:C.accent,icon:'📋' },
        ].map(s => (
          <Card key={s.label} sx={{ padding:'16px 22px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <div>
              <div style={{ fontSize:11,color:C.dim,textTransform:'uppercase',letterSpacing:1,marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:28,fontWeight:800,color:s.color,fontFamily:"'Syne',sans-serif" }}>{s.count}</div>
            </div>
            <div style={{ fontSize:32,opacity:.45 }}>{s.icon}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
