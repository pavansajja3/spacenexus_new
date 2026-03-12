// ── USERS  (3 roles: super_owner · admin · tenant) ───────────────────────────
export const USERS_INIT = [
  { id:1, name:'Pawan Kumar',  email:'owner@spacenexus.com',   password:'password', role:'super_owner', phone:'9876543210', avatar:'👑', status:'active' },
  { id:2, name:'Rahul Sharma', email:'admin@spacenexus.com',   password:'password', role:'admin',       phone:'9123456780', avatar:'🏢', status:'active' },
  { id:3, name:'Priya Singh',  email:'tenant@spacenexus.com',  password:'password', role:'tenant',      phone:'9988776655', avatar:'🔑', status:'active',
    business:'FreshMart Ltd', businessType:'Retail',      gst:'27AAPFU0939F1ZV', location:'Mumbai' },
  { id:4, name:'Arjun Mehta',  email:'tenant2@spacenexus.com', password:'password', role:'tenant',      phone:'9222333444', avatar:'🔑', status:'active',
    business:'AdVision Corp',  businessType:'Advertising', gst:'29AAGCA8719B1Z8', location:'Bangalore' },
];

// ── SPACES ────────────────────────────────────────────────────────────────────
export const SPACES_INIT = [
  { id:1, name:'Grand Central Mall',  type:'Mall',              location:'Mumbai, MH',    floors:3, area:12000, status:'active',  adminId:2, ownerApproved:true,  createdAt:'2025-01-10' },
  { id:2, name:'Cineplex Hyderabad',  type:'Theatre',           location:'Hyderabad, TS', floors:2, area:5000,  status:'active',  adminId:2, ownerApproved:true,  createdAt:'2025-01-18' },
  { id:3, name:'Metro Hub Delhi',     type:'Transit Hub',       location:'Delhi, DL',     floors:1, area:3000,  status:'pending', adminId:2, ownerApproved:false, createdAt:'2025-02-05' },
  { id:4, name:'Nexus Exhibition Ctr',type:'Exhibition Center', location:'Chennai, TN',   floors:2, area:8000,  status:'active',  adminId:2, ownerApproved:true,  createdAt:'2025-02-14' },
];

// ── UNITS ─────────────────────────────────────────────────────────────────────
export const UNITS_INIT = [
  // Grand Central Mall – Floor 1
  {id:'U1', spaceId:1,floor:1,number:'A1',type:'Advertisement Screen',width:4, height:3, priceDaily:1500, priceWeekly:9000,  priceMonthly:32000, status:'available',  pos_x:7,  pos_y:10,w:13,h:12},
  {id:'U2', spaceId:1,floor:1,number:'A2',type:'Banner Slot',          width:3, height:2, priceDaily:800,  priceWeekly:5000,  priceMonthly:18000, status:'booked',     pos_x:23, pos_y:10,w:11,h:12},
  {id:'U3', spaceId:1,floor:1,number:'A3',type:'Booth',                width:5, height:4, priceDaily:2000, priceWeekly:12000, priceMonthly:42000, status:'available',  pos_x:37, pos_y:10,w:13,h:12},
  {id:'U4', spaceId:1,floor:1,number:'A4',type:'Shop',                 width:6, height:5, priceDaily:3500, priceWeekly:20000, priceMonthly:70000, status:'available',  pos_x:53, pos_y:10,w:15,h:12},
  {id:'U5', spaceId:1,floor:1,number:'A5',type:'Digital Billboard',    width:8, height:6, priceDaily:5000, priceWeekly:30000, priceMonthly:100000,status:'available',  pos_x:71, pos_y:10,w:14,h:12},
  {id:'U6', spaceId:1,floor:1,number:'B1',type:'Digital Billboard',    width:8, height:6, priceDaily:5500, priceWeekly:33000, priceMonthly:110000,status:'maintenance',pos_x:7,  pos_y:27,w:18,h:13},
  {id:'U7', spaceId:1,floor:1,number:'B2',type:'Banner Slot',          width:3, height:2, priceDaily:700,  priceWeekly:4500,  priceMonthly:16000, status:'available',  pos_x:29, pos_y:27,w:11,h:13},
  {id:'U8', spaceId:1,floor:1,number:'B3',type:'Advertisement Screen', width:4, height:3, priceDaily:1800, priceWeekly:10800, priceMonthly:38000, status:'booked',     pos_x:44, pos_y:27,w:13,h:13},
  {id:'U9', spaceId:1,floor:1,number:'B4',type:'Booth',                width:4, height:4, priceDaily:2200, priceWeekly:13200, priceMonthly:46000, status:'available',  pos_x:61, pos_y:27,w:13,h:13},
  {id:'U10',spaceId:1,floor:1,number:'B5',type:'Shop',                 width:5, height:4, priceDaily:3000, priceWeekly:18000, priceMonthly:60000, status:'available',  pos_x:78, pos_y:27,w:13,h:13},
  // Grand Central Mall – Floor 2
  {id:'U11',spaceId:1,floor:2,number:'C1',type:'Shop',                 width:7, height:5, priceDaily:4000, priceWeekly:24000, priceMonthly:84000, status:'available',  pos_x:7,  pos_y:10,w:17,h:13},
  {id:'U12',spaceId:1,floor:2,number:'C2',type:'Digital Billboard',    width:10,height:8, priceDaily:6000, priceWeekly:36000, priceMonthly:120000,status:'available',  pos_x:27, pos_y:10,w:21,h:13},
  {id:'U13',spaceId:1,floor:2,number:'C3',type:'Banner Slot',          width:3, height:2, priceDaily:900,  priceWeekly:5400,  priceMonthly:19500, status:'maintenance',pos_x:52, pos_y:10,w:11,h:13},
  {id:'U14',spaceId:1,floor:2,number:'C4',type:'Booth',                width:5, height:4, priceDaily:2500, priceWeekly:15000, priceMonthly:52000, status:'available',  pos_x:67, pos_y:10,w:13,h:13},
  {id:'U15',spaceId:1,floor:2,number:'C5',type:'Advertisement Screen', width:4, height:3, priceDaily:1600, priceWeekly:9600,  priceMonthly:34000, status:'available',  pos_x:84, pos_y:10,w:11,h:13},
  // Grand Central Mall – Floor 3
  {id:'U16',spaceId:1,floor:3,number:'D1',type:'Shop',                 width:10,height:8, priceDaily:6000, priceWeekly:36000, priceMonthly:130000,status:'available',  pos_x:7,  pos_y:10,w:22,h:15},
  {id:'U17',spaceId:1,floor:3,number:'D2',type:'Digital Billboard',    width:12,height:9, priceDaily:8000, priceWeekly:48000, priceMonthly:160000,status:'booked',     pos_x:33, pos_y:10,w:24,h:15},
  {id:'U18',spaceId:1,floor:3,number:'D3',type:'Booth',                width:5, height:4, priceDaily:2800, priceWeekly:16800, priceMonthly:58000, status:'available',  pos_x:61, pos_y:10,w:14,h:15},
  {id:'U19',spaceId:1,floor:3,number:'D4',type:'Advertisement Screen', width:4, height:3, priceDaily:2000, priceWeekly:12000, priceMonthly:42000, status:'available',  pos_x:79, pos_y:10,w:14,h:15},
  // Cineplex
  {id:'U20',spaceId:2,floor:1,number:'T1',type:'Advertisement Screen', width:6, height:4, priceDaily:2500, priceWeekly:15000, priceMonthly:55000, status:'available',  pos_x:7,  pos_y:10,w:15,h:14},
  {id:'U21',spaceId:2,floor:1,number:'T2',type:'Digital Billboard',    width:10,height:8, priceDaily:7000, priceWeekly:42000, priceMonthly:140000,status:'booked',     pos_x:26, pos_y:10,w:22,h:14},
  {id:'U22',spaceId:2,floor:1,number:'T3',type:'Banner Slot',          width:3, height:2, priceDaily:1000, priceWeekly:6000,  priceMonthly:22000, status:'available',  pos_x:52, pos_y:10,w:12,h:14},
  {id:'U23',spaceId:2,floor:1,number:'T4',type:'Booth',                width:5, height:5, priceDaily:3000, priceWeekly:18000, priceMonthly:65000, status:'available',  pos_x:68, pos_y:10,w:14,h:14},
  // Nexus Exhibition
  {id:'U24',spaceId:4,floor:1,number:'E1',type:'Booth',                width:6, height:6, priceDaily:3200, priceWeekly:19000, priceMonthly:68000, status:'available',  pos_x:7,  pos_y:10,w:16,h:14},
  {id:'U25',spaceId:4,floor:1,number:'E2',type:'Advertisement Screen', width:5, height:4, priceDaily:2200, priceWeekly:13000, priceMonthly:46000, status:'available',  pos_x:27, pos_y:10,w:14,h:14},
  {id:'U26',spaceId:4,floor:1,number:'E3',type:'Digital Billboard',    width:8, height:7, priceDaily:5500, priceWeekly:33000, priceMonthly:110000,status:'maintenance',pos_x:45, pos_y:10,w:18,h:14},
];

