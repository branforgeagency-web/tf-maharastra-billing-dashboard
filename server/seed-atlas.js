import { connectDB, persistAllCollections } from './db.js';
import Branch from './models/Branch.js';
import Receipt from './models/Receipt.js';

const seedAtlas = async () => {
  console.log('Connecting to MongoDB Atlas...');
  await connectDB();

  // Create initial demo receipt to initialize collection in Atlas
  const testReceipt = new Receipt({
    branchCode: 'PN',
    receiptNo: 'TF/PN/2026/1001',
    dateOfReceipt: new Date().toISOString().split('T')[0],
    receiptCategory: 'Course Fee',
    paymentType: 'New Fee',
    studentName: 'Maharashtra Student Entry',
    cellNumber: '9876543210',
    email: 'student@thoughtflows.in',
    address: 'FC Road, Pune',
    paidBranch: 'Pune (FC Road) ★',
    course: 'AMCT Intermediate — ₹23,000 (3 Months)',
    modeOfTraining: 'Offline',
    courseFee: 23000,
    taxableValue: 19491.53,
    gstAmount: 3508.47,
    amountPayingNow: 23000,
    previouslyPaid: 0,
    pendingBalance: 0,
    party: 'Partner',
    account: 'Cash',
    status: 'Paid'
  });

  await testReceipt.save();
  await persistAllCollections();
  console.log('✨ Seeded initial receipt to MongoDB Atlas!');
  process.exit(0);
};

seedAtlas().catch(console.error);
