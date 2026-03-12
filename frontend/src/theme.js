// ── COLOUR PALETTE ────────────────────────────────────────────────────────────
export const C = {
  bg      : '#07090f',
  surface : '#0c0f1a',
  card    : '#101420',
  card2   : '#141928',
  border  : '#1a2035',
  border2 : '#252e48',
  accent  : '#2563eb',
  accentL : '#3b82f6',
  indigo  : '#6366f1',
  green   : '#10b981',
  red     : '#ef4444',
  amber   : '#f59e0b',
  pink    : '#ec4899',
  cyan    : '#06b6d4',
  text    : '#f1f5f9',
  muted   : '#94a3b8',
  dim     : '#475569',
  slate   : '#334155',
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
export const rupee = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export const unitColor = (status, selected) => {
  if (selected) return { bg:'rgba(37,99,235,.30)', border:'#3b82f6', text:'#93c5fd' };
  return ({
    available   : { bg:'rgba(16,185,129,.16)', border:'#10b981', text:'#6ee7b7' },
    booked      : { bg:'rgba(239,68,68,.16)',  border:'#ef4444', text:'#fca5a5' },
    maintenance : { bg:'rgba(71,85,105,.20)',  border:'#475569', text:'#94a3b8' },
    hidden      : { bg:'rgba(20,25,40,.50)',   border:'#1e2538', text:'#334155' },
  }[status] || { bg:'rgba(30,37,56,.30)', border:'#252e48', text:'#475569' });
};

export const badge = s => ({
  active      :{ color:'#10b981', bg:'rgba(16,185,129,.14)', label:'Active'      },
  pending     :{ color:'#f59e0b', bg:'rgba(245,158,11,.14)', label:'Pending'     },
  approved    :{ color:'#10b981', bg:'rgba(16,185,129,.14)', label:'Approved'    },
  rejected    :{ color:'#ef4444', bg:'rgba(239,68,68,.14)',  label:'Rejected'    },
  cancelled   :{ color:'#475569', bg:'rgba(71,85,105,.18)',  label:'Cancelled'   },
  available   :{ color:'#10b981', bg:'rgba(16,185,129,.14)', label:'Available'   },
  booked      :{ color:'#ef4444', bg:'rgba(239,68,68,.14)',  label:'Booked'      },
  maintenance :{ color:'#94a3b8', bg:'rgba(71,85,105,.18)',  label:'Maintenance' },
  inactive    :{ color:'#475569', bg:'rgba(71,85,105,.18)',  label:'Inactive'    },
  paid        :{ color:'#10b981', bg:'rgba(16,185,129,.14)', label:'Paid'        },
  unpaid      :{ color:'#f59e0b', bg:'rgba(245,158,11,.14)', label:'Unpaid'      },
}[s] || { color:'#475569', bg:'rgba(71,85,105,.18)', label: s });
