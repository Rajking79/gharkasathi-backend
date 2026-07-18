import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Force Node.js to use Google DNS for SRV records resolution
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

// Disable buffering commands when MongoDB is disconnected
mongoose.set('bufferCommands', false);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gharkasathi';

// Connect to MongoDB with async non-blocking handling
export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 500 });
    console.log(`Connected to MongoDB Atlas cloud database successfully!`);
  } catch (err) {
    console.warn('MongoDB Atlas Warning: Operating in fast offline memory mode.');
  }
};

// ==========================================
// 1. User Schema & Model
// ==========================================
const addressItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  addressLine: { type: String, default: '' },
  house: { type: String, default: '' },
  building: { type: String, default: '' },
  landmark: { type: String, default: '' },
  latitude: { type: Number, default: 0.0 },
  longitude: { type: Number, default: 0.0 },
  floor: { type: String, default: '' },
  tag: { type: String, default: 'Home' }, // Home, Office, Other
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  gender: { type: String, default: '' },
  dob: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  isProfileCompleted: { type: Boolean, default: false },
  fcmToken: { type: String, default: '' },
  deviceId: { type: String, default: '' },
  savedAddresses: [addressItemSchema]
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);

// ==========================================
// 2. Provider (Expert) Schema & Model
// ==========================================
const providerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  experienceYears: { type: Number, default: 0 },
  distanceKm: { type: Number, default: 1.0 },
  baseHourlyRate: { type: Number, default: 200.0 },
  skills: { type: [String], default: [] },
  languages: { type: [String], default: [] },
  bio: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  completedJobs: { type: Number, default: 0 },
  kycStatus: { type: String, default: 'Verified' }, // Verified, Under Review, Unverified
  walletBalance: { type: Number, default: 0.0 },
  profilePicture: { type: String, default: '' },
  fcmToken: { type: String, default: '' },
  deviceId: { type: String, default: '' }
}, { timestamps: true });

export const Provider = mongoose.model('Provider', providerSchema);

// ==========================================
// 3. Category & SubService Schemas
// ==========================================
const subServiceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  basePrice: { type: Number, required: true },
  description: { type: String, default: '' }
});

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  iconName: { type: String, default: '' },
  subServices: [subServiceSchema]
});

export const Category = mongoose.model('Category', categorySchema);

// ==========================================
// 4. Booking Schema & Model
// ==========================================
const bookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  categoryId: { type: String, required: true },
  subServiceId: { type: String, required: true },
  providerId: { type: String, default: null },
  dateTime: { type: String, required: true },
  timeSlot: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, required: true }, // pending, broadcasted, accepted, onTheWay, reached, started, completed, paid, reviewed
  basePrice: { type: Number, required: true },
  discount: { type: Number, default: 0.0 },
  tax: { type: Number, required: true },
  visitingCharge: { type: Number, default: 50.0 },
  platformFee: { type: Number, default: 15.0 },
  finalAmount: { type: Number, required: true },
  providerProgress: { type: Number, default: 0.0 },
  rating: { type: Number, default: null },
  ratingComment: { type: String, default: null },
  problemDescription: { type: String, default: '' },
  hasVoiceNote: { type: Boolean, default: false },
  jobPhotos: { type: [String], default: [] },
  beforePhotos: { type: [String], default: [] },
  afterPhotos: { type: [String], default: [] },
  paymentMethod: { type: String, default: 'UPI' },
  otp: { type: String, required: true },
  extraWorkRequested: { type: Boolean, default: false },
  extraWorkApproved: { type: Boolean, default: false },
  extraWorkCost: { type: Number, default: 0.0 },
  extraWorkReason: { type: String, default: '' }
}, { timestamps: true });

export const Booking = mongoose.model('Booking', bookingSchema);

// ==========================================
// 5. Chat Message Schema & Model
// ==========================================
const chatMessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  bookingId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderType: { type: String, required: true }, // user, provider
  text: { type: String, required: true },
  imageUrl: { type: String, default: null },
  timestamp: { type: String, default: () => new Date().toISOString() }
});

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

// ==========================================
// 6. Notification Schema & Model
// ==========================================
const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userType: { type: String, required: true }, // user, provider
  recipientId: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  routeType: { type: String, default: '' },
  routeId: { type: String, default: '' },
  timestamp: { type: String, default: () => new Date().toISOString() }
});