// ── BOOKINGS  (tenants book slots – tenantId replaces customerId) ─────────────
export const BOOKINGS_INIT = [
  {id:1,unitId:'U2', spaceId:1,tenantId:3,from:'2025-03-10',to:'2025-03-20',status:'approved', total:15000, tenantName:'Priya Singh', unitNumber:'A2',paymentStatus:'paid',   days:10},
  {id:2,unitId:'U8', spaceId:1,tenantId:4,from:'2025-03-05',to:'2025-03-15',status:'pending',  total:19800, tenantName:'Arjun Mehta', unitNumber:'B3',paymentStatus:'unpaid', days:10},
  {id:3,unitId:'U17',spaceId:1,tenantId:3,from:'2025-04-01',to:'2025-04-30',status:'approved', total:160000,tenantName:'Priya Singh', unitNumber:'D2',paymentStatus:'paid',   days:29},
  {id:4,unitId:'U21',spaceId:2,tenantId:4,from:'2025-03-15',to:'2025-04-14',status:'approved', total:140000,tenantName:'Arjun Mehta', unitNumber:'T2',paymentStatus:'paid',   days:30},
  {id:5,unitId:'U3', spaceId:1,tenantId:3,from:'2025-05-01',to:'2025-05-31',status:'pending',  total:42000, tenantName:'Priya Singh', unitNumber:'A3',paymentStatus:'unpaid', days:30},
];

// ── ANALYTICS ─────────────────────────────────────────────────────────────────
export const ANALYTICS = {
  weeklyVisitors : [1200,1450,1100,1800,1350,2100,1750],
  occupancyRate  : 72,
  totalRevenue   : 685000,
  monthlyRevenue : [85000,92000,78000,110000,95000,125000,108000,135000,118000,142000,130000,155000],
  spaceTypes : [
    {label:'Malls',        value:35},
    {label:'Theatres',     value:25},
    {label:'Transit Hubs', value:22},
    {label:'Exhibition',   value:18},
  ],
  topSpaces : [
    {name:'Grand Central Mall',  revenue:285000, bookings:18},
    {name:'Cineplex Hyderabad',  revenue:215000, bookings:12},
    {name:'Metro Hub Delhi',     revenue:98000,  bookings:7},
    {name:'Nexus Exhibition Ctr',revenue:87000,  bookings:6},
  ],
};
