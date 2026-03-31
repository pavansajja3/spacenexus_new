import { useState } from 'react';
import { C, rupee } from '../theme';
import { PageHeader, Badge, Card, Btn, SearchBar } from '../components/UI';
import PayUCheckout, { PaymentSuccessModal, PaymentFailedModal, downloadReceipt } from '../components/PayUCheckout';

const FILTERS = ['all','pending','approved','rejected','cancelled'];

const REFUND = [
  { time:'≥ 10 days before start', pct:'85%',       color:C.green },
  { time:'5–9 days before start',  pct:'70%',       color:C.green },
  { time:'2–4 days before start',  pct:'40%',       color:C.amber },
  { time:'< 2 days before start',  pct:'No refund', color:C.red   },
];

const statusIcon = s => ({ pending:'⏳', approved:'✅', rejected:'❌', cancelled:'🚫' }[s] || '📋');

export default function Bookings({ bookings, setBookings, role, user, spaces, notify, onApprove, onReject, onCancel, onPaymentSuccess }) {
  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');
  const [showPolicy, setShowP]    = useState(false);
  const [successBooking, setSuccB]= useState(null);   // shows success modal
  const [failedReason,  setFailR] = useState(null);   // shows failure modal
  const [retryBooking,  setRetry] = useState(null);   // booking to retry

  const isOwnerOrAdmin = role === 'super_owner' || role === 'admin';

  const roleFiltered = isOwnerOrAdmin
    ? bookings
    : bookings.filter(b => b.tenantId === user.id || b.tenant_id === user.id);

  const searched = roleFiltered
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b =>
      (b.tenantName  || b.tenant_name  || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.unitNumber  || b.unit_number  || '').toLowerCase().includes(search.toLowerCase())
    );

  const counts = Object.fromEntries(
    FILTERS.map(f => [f, f === 'all'
      ? roleFiltered.length
      : roleFiltered.filter(b => b.status === f).length])
  );

  // ── Actions ──────────────────────────────────────────────────────────────
  const approve = async id => {
    try {
      if (onApprove) await onApprove(id);
      else { setBookings(p => p.map(b => b.id===id ? {...b,status:'approved',paymentStatus:'unpaid'} : b)); notify('Booking approved! ✅'); }
    } catch(e) { notify(e.message||'Approve failed','warn'); }
  };
  const reject = async id => {
    try {
      if (onReject) await onReject(id);
      else { setBookings(p => p.map(b => b.id===id ? {...b,status:'rejected'} : b)); notify('Booking rejected.','warn'); }
    } catch(e) { notify(e.message||'Reject failed','warn'); }
  };
  const cancel = async id => {
    try {
      if (onCancel) await onCancel(id);
      else { setBookings(p => p.map(b => b.id===id ? {...b,status:'cancelled'} : b)); notify('Booking cancelled.','warn'); }
    } catch(e) { notify(e.message||'Cancel failed','warn'); }
  };

  // Called by PayUCheckout after successful payment (from URL param detection in App)
  const handlePaySuccess = (booking) => {
    downloadReceipt(booking, user);   // auto-download receipt
    setSuccB(booking);                // show success modal
    if (onPaymentSuccess) onPaymentSuccess(booking.id);
  };

  const spaceName = id => (spaces || []).find(s => s.id === id)?.name || `Space #${id}`;
  const pageTitle = role === 'tenant' ? 'My Bookings' : 'All Bookings';
  const pageSub   = role === 'tenant'
    ? `${roleFiltered.length} booking${roleFiltered.length !== 1 ? 's' : ''} in your account`
    : 'Manage all slot booking requests and approvals';

  return (
    <div>
      <PageHeader title={pageTitle} sub={pageSub}
        action={<>
          <SearchBar value={search} onChange={setSearch}
            placeholder={role==='tenant' ? 'Search by unit or space…' : 'Search tenant or unit…'}
            width={260}
          />
          <Btn size="sm" variant="ghost" onClick={() => setShowP(!showPolicy)}>📋 Refund Policy</Btn>
        </>}
      />

      {/* Tenant empty state */}
      {role === 'tenant' && roleFiltered.length === 0 && (
        <div style={{ background:`${C.accent}0d`,border:`1px solid ${C.accent}28`,borderRadius:14,padding:'18px 22px',marginBottom:22,display:'flex',alignItems:'center',gap:14 }}>
          <div style={{ fontSize:32 }}>💡</div>
          <div>
            <div style={{ fontSize:14,fontWeight:700,color:C.text,marginBottom:3 }}>No bookings yet</div>
            <div style={{ fontSize:13,color:C.muted }}>
              Go to <strong style={{color:C.accentL}}>Spaces → Blueprint</strong>, pick any 🟢 green unit and submit a booking request.
            </div>
          </div>
        </div>
      )}

      {/* Refund policy */}
      {showPolicy && (
        <Card sx={{ padding:22,marginBottom:20,border:`1px solid ${C.amber}28` }}>
          <div style={{ fontSize:14,fontWeight:700,color:C.text,marginBottom:14 }}>🔄 Cancellation & Refund Policy</div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12 }}>
            {REFUND.map(r => (
              <div key={r.time} style={{ background:C.surface,borderRadius:10,padding:'12px 14px' }}>
                <div style={{ fontSize:11,color:C.muted,marginBottom:6,lineHeight:1.4 }}>{r.time}</div>
                <div style={{ fontSize:20,fontWeight:800,color:r.color,fontFamily:"'Syne',sans-serif" }}>{r.pct}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Summary cards */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20 }}>
        {[
          { label:'Pending',  count:counts.pending,  color:C.amber  },
          { label:'Approved', count:counts.approved, color:C.green  },
          { label:'Rejected', count:counts.rejected, color:C.red    },
          { label:'Total',    count:counts.all,      color:C.accent },
        ].map(s => (
          <Card key={s.label}
            sx={{ padding:'14px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer' }}
            onClick={() => setFilter(s.label.toLowerCase() === 'total' ? 'all' : s.label.toLowerCase())}>
            <span style={{ fontSize:12,color:C.muted }}>{s.label}</span>
            <span style={{ fontSize:24,fontWeight:800,color:s.color,fontFamily:"'Syne',sans-serif" }}>{s.count}</span>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex',gap:6,marginBottom:20,flexWrap:'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding:'7px 16px',borderRadius:10,border:`1px solid ${filter===f?C.accentL:C.border}`,background:filter===f?`${C.accent}18`:'transparent',color:filter===f?C.accentL:C.muted,fontSize:12,fontWeight:600,cursor:'pointer',transition:'all .15s',display:'flex',gap:6,alignItems:'center' }}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
            <span style={{ background:filter===f?C.accentL:C.slate,color:'#fff',fontSize:10,fontWeight:800,borderRadius:10,padding:'1px 7px',minWidth:20,textAlign:'center' }}>
              {counts[f]||0}
            </span>
          </button>
        ))}
      </div>

      {/* Booking cards */}
      <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
        {searched.map(b => {
          const isPaidApproved = b.status==='approved' && (b.paymentStatus||b.payment_status)==='paid';
          const isUnpaidApproved = b.status==='approved' && (b.paymentStatus||b.payment_status)!=='paid';

          return (
            <Card key={b.id} sx={{ padding:'18px 22px' }}>
              <div style={{ display:'flex',alignItems:'center',gap:18 }}>

                {/* Status bubble */}
                <div style={{ width:50,height:50,borderRadius:13,background:C.surface,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0 }}>
                  {statusIcon(b.status)}
                </div>

                {/* Info */}
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:'flex',gap:10,alignItems:'center',marginBottom:6,flexWrap:'wrap' }}>
                    <span style={{ fontSize:15,fontWeight:800,color:C.text,fontFamily:"'Syne',sans-serif" }}>
                      Unit {b.unitNumber || b.unit_number}
                    </span>
                    <Badge status={b.status} />
                    {b.status === 'approved' && <Badge status={b.paymentStatus || b.payment_status} />}
                  </div>

                  <div style={{ fontSize:13,color:C.muted,display:'flex',gap:18,flexWrap:'wrap',lineHeight:1.9 }}>
                    {isOwnerOrAdmin && <span>🔑 {b.tenantName || b.tenant_name}</span>}
                    <span>📅 {b.from || b.from_date} → {b.to || b.to_date}</span>
                    <span>🏢 {spaceName(b.spaceId || b.space_id)}</span>
                    {b.days && <span>⏱ {b.days} day{b.days!==1?'s':''}</span>}
                  </div>

                  {/* Tenant status message */}
                  {role === 'tenant' && (
                    <div style={{ marginTop:7,fontSize:12,padding:'4px 12px',borderRadius:7,display:'inline-block',
                      background: b.status==='pending'  ? `${C.amber}14`
                                : b.status==='approved' ? `${C.green}14`
                                : `${C.red}14`,
                      color: b.status==='pending'  ? C.amber
                           : b.status==='approved' ? C.green
                           : C.red,
                    }}>
                      {b.status==='pending'     && '⏳ Awaiting admin approval'}
                      {isUnpaidApproved         && '⚠️ Approved! Complete payment within 24 hours'}
                      {isPaidApproved           && '✅ Confirmed — receipt & lease available'}
                      {b.status==='rejected'    && '❌ Booking rejected by admin'}
                      {b.status==='cancelled'   && '🚫 Cancelled — refund per policy'}
                    </div>
                  )}
                </div>

                {/* Amount + buttons */}
                <div style={{ textAlign:'right',flexShrink:0 }}>
                  <div style={{ fontSize:19,fontWeight:800,color:C.accentL,marginBottom:8 }}>{rupee(b.total)}</div>
                  <div style={{ display:'flex',gap:6,flexWrap:'wrap',justifyContent:'flex-end' }}>

                    {/* Admin/Owner: approve or reject */}
                    {isOwnerOrAdmin && b.status==='pending' && (
                      <>
                        <Btn size="sm" variant="success" onClick={() => approve(b.id)}>✓ Approve</Btn>
                        <Btn size="sm" variant="danger"  onClick={() => reject(b.id)}>✕ Reject</Btn>
                      </>
                    )}

                    {/* Admin/Owner: cancel unpaid */}
                    {isOwnerOrAdmin && isUnpaidApproved && (
                      <Btn size="sm" variant="ghost" onClick={() => cancel(b.id)}>Cancel</Btn>
                    )}

                    {/* Tenant: PayU pay button */}
                    {role==='tenant' && isUnpaidApproved && (
                      <>
                        <PayUCheckout
                          booking={b}
                          user={user}
                          notify={notify}
                          onSuccess={handlePaySuccess}
                        />
                        <Btn size="sm" variant="ghost" onClick={() => cancel(b.id)}>Cancel</Btn>
                      </>
                    )}

                    {/* Download receipt when paid */}
                    {isPaidApproved && (
                      <>
                        <Btn size="sm" variant="ghost" onClick={() => downloadReceipt(b, user)}>
                          📄 Receipt
                        </Btn>
                        <Btn size="sm" variant="ghost">📋 Lease</Btn>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Empty state */}
        {searched.length === 0 && (
          <div style={{ textAlign:'center',padding:70,color:C.dim }}>
            <div style={{ fontSize:48,marginBottom:14,opacity:.35 }}>📭</div>
            <div style={{ fontSize:15,fontWeight:700,color:C.muted,marginBottom:6 }}>
              {filter==='all' ? 'No bookings found' : `No ${filter} bookings`}
            </div>
            <div style={{ fontSize:13,color:C.dim }}>
              {role==='tenant'
                ? 'Browse spaces and book a slot — it will appear here instantly.'
                : 'Booking requests submitted by tenants will appear here.'}
            </div>
          </div>
        )}
      </div>

      {/* Payment success modal */}
      {successBooking && (
        <PaymentSuccessModal
          booking={successBooking}
          user={user}
          onClose={() => setSuccB(null)}
        />
      )}

      {/* Payment failure modal */}
      {failedReason && (
        <PaymentFailedModal
          reason={failedReason}
          onClose={() => setFailR(null)}
          onRetry={() => { setFailR(null); if (retryBooking) {} }}
        />
      )}
    </div>
  );
}