export const Notification = mongoose.model('Notification', notificationSchema);

// ==========================================
// 7. Wallet Transaction Schema & Model
// ==========================================
const walletTransactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  providerId: { type: String, required: true },
  bookingId: { type: String, default: null },
  type: { type: String, required: true }, // earning, withdrawal, commission_deduction
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  status: { type: String, default: 'completed' } // pending, completed, failed
}, { timestamps: true });

export const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);


// ==========================================
// 8. Support Ticket Schema & Model
// ==========================================
const ticketReplySchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderRole: { type: String, required: true }, // user, provider, admin
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const supportTicketSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, default: 'open' }, // open, in_progress, closed
  replies: [ticketReplySchema]
}, { timestamps: true });

export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

// ==========================================
// 9. Referral Schema & Model
// ==========================================
const referralSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, unique: true },
  referralCode: { type: String, required: true, unique: true },
  referredUsersCount: { type: Number, default: 0 },
  referredUsers: { type: [String], default: [] },
  totalRewardsEarned: { type: Number, default: 0.0 }
}, { timestamps: true });

export const Referral = mongoose.model('Referral', referralSchema);

// ==========================================
// 10. Reward Points Schema & Model
// ==========================================
const rewardTransactionSchema = new mongoose.Schema({
  points: { type: Number, required: true },
  type: { type: String, required: true }, // credit, debit
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const rewardSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, unique: true },
  pointsBalance: { type: Number, default: 0 },
  history: [rewardTransactionSchema]
}, { timestamps: true });

export const Reward = mongoose.model('Reward', rewardSchema);

// ==========================================
// 11. Device & Session Schema & Model
// ==========================================
const deviceSessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  token: { type: String, required: true },
  ipAddress: { type: String, default: '' },
  deviceType: { type: String, default: 'unknown' }
}, { timestamps: true });

export const DeviceSession = mongoose.model('DeviceSession', deviceSessionSchema);


// ==========================================
// Seeding & Initialization Logic
// ==========================================
export const initDB = async () => {
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.warn('Database connection unavailable. Operating with in-memory fallback models.');
    return;
  }
  const categoryCount = await Category.countDocuments();
  if (categoryCount === 0) {
    console.log('Seeding initial categories...');
    const initialCategories = [
    {
      id: 'cat_plumber',
      name: 'Plumber',
      description: 'Fix leakages, pipe blockages, taps, and sanitary fittings.',
      iconName: 'plumbing_rounded',
      subServices: [
        { id: 'sub_pl_leak', name: 'Leakage Repair', basePrice: 249, description: 'Fixing dripping taps, pipeline leaks and drainage drips.' },
        { id: 'sub_pl_tap', name: 'Tap/Mixer Installation', basePrice: 199, description: 'Replacing or installing new bathroom and kitchen fittings.' },
        { id: 'sub_pl_block', name: 'Drain Unclogging', basePrice: 349, description: 'Clearing clogged sinks, bathroom drains and sewer lines.' }
      ]
    },
    {
      id: 'cat_electrician',
      name: 'Electrician',
      description: 'Complete wiring, switch repairs, appliances, and fan installations.',
      iconName: 'electric_bolt_rounded',
      subServices: [
        { id: 'sub_el_wiring', name: 'Short Circuit Repair', basePrice: 299, description: 'Diagnosing power outages, trip issues and wiring faults.' },
        { id: 'sub_el_fan', name: 'Ceiling Fan Installation', basePrice: 149, description: 'Mounting, wiring, and testing ceiling fans.' },
        { id: 'sub_el_switch', name: 'Switchboard Repair', basePrice: 99, description: 'Fixing sparks, socket defects and installing new switch boards.' }
      ]
    },
    {
      id: 'cat_carpenter',
      name: 'Carpenter',
      description: 'Furniture assembly, lock repair, and custom woodwork adjustments.',
      iconName: 'construction_rounded',
      subServices: [
        { id: 'sub_cp_door', name: 'Door & Lock Repair', basePrice: 199, description: 'Fixing door alignment, squeaking hinges, and lock replacements.' },
        { id: 'sub_cp_furn', name: 'Furniture Assembly', basePrice: 399, description: 'Assembling beds, wardrobes, desks, and shelves.' },
        { id: 'sub_cp_wood', name: 'General Woodwork Touchup', basePrice: 249, description: 'Polishing, drawer adjustments, and minor custom alterations.' }
      ]
    },
    {
      id: 'cat_painter',
      name: 'Painter',
      description: 'Wall touch-ups, single rooms, interior wall coatings, and damping treatment.',
      iconName: 'format_paint_rounded',
      subServices: [
        { id: 'sub_pt_touch', name: 'Wall Damage Touchup', basePrice: 499, description: 'Plaster repairing and spot-painting scratches or cracks.' },
        { id: 'sub_pt_room', name: 'Single Room Painting', basePrice: 2999, description: 'Complete premium painting of a single room walls & ceiling.' },
        { id: 'sub_pt_damp', name: 'Waterproofing & Damping', basePrice: 999, description: 'Applying wall sealers to cure damp patches and mould growth.' }
      ]
    },
    {
      id: 'cat_maid',
      name: 'Maid & Cleaning',
      description: 'Full house deep cleaning, kitchen sanitizing, and dry cleaning.',
      iconName: 'cleaning_services_rounded',
      subServices: [
        { id: 'sub_cl_deep', name: 'Full House Deep Cleaning', basePrice: 1999, description: 'Intense floor scrubbing, bathroom descaling, and dust removal.' },
        { id: 'sub_cl_kit', name: 'Kitchen Chimney & Deep Clean', basePrice: 899, description: 'Degreasing stoves, slabs, exhaust fans, and cabinet interiors.' },
        { id: 'sub_cl_sofa', name: 'Sofa Vacuum & Shampooing', basePrice: 599, description: 'Removing stains and deep vacuuming fabric sofa seats.' }
      ]
    },
    {
      id: 'cat_ac',
      name: 'AC Repair & Service',
      description: 'Filter cleaning, gas charging, leak repairs, and complete installations.',
      iconName: 'ac_unit_rounded',
      subServices: [
        { id: 'sub_ac_serv', name: 'AC Jet Cleaning', basePrice: 399, description: 'Complete pressure cleaning of indoor/outdoor unit filters and fins.' },
        { id: 'sub_ac_gas', name: 'Refrigerant Gas Top-Up', basePrice: 1499, description: 'Fixing leaks and refilling AC gas to restore cooling performance.' },
        { id: 'sub_ac_inst', name: 'AC Installation / Removal', basePrice: 999, description: 'Secure mounting and copper piping connection for split/window ACs.' }
      ]
    },
    {
      id: 'cat_ro',
      name: 'RO Purifier Service',
      description: 'Water taste restoration, filter replacements, and membrane diagnostics.',
      iconName: 'water_drop_rounded',
      subServices: [
        { id: 'sub_ro_filter', name: 'Annual Filter Replacement', basePrice: 799, description: 'Changing pre-filters, carbon blocks, and sediment filters.' },
        { id: 'sub_ro_taste', name: 'TDS Adjustment & Service', basePrice: 299, description: 'Cleaning storage tank and tuning water mineralization index.' }
      ]
    },
    {
      id: 'cat_fridge',
      name: 'Refrigerator Repair',
      description: 'Fix cooling failures, compressor issues, and door seal repairs.',
      iconName: 'kitchen_rounded',
      subServices: [
        { id: 'sub_fr_cool', name: 'Cooling Restoration', basePrice: 349, description: 'Fixing frost accumulation, thermostat defects, and fan noises.' },
        { id: 'sub_fr_comp', name: 'Compressor Diagnostics', basePrice: 999, description: 'Testing startup issues and replacing faulty relay capacitors.' }
      ]
    },
    {
      id: 'cat_grocery',
      name: 'Grocery & Errands',
      description: 'Heavy item moving, furniture lifting, and emergency nearby shopping.',
      iconName: 'shopping_cart_rounded',
      subServices: [
        { id: 'sub_gr_heavy', name: 'Heavy Item Lifting/Moving', basePrice: 249, description: 'Enlisting a helper to move furniture or packages within the house.' },
        { id: 'sub_gr_buy', name: 'Emergency Errands Run', basePrice: 149, description: 'Getting urgent items purchased and delivered from nearby shops.' }
      ]
    },
    {
      id: 'cat_medical',
      name: 'Medical & Care',
      description: 'Physiotherapist sessions, patient care assistants, and health help.',
      iconName: 'medical_services_rounded',
      subServices: [
        { id: 'sub_md_physio', name: 'Physiotherapy Session', basePrice: 599, description: '45-minute home session for posture correction, pain, or rehabilitation.' },
        { id: 'sub_md_nurse', name: 'Patient Care Assistance', basePrice: 399, description: 'Providing companion assistance, vitals check, and drug schedules.' }
      ]
    }
  ];

  await Category.insertMany(initialCategories);
  }

  const providerCount = await Provider.countDocuments();
  if (providerCount === 0) {
    console.log('Seeding initial providers...');
    const initialProviders = [
    {
      id: 'prov_rajesh',
      name: 'Rajesh Kumar',
      phone: '9876543210',
      rating: 4.8,
      reviewsCount: 142,
      experienceYears: 6,
      distanceKm: 1.4,
      baseHourlyRate: 250,
      skills: ['Leakage Repair', 'Drain Clog Fixes', 'Bathroom Fitting', 'Grouting'],
      languages: ['Hindi', 'English', 'Bhojpuri'],
      bio: 'Highly experienced plumber offering quick and durable leak fixing. Known for cleanliness and transparent pricing.',
      isAvailable: true,
      completedJobs: 924,
      profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 'prov_anil',
      name: 'Anil Sharma',
      phone: '9876543211',
      rating: 4.9,
      reviewsCount: 218,
      experienceYears: 8,
      distanceKm: 0.9,
      baseHourlyRate: 280,
      skills: ['Short Circuits', 'Ceiling Fans', 'Inverter Wiring', 'LED Panel Sets'],
      languages: ['Hindi', 'English', 'Punjabi'],
      bio: 'Certified electrician specializing in critical wiring and quick short circuit diagnostics. Priority emergency callouts.',
      isAvailable: true,
      completedJobs: 1350,
      profilePicture: 'https://randomuser.me/api/portraits/men/45.jpg'
    },
    {
      id: 'prov_mohammad',
      name: 'Mohammad Farhan',
      phone: '9876543212',
      rating: 4.7,
      reviewsCount: 89,
      experienceYears: 5,
      distanceKm: 2.1,
      baseHourlyRate: 220,
      skills: ['Door Locks', 'Wardrobes', 'Kitchen Cabinet Repair', 'Table Polish'],
      languages: ['Hindi', 'Urdu'],
      bio: 'Passionate wood artisan capable of assembling heavy modular furniture as well as resolving squeaks in your wooden panels.',
      isAvailable: true,
      completedJobs: 412,
      profilePicture: 'https://randomuser.me/api/portraits/men/29.jpg'
    },
    {
      id: 'prov_satish',
      name: 'Satish Yadav',
      phone: '9876543213',
      rating: 4.6,
      reviewsCount: 65,
      experienceYears: 4,
      distanceKm: 3.2,
      baseHourlyRate: 200,
      skills: ['AC Jet Wash', 'Gas Recharge', 'Drain Pipe Leakage', 'AC Bracket Fitting'],
      languages: ['Hindi'],
      bio: 'Expert AC Technician. Fast and efficient gas refilling and deep coil washing services to keep your cooling optimal.',
      isAvailable: true,
      completedJobs: 310,
      profilePicture: 'https://randomuser.me/api/portraits/men/11.jpg'
    },
    {
      id: 'prov_neha',
      name: 'Neha Verma',
      phone: '9876543214',
      rating: 4.9,
      reviewsCount: 176,
      experienceYears: 7,
      distanceKm: 1.8,
      baseHourlyRate: 180,
      skills: ['Deep Cleaning', 'Kitchen Sanitizing', 'Sofa Shampooing', 'Dusting'],
      languages: ['Hindi', 'English'],
      bio: 'Professional housemaker and deep cleaning specialist. Punctual, detailed, and uses environment-friendly disinfectants.',
      isAvailable: true,
      completedJobs: 540,
      profilePicture: 'https://randomuser.me/api/portraits/women/65.jpg'
    }
  ];

  await Provider.insertMany(initialProviders);
  }
  console.log('Seeding initial MongoDB collections completed successfully!');
};
