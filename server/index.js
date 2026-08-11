import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, persistAllCollections, resetDatabase } from './db.js';

import Branch from './models/Branch.js';
import Receipt from './models/Receipt.js';
import Voucher from './models/Voucher.js';
import DailyLead from './models/DailyLead.js';
import DailyTarget from './models/DailyTarget.js';
import B2BRevenue from './models/B2BRevenue.js';
import Employee from './models/Employee.js';
import BalanceSheet from './models/BalanceSheet.js';
import InitialInvestment from './models/InitialInvestment.js';
import PartnerSettlement from './models/PartnerSettlement.js';
import ExamFee from './models/ExamFee.js';
import TreasuryTransaction from './models/TreasuryTransaction.js';
import { calculateProfitDistribution } from './services/profitSharingService.js';

import User from './models/User.js';
import { generateToken, verifyToken, requireRole } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5055;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Connect to MongoDB Database & seed default role users
const seedDefaultUsers = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Thought Flows Admin',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        branch: 'All Branches (Global View)',
      });
      console.log('✓ Default Admin account seeded: admin / admin123');
    }

    const managementExists = await User.findOne({ username: 'management' });
    if (!managementExists) {
      await User.create({
        name: 'Maharashtra Manager',
        username: 'management',
        password: 'manage123',
        role: 'management',
        branch: 'Pune (FC Road) ★',
      });
      console.log('✓ Default Management account seeded: management / manage123');
    }
  } catch (err) {
    console.error('Error seeding default accounts:', err);
  }
};

connectDB().then(() => {
  seedDefaultUsers();
});

// Helper to generate regex matching branch name safely without special character regex errors
const getBranchRegex = (branchStr) => {
  if (!branchStr || branchStr === 'All' || branchStr === 'All Branches (Global View)') return null;
  const bLower = branchStr.toLowerCase();
  if (bLower.includes('pune')) return new RegExp('pune', 'i');
  if (bLower.includes('kolhapur')) return new RegExp('kolhapur', 'i');
  if (bLower.includes('salem')) return new RegExp('salem', 'i');
  const clean = branchStr.replace('★', '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(clean, 'i');
};

// Helper to format receipt number querying MongoDB receipts collection
const generateReceiptNo = async (paidBranch) => {
  const year = new Date().getFullYear();
  let codePrefix = 'MH';
  if (paidBranch) {
    if (paidBranch.toLowerCase().includes('salem')) codePrefix = 'SL';
    else if (paidBranch.toLowerCase().includes('pune')) codePrefix = 'PN';
    else if (paidBranch.toLowerCase().includes('kolhapur')) codePrefix = 'KP';
    else if (paidBranch.toLowerCase().includes('coimbatore')) codePrefix = 'CB';
    else if (paidBranch.toLowerCase().includes('vizag')) codePrefix = 'VZ';
    else if (paidBranch.toLowerCase().includes('hyderabad')) codePrefix = 'HY';
    else if (paidBranch.toLowerCase().includes('kochi')) codePrefix = 'KC';
  }
  const prefix = `TF/${codePrefix}/${year}/`;
  
  try {
    const latest = await Receipt.findOne({ receiptNo: new RegExp(`^${prefix}`) }).sort({ createdAt: -1 });
    if (latest && latest.receiptNo) {
      const parts = latest.receiptNo.split('/');
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) return `${prefix}${lastNum + 1}`;
    }
  } catch (e) {
    console.error('Error fetching receipt sequence from MongoDB:', e);
  }
  return `${prefix}1001`;
};

// --- AUTHENTICATION ENDPOINTS ---

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        branch: user.branch,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', verifyToken, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      username: req.user.username,
      role: req.user.role,
      branch: req.user.branch,
    },
  });
});

// POST /api/auth/seed
app.post('/api/auth/seed', async (req, res) => {
  try {
    await seedDefaultUsers();
    res.json({ message: 'Default accounts successfully seeded' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed accounts' });
  }
});

// GET /api/branches
app.get('/api/branches', async (req, res) => {
  try {
    const branches = await Branch.find({});
    res.json(branches.map(b => ({ ...b.toObject(), id: b._id.toString() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/next-receipt-no
app.get('/api/next-receipt-no', async (req, res) => {
  try {
    const { branch } = req.query;
    const nextNo = await generateReceiptNo(branch || 'Pune (FC Road) ★');
    res.json({ receiptNo: nextNo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/receipts
app.get('/api/receipts', async (req, res) => {
  try {
    const { search, category, status, party, account, branch, startDate, endDate } = req.query;
    
    let q = {};
    if (search) {
      const reg = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      q.$or = [{ studentName: reg }, { receiptNo: reg }, { course: reg }, { cellNumber: reg }];
    }
    if (category && category !== 'All') q.receiptCategory = category;
    if (status && status !== 'All') q.status = status;
    if (party && party !== 'All') q.party = party;
    if (account && account !== 'All') q.account = account;
    
    const bReg = getBranchRegex(branch);
    if (bReg) {
      q.$or = [{ paidBranch: bReg }, { branchCode: bReg }];
    }
    
    if (startDate || endDate) {
      q.dateOfReceipt = {};
      if (startDate) q.dateOfReceipt.$gte = startDate;
      if (endDate) q.dateOfReceipt.$lte = endDate;
    }

    const receipts = await Receipt.find(q).sort({ dateOfReceipt: -1, createdAt: -1 });
    res.json(receipts.map(r => ({ ...r.toObject(), id: r._id.toString() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/receipts
app.post('/api/receipts', async (req, res) => {
  try {
    const data = req.body;
    let finalParty = data.party;
    if (data.account === 'IDFC Main') {
      finalParty = 'Management';
    }

    const courseFee = parseFloat(data.courseFee) || 0;
    const taxableValue = parseFloat((courseFee / 1.18).toFixed(2));
    const gstAmount = parseFloat((courseFee - taxableValue).toFixed(2));
    const previouslyPaid = parseFloat(data.previouslyPaid) || 0;
    const amountPayingNow = parseFloat(data.amountPayingNow) || 0;
    const pendingBalance = Math.max(0, parseFloat((courseFee - previouslyPaid - amountPayingNow).toFixed(2)));

    let status = 'Pending';
    if (pendingBalance === 0 && (previouslyPaid + amountPayingNow) >= courseFee) {
      status = 'Paid';
    } else if ((previouslyPaid + amountPayingNow) > 0) {
      status = 'Partial';
    }

    let receiptNo = data.receiptNo;
    if (!receiptNo) {
      receiptNo = await generateReceiptNo(data.paidBranch || 'Salem ★');
    }

    const payload = {
      branchCode: data.branchCode || (data.paidBranch ? data.paidBranch.split(' ')[0] : 'Salem'),
      receiptNo,
      dateOfReceipt: data.dateOfReceipt || new Date().toISOString().split('T')[0],
      receiptCategory: data.receiptCategory || 'Course Fee',
      paymentType: data.paymentType || 'New Fee',
      studentName: data.studentName,
      cellNumber: data.cellNumber,
      email: data.email || '',
      address: data.address || '',
      paidBranch: data.paidBranch || 'Salem ★',
      course: data.course || 'AMCT Intermediate — ₹23,000 (3 Months)',
      modeOfTraining: data.modeOfTraining || 'Offline',
      leadGeneratedBy: data.leadGeneratedBy || '',
      leadBranch: data.leadBranch || data.paidBranch || '',
      courseFee,
      taxableValue,
      gstAmount,
      installmentPlan: data.installmentPlan || 'Full payment',
      installmentNumber: data.installmentNumber || 'Installment 1',
      amountPayingNow,
      previouslyPaid,
      pendingBalance,
      party: finalParty,
      account: data.account || 'Cash',
      status
    };

    const newRec = new Receipt(payload);
    const saved = await newRec.save();
    persistAllCollections().catch(console.error);
    res.status(201).json({ ...saved.toObject(), id: saved._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/receipts/bulk-import
app.post('/api/receipts/bulk-import', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided for import' });
    }

    const documentsToInsert = items.map(item => {
      const courseFee = parseFloat(item.courseFee) || 20000;
      const amountPayingNow = parseFloat(item.amountPayingNow) || courseFee;
      const taxableValue = parseFloat((courseFee / 1.18).toFixed(2));
      const gstAmount = parseFloat((courseFee - taxableValue).toFixed(2));
      
      return {
        branchCode: item.paidBranch ? item.paidBranch.split(' ')[0] : 'Salem',
        receiptNo: item.receiptNo || `TF/IMP/${Date.now()}/${Math.floor(Math.random() * 1000)}`,
        dateOfReceipt: item.dateOfReceipt || new Date().toISOString().split('T')[0],
        receiptCategory: item.receiptCategory || 'Course Fee',
        paymentType: item.paymentType || 'New Fee',
        studentName: item.studentName || 'Imported Student',
        cellNumber: item.cellNumber || '+91 99999 00000',
        email: item.email || '',
        address: item.address || '',
        paidBranch: item.paidBranch || 'Salem ★',
        course: item.course || 'AMCT Intermediate',
        modeOfTraining: item.modeOfTraining || 'Offline',
        leadGeneratedBy: item.leadGeneratedBy || 'Import',
        leadBranch: item.leadBranch || item.paidBranch || 'Salem ★',
        courseFee,
        taxableValue,
        gstAmount,
        installmentPlan: item.installmentPlan || 'Full payment',
        installmentNumber: 'Installment 1',
        amountPayingNow,
        previouslyPaid: 0,
        pendingBalance: Math.max(0, courseFee - amountPayingNow),
        party: item.account === 'IDFC Main' ? 'Management' : (item.party || 'Partner'),
        account: item.account || 'Cash',
        status: (courseFee - amountPayingNow) <= 0 ? 'Paid' : 'Partial'
      };
    });

    const inserted = await Receipt.insertMany(documentsToInsert);
    res.json({ message: `Successfully imported ${inserted.length} receipt records into MongoDB database.`, count: inserted.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/receipts/:id
app.delete('/api/receipts/:id', async (req, res) => {
  try {
    await Receipt.findByIdAndDelete(req.params.id);
    res.json({ message: 'Receipt deleted successfully from MongoDB database' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/receipts/:id
app.put('/api/receipts/:id', async (req, res) => {
  try {
    const data = req.body;
    const courseFee = parseFloat(data.courseFee) || 0;
    const amountPayingNow = parseFloat(data.amountPayingNow) || 0;
    const pendingBalance = Math.max(0, courseFee - amountPayingNow);
    const status = pendingBalance <= 0 ? 'Paid' : (amountPayingNow > 0 ? 'Partial' : 'Pending');

    let finalParty = data.party;
    if (data.account === 'IDFC Main') {
      finalParty = 'Management';
    }

    const payload = {
      ...data,
      courseFee,
      amountPayingNow,
      pendingBalance,
      status,
      party: finalParty
    };

    const updated = await Receipt.findByIdAndUpdate(req.params.id, payload, { new: true });
    res.json({ ...updated.toObject(), id: updated._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/vouchers/:id
app.put('/api/vouchers/:id', async (req, res) => {
  try {
    const data = req.body;
    let finalParty = data.party;
    if (data.account === 'IDFC Main') {
      finalParty = 'Management';
    }

    const total = parseFloat(data.amount) || 0;
    const base = data.hasGst ? parseFloat((total / 1.18).toFixed(2)) : total;
    const gst = parseFloat((total - base).toFixed(2));

    const payload = {
      ...data,
      amount: total,
      baseAmount: base,
      gstAmount: gst,
      party: finalParty
    };

    const updated = await Voucher.findByIdAndUpdate(req.params.id, payload, { new: true });
    res.json({ ...updated.toObject(), id: updated._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/receipts/delete-legacy
app.post('/api/receipts/delete-legacy', async (req, res) => {
  try {
    const result = await Receipt.deleteMany({ receiptNo: new RegExp('^LEGACY', 'i') });
    res.json({ message: `Deleted ${result.deletedCount} legacy imported receipt records.`, count: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/receipts/cleanup-duplicates
app.post('/api/receipts/cleanup-duplicates', async (req, res) => {
  try {
    const receipts = await Receipt.find({});
    const seen = new Set();
    const toDelete = [];

    for (const r of receipts) {
      if (seen.has(r.receiptNo)) {
        toDelete.push(r._id);
      } else {
        seen.add(r.receiptNo);
      }
    }

    if (toDelete.length > 0) {
      await Receipt.deleteMany({ _id: { $in: toDelete } });
    }

    res.json({ message: `Cleaned up ${toDelete.length} duplicate receipt records.`, count: toDelete.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vouchers
app.get('/api/vouchers', async (req, res) => {
  try {
    const { branch } = req.query;
    let q = {};
    const bReg = getBranchRegex(branch);
    if (bReg) {
      q.branchCode = bReg;
    }
    const vouchers = await Voucher.find(q).sort({ voucherDate: -1 });
    res.json(vouchers.map(v => ({ ...v.toObject(), id: v._id.toString() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vouchers
app.post('/api/vouchers', async (req, res) => {
  try {
    const data = req.body;
    let finalParty = data.party;
    if (data.account === 'IDFC Main') {
      finalParty = 'Management';
    }

    const total = parseFloat(data.amount) || 0;
    const base = data.hasGst ? parseFloat((total / 1.18).toFixed(2)) : total;
    const gst = parseFloat((total - base).toFixed(2));

    const branchPrefix = (data.branchCode && data.branchCode.includes('Kolhapur')) ? 'KP' : 'PN';
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const voucherNo = data.voucherNo || `VOUCH/${branchPrefix}/${new Date().getFullYear()}/${randomSeq}`;

    const payload = {
      branchCode: data.branchCode || 'Pune (FC Road) ★',
      voucherNo,
      voucherDate: data.voucherDate || new Date().toISOString().split('T')[0],
      category: data.category || 'Miscellaneous Expenses',
      title: data.title || `${data.category} - ${data.payeeVendor}`,
      payeeVendor: data.payeeVendor || '',
      invoiceRef: data.invoiceRef || '',
      amount: total,
      baseAmount: base,
      hasGst: !!data.hasGst,
      gstAmount: gst,
      party: finalParty || 'Partner',
      account: data.account || 'Cash',
      isCapitalAsset: !!data.isCapitalAsset,
      notes: data.notes || ''
    };

    const newVoucher = new Voucher(payload);
    const saved = await newVoucher.save();
    res.status(201).json({ ...saved.toObject(), id: saved._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/vouchers/:id
app.delete('/api/vouchers/:id', async (req, res) => {
  try {
    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Voucher deleted successfully from MongoDB database' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/daily-leads
app.get('/api/daily-leads', async (req, res) => {
  try {
    const { branch } = req.query;
    let q = {};
    const bReg = getBranchRegex(branch);
    if (bReg) {
      q.branchCode = bReg;
    }
    const leads = await DailyLead.find(q).sort({ date: -1, createdAt: -1 });
    res.json(leads.map(l => ({ ...l.toObject(), id: l._id.toString() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/daily-leads
app.post('/api/daily-leads', async (req, res) => {
  try {
    const data = req.body;
    const newLead = new DailyLead(data);
    const saved = await newLead.save();
    res.status(201).json({ ...saved.toObject(), id: saved._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/daily-leads/:id
app.delete('/api/daily-leads/:id', async (req, res) => {
  try {
    await DailyLead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Daily lead entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/daily-target
app.get('/api/daily-target', async (req, res) => {
  try {
    const { branch, month } = req.query;
    let q = {};
    const bReg = getBranchRegex(branch);
    if (bReg) {
      q.branchCode = bReg;
    }
    if (month) q.month = month;
    const target = await DailyTarget.findOne(q).sort({ createdAt: -1 });
    res.json(target ? { ...target.toObject(), id: target._id.toString() } : null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/daily-target
app.post('/api/daily-target', async (req, res) => {
  try {
    const { branchCode, month } = req.body;
    const updated = await DailyTarget.findOneAndUpdate(
      { branchCode, month },
      req.body,
      { new: true, upsert: true }
    );
    res.json({ ...updated.toObject(), id: updated._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/daily-target
app.delete('/api/daily-target', async (req, res) => {
  try {
    const { branch, month } = req.query;
    const bReg = getBranchRegex(branch);
    let q = { month };
    if (bReg) q.branchCode = bReg;
    await DailyTarget.deleteMany(q);
    res.json({ message: 'Target cleared for month' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/b2b
app.get('/api/b2b', async (req, res) => {
  try {
    const { branch } = req.query;
    let q = {};
    const bReg = getBranchRegex(branch);
    if (bReg) {
      q.branchCode = bReg;
    }
    const list = await B2BRevenue.find(q).sort({ contractDate: -1, createdAt: -1 });
    res.json(list.map(b => ({ ...b.toObject(), id: b._id.toString() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/b2b
app.post('/api/b2b', async (req, res) => {
  try {
    const item = new B2BRevenue(req.body);
    const saved = await item.save();
    res.status(201).json({ ...saved.toObject(), id: saved._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/b2b/:id
app.delete('/api/b2b/:id', async (req, res) => {
  try {
    await B2BRevenue.findByIdAndDelete(req.params.id);
    res.json({ message: 'B2B contract entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/b2b/:id
app.put('/api/b2b/:id', async (req, res) => {
  try {
    const updated = await B2BRevenue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ...updated.toObject(), id: updated._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/daily-leads/:id
app.put('/api/daily-leads/:id', async (req, res) => {
  try {
    const updated = await DailyLead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ...updated.toObject(), id: updated._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pending-fees
app.get('/api/pending-fees', async (req, res) => {
  try {
    const { branch } = req.query;
    let q = { pendingBalance: { $gt: 0 } };
    const bReg = getBranchRegex(branch);
    if (bReg) {
      q.$or = [{ paidBranch: bReg }, { branchCode: bReg }];
    }
    const receipts = await Receipt.find(q).sort({ pendingBalance: -1 });
    res.json(receipts.map(r => ({ ...r.toObject(), id: r._id.toString() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pl-statement
app.get('/api/pl-statement', async (req, res) => {
  try {
    const { branch } = req.query;
    let qReceipts = {};
    let qVouchers = {};

    const bReg = getBranchRegex(branch);
    if (bReg) {
      qReceipts.$or = [{ paidBranch: bReg }, { branchCode: bReg }];
      qVouchers.branchCode = bReg;
    }

    const receipts = await Receipt.find(qReceipts);
    const vouchers = await Voucher.find(qVouchers);
    const leads = await DailyLead.find({});

    const totalIncome = receipts.reduce((acc, r) => acc + (r.amountPayingNow || 0), 0);
    const totalExpenses = vouchers.reduce((acc, v) => acc + (v.amount || 0), 0);
    const netProfit = totalIncome - totalExpenses;

    // Monthly breakdown aggregation
    const monthlyMap = {};
    receipts.forEach(r => {
      const dateStr = r.dateOfReceipt || (r.createdAt ? r.createdAt.toISOString().split('T')[0] : '');
      const monthKey = dateStr ? dateStr.substring(0, 7) : 'Unspecified';
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, committed: 0, collected: 0, pending: 0, expenses: 0 };
      }
      monthlyMap[monthKey].committed += (r.courseFee || 0);
      monthlyMap[monthKey].collected += (r.amountPayingNow || 0);
      monthlyMap[monthKey].pending += (r.pendingBalance || 0);
    });

    vouchers.forEach(v => {
      const dateStr = v.voucherDate || (v.createdAt ? v.createdAt.toISOString().split('T')[0] : '');
      const monthKey = dateStr ? dateStr.substring(0, 7) : 'Unspecified';
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, committed: 0, collected: 0, pending: 0, expenses: 0 };
      }
      monthlyMap[monthKey].expenses += (v.amount || 0);
    });

    const monthlyBreakdown = Object.values(monthlyMap).map(m => ({
      ...m,
      netProfit: m.collected - m.expenses,
      grossProfit: m.committed - m.expenses
    })).sort((a, b) => b.month.localeCompare(a.month));

    // Category aggregations
    const expenseCategoriesMap = {};
    vouchers.forEach(v => {
      const cat = v.category || 'Miscellaneous';
      if (!expenseCategoriesMap[cat]) expenseCategoriesMap[cat] = { category: cat, total: 0, party: v.party || 'Partner', account: v.account || 'Cash' };
      expenseCategoriesMap[cat].total += (v.amount || 0);
    });

    const equityResult = calculateProfitDistribution(branch || 'Standard', netProfit);

    res.json({
      totalIncome,
      totalExpenses,
      netProfit,
      branchKey: equityResult.branchKey,
      distribution: equityResult.distribution,
      receiptsCount: receipts.length,
      vouchersCount: vouchers.length,
      monthlyBreakdown,
      expenseCategories: Object.values(expenseCategoriesMap)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payroll
app.get('/api/payroll', async (req, res) => {
  try {
    const { branch } = req.query;
    let q = {};
    if (branch && branch !== 'All' && branch !== 'All Branches (Global View)') {
      q.branchCode = new RegExp(branch.replace('★', '').trim(), 'i');
    }
    const list = await Employee.find(q);
    const formatted = list.map(e => {
      const obj = e.toObject();
      const gross = obj.grossSalary || 0;
      const basic = obj.basicSalary || Math.round(gross * 0.5);
      const hra = obj.hra || Math.round(basic * 0.5);
      const conv = obj.conveyance || (gross >= 20000 ? 1600 : Math.round(gross * 0.05));
      const special = obj.specialAllowance || Math.max(0, gross - (basic + hra + conv));
      const pf = obj.pfDeduction || obj.pfAmount || Math.min(1800, Math.round(basic * 0.12));
      const bonus = obj.defaultBonus || 0;
      const variable = obj.defaultVariable || 0;
      const recharge = obj.mobileRecharge || 0;
      const isRechargeReimbursed = (obj.rechargePaidBy || '').includes('Employee');
      const netPay = obj.netSalary || (gross + bonus + variable + (isRechargeReimbursed ? recharge : 0) - pf);

      let insLabel = 'None';
      let insAmount = obj.insuranceAmount || 0;
      if (obj.insuranceType === 'Aditya Birla') {
        insLabel = 'Aditya Birla - employer-paid';
        insAmount = 1470;
      } else if (obj.insuranceType === 'ESI' || (gross <= 21000 && obj.insuranceType !== 'None')) {
        insLabel = 'ESI - employer-paid';
        insAmount = Math.round(gross * 0.04);
      }

      const totalCost = netPay + pf + insAmount + (!isRechargeReimbursed ? recharge : 0);

      return {
        ...obj,
        id: obj._id.toString(),
        basicSalary: basic,
        hra,
        conveyance: conv,
        specialAllowance: special,
        pfDeduction: pf,
        pfAmount: pf,
        insuranceLabel: insLabel,
        insuranceAmount: insAmount,
        netSalary: netPay,
        totalCompanyCost: totalCost
      };
    });

    const activeList = formatted.filter(e => !e.status || e.status.includes('Active'));
    const grossTotal = activeList.reduce((acc, e) => acc + (e.grossSalary || 0), 0);
    const netTotal = activeList.reduce((acc, e) => acc + (e.netSalary || 0), 0);
    const pfTotal = activeList.reduce((acc, e) => acc + (e.pfDeduction || 0), 0);
    const statutoryTotal = activeList.reduce((acc, e) => acc + (e.pfDeduction * 2 + (e.insuranceAmount || 0)), 0);
    const totalMonthlyCost = activeList.reduce((acc, e) => acc + (e.totalCompanyCost || 0), 0);

    res.json({
      employees: formatted,
      summary: {
        activeEmployees: activeList.length,
        grossTotal,
        netTotal,
        pfTotal,
        statutoryTotal,
        totalMonthlyCost
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/employees
app.post('/api/employees', async (req, res) => {
  try {
    const data = req.body;
    const gross = parseFloat(data.grossSalary) || 0;
    const basic = data.basicSalary !== undefined ? parseFloat(data.basicSalary) : Math.round(gross * 0.5);
    const hra = data.hra !== undefined ? parseFloat(data.hra) : Math.round(basic * 0.5);
    const conv = data.conveyance !== undefined ? parseFloat(data.conveyance) : (gross >= 20000 ? 1600 : Math.round(gross * 0.05));
    const special = Math.max(0, gross - (basic + hra + conv));
    const pf = data.pfDeduction !== undefined ? parseFloat(data.pfDeduction) : Math.min(1800, Math.round(basic * 0.12));
    const bonus = parseFloat(data.defaultBonus) || 0;
    const variable = parseFloat(data.defaultVariable) || 0;
    const recharge = parseFloat(data.mobileRecharge) || 0;
    const isRechargeReimbursed = (data.rechargePaidBy || '').includes('Employee');
    const netPay = gross + bonus + variable + (isRechargeReimbursed ? recharge : 0) - pf;

    const payload = {
      ...data,
      grossSalary: gross,
      basicSalary: basic,
      hra,
      conveyance: conv,
      specialAllowance: special,
      pfDeduction: pf,
      pfAmount: pf,
      netSalary: netPay
    };

    const emp = new Employee(payload);
    const saved = await emp.save();
    res.status(201).json({ ...saved.toObject(), id: saved._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/employees/:id
app.delete('/api/employees/:id', async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/employees/:id
app.put('/api/employees/:id', async (req, res) => {
  try {
    const data = req.body;
    const gross = parseFloat(data.grossSalary) || 0;
    const basic = data.basicSalary !== undefined ? parseFloat(data.basicSalary) : Math.round(gross * 0.5);
    const hra = data.hra !== undefined ? parseFloat(data.hra) : Math.round(basic * 0.5);
    const conv = data.conveyance !== undefined ? parseFloat(data.conveyance) : (gross >= 20000 ? 1600 : Math.round(gross * 0.05));
    const special = Math.max(0, gross - (basic + hra + conv));
    const pf = data.pfDeduction !== undefined ? parseFloat(data.pfDeduction) : Math.min(1800, Math.round(basic * 0.12));
    const bonus = parseFloat(data.defaultBonus) || 0;
    const variable = parseFloat(data.defaultVariable) || 0;
    const recharge = parseFloat(data.mobileRecharge) || 0;
    const isRechargeReimbursed = (data.rechargePaidBy || '').includes('Employee');
    const netPay = gross + bonus + variable + (isRechargeReimbursed ? recharge : 0) - pf;

    const payload = {
      ...data,
      grossSalary: gross,
      basicSalary: basic,
      hra,
      conveyance: conv,
      specialAllowance: special,
      pfDeduction: pf,
      pfAmount: pf,
      netSalary: netPay
    };

    const updated = await Employee.findByIdAndUpdate(req.params.id, payload, { new: true });
    res.json({ ...updated.toObject(), id: updated._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payroll/run (Books vouchers into Vouchers collection for the month)
app.post('/api/payroll/run', async (req, res) => {
  try {
    const { branchCode, month, paymentDate, account, netSalaryTotal, statutoryTotal, staffWelfareTotal, rechargeTotal } = req.body;

    const branchPrefix = (branchCode && branchCode.includes('Kolhapur')) ? 'KP' : 'PN';
    const year = new Date().getFullYear();
    const createdVouchers = [];

    // 1. Salaries Voucher
    if (netSalaryTotal > 0) {
      const vSal = new Voucher({
        branchCode: branchCode || 'Pune (FC Road) ★',
        voucherNo: `VOUCH/${branchPrefix}/${year}/${Math.floor(1000 + Math.random() * 9000)}`,
        voucherDate: paymentDate || new Date().toISOString().split('T')[0],
        category: 'Salaries',
        title: `Payroll Salaries — ${month || 'Current Month'}`,
        payeeVendor: 'Employee Net Salaries',
        amount: netSalaryTotal,
        baseAmount: netSalaryTotal,
        hasGst: false,
        gstAmount: 0,
        party: account === 'IDFC Main' ? 'Management' : 'Partner',
        account: account || 'Cash',
        notes: `Monthly payroll run for ${month}`
      });
      const sSal = await vSal.save();
      createdVouchers.push(sSal);
    }

    // 2. Statutory Payments Voucher (100% Management)
    if (statutoryTotal > 0) {
      const vStat = new Voucher({
        branchCode: branchCode || 'Pune (FC Road) ★',
        voucherNo: `VOUCH/${branchPrefix}/${year}/${Math.floor(1000 + Math.random() * 9000)}`,
        voucherDate: paymentDate || new Date().toISOString().split('T')[0],
        category: 'Statutory Payments (PF, PT & ESI)',
        title: `Statutory PF & ESI — ${month || 'Current Month'}`,
        payeeVendor: 'PF & ESI Department',
        amount: statutoryTotal,
        baseAmount: statutoryTotal,
        hasGst: false,
        gstAmount: 0,
        party: 'Management',
        account: 'IDFC Main',
        notes: `100% Management-borne statutory PF & ESI for ${month}`
      });
      const sStat = await vStat.save();
      createdVouchers.push(sStat);
    }

    // 3. Staff Welfare (Aditya Birla Premium)
    if (staffWelfareTotal > 0) {
      const vWelf = new Voucher({
        branchCode: branchCode || 'Pune (FC Road) ★',
        voucherNo: `VOUCH/${branchPrefix}/${year}/${Math.floor(1000 + Math.random() * 9000)}`,
        voucherDate: paymentDate || new Date().toISOString().split('T')[0],
        category: 'Staff Welfare',
        title: `Aditya Birla Premium — ${month || 'Current Month'}`,
        payeeVendor: 'Aditya Birla Health Insurance',
        amount: staffWelfareTotal,
        baseAmount: staffWelfareTotal,
        hasGst: false,
        gstAmount: 0,
        party: 'Management',
        account: 'IDFC Main',
        notes: `Staff welfare insurance premium for ${month}`
      });
      const sWelf = await vWelf.save();
      createdVouchers.push(sWelf);
    }

    res.json({ message: `Successfully booked ${createdVouchers.length} payroll expense vouchers into database.`, count: createdVouchers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/balance-sheet
app.get('/api/balance-sheet', async (req, res) => {
  try {
    const { branch } = req.query;
    let q = {};
    if (branch && branch !== 'All' && branch !== 'All Branches (Global View)') {
      q.branchCode = new RegExp(branch.replace('★', '').trim(), 'i');
    }
    const sheets = await BalanceSheet.find(q).sort({ createdAt: -1 });
    res.json(sheets.map(s => ({ ...s.toObject(), id: s._id.toString() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/balance-sheet
app.post('/api/balance-sheet', async (req, res) => {
  try {
    const sheet = new BalanceSheet(req.body);
    const saved = await sheet.save();
    res.status(201).json({ ...saved.toObject(), id: saved._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/balance-sheet/:id
app.delete('/api/balance-sheet/:id', async (req, res) => {
  try {
    await BalanceSheet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Balance sheet snapshot deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/initial-investment
app.get('/api/initial-investment', async (req, res) => {
  try {
    const { branch } = req.query;
    let q = {};
    if (branch && branch !== 'All' && branch !== 'All Branches (Global View)') {
      q.branchCode = new RegExp(branch.replace('★', '').trim(), 'i');
    }
    const list = await InitialInvestment.find(q).sort({ date: -1, createdAt: -1 });
    res.json(list.map(i => ({ ...i.toObject(), id: i._id.toString() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/initial-investment
app.post('/api/initial-investment', async (req, res) => {
  try {
    const item = new InitialInvestment(req.body);
    const saved = await item.save();
    res.status(201).json({ ...saved.toObject(), id: saved._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/initial-investment/:id
app.delete('/api/initial-investment/:id', async (req, res) => {
  try {
    await InitialInvestment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Initial investment item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/partner-settlements
app.get('/api/partner-settlements', async (req, res) => {
  try {
    const list = await PartnerSettlement.find({}).sort({ createdAt: -1 });
    res.json(list.map(s => ({ ...s.toObject(), id: s._id.toString() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/partner-settlements
app.post('/api/partner-settlements', async (req, res) => {
  try {
    const data = req.body;
    const gross = parseFloat(data.grossRevenue) || 0;
    const exp = parseFloat(data.totalExpenses) || 0;
    const net = gross - exp;
    const partnerPercent = parseFloat(data.partnerSharePercent) || 50;
    const partnerShare = parseFloat((net * (partnerPercent / 100)).toFixed(2));
    const managementShare = net - partnerShare;

    const payload = {
      ...data,
      netProfitPool: net,
      partnerShareAmount: partnerShare,
      managementShareAmount: managementShare,
      finalSettlementAmount: partnerShare + (parseFloat(data.crossBranchIncentiveAdjustments) || 0)
    };

    const settlement = new PartnerSettlement(payload);
    const saved = await settlement.save();
    res.status(201).json({ ...saved.toObject(), id: saved._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/exam-fees
app.get('/api/exam-fees', async (req, res) => {
  try {
    const list = await ExamFee.find({}).sort({ createdAt: -1 });
    res.json(list.map(e => ({ ...e.toObject(), id: e._id.toString() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/exam-fees
app.post('/api/exam-fees', async (req, res) => {
  try {
    const exam = new ExamFee(req.body);
    const saved = await exam.save();
    res.status(201).json({ ...saved.toObject(), id: saved._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/treasury
app.get('/api/treasury', async (req, res) => {
  try {
    const list = await TreasuryTransaction.find({}).sort({ date: -1 });

    const receipts = await Receipt.find({});
    const vouchers = await Voucher.find({});

    const idfcInflow = receipts.filter(r => r.account === 'IDFC Main').reduce((a, r) => a + (r.amountPayingNow || 0), 0);
    const idfcOutflow = vouchers.filter(v => v.account === 'IDFC Main').reduce((a, v) => a + (v.amount || 0), 0);

    const nonIdfcInflow = receipts.filter(r => r.account === 'Non IDFC').reduce((a, r) => a + (r.amountPayingNow || 0), 0);
    const nonIdfcOutflow = vouchers.filter(v => v.account === 'Non IDFC').reduce((a, v) => a + (v.amount || 0), 0);

    const cashInflow = receipts.filter(r => r.account === 'Cash').reduce((a, r) => a + (r.amountPayingNow || 0), 0);
    const cashOutflow = vouchers.filter(v => v.account === 'Cash').reduce((a, v) => a + (v.amount || 0), 0);

    res.json({
      transactions: list.map(t => ({ ...t.toObject(), id: t._id.toString() })),
      balances: {
        idfcMainBalance: Math.max(0, idfcInflow - idfcOutflow),
        nonIdfcBalance: Math.max(0, nonIdfcInflow - nonIdfcOutflow),
        cashBalance: Math.max(0, cashInflow - cashOutflow)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/treasury
app.post('/api/treasury', async (req, res) => {
  try {
    const tx = new TreasuryTransaction(req.body);
    const saved = await tx.save();
    res.status(201).json({ ...saved.toObject(), id: saved._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/search — Unified ERP Global Search
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ receipts: [], vouchers: [], employees: [], b2b: [] });
    }

    const reg = new RegExp(q.trim(), 'i');

    const receipts = await Receipt.find({ $or: [{ studentName: reg }, { receiptNo: reg }, { course: reg }, { cellNumber: reg }] }).limit(10);
    const vouchers = await Voucher.find({ $or: [{ title: reg }, { payeeVendor: reg }, { category: reg }] }).limit(10);
    const employees = await Employee.find({ $or: [{ name: reg }, { designation: reg }] }).limit(10);
    const b2b = await B2BRevenue.find({ $or: [{ institutionName: reg }, { institutionType: reg }] }).limit(10);

    res.json({
      receipts: receipts.map(r => ({ ...r.toObject(), id: r._id.toString() })),
      vouchers: vouchers.map(v => ({ ...v.toObject(), id: v._id.toString() })),
      employees: employees.map(e => ({ ...e.toObject(), id: e._id.toString() })),
      b2b: b2b.map(b => ({ ...b.toObject(), id: b._id.toString() }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats
app.get('/api/stats', async (req, res) => {
  try {
    const { branch } = req.query;
    let q = {};
    const bReg = getBranchRegex(branch);
    if (bReg) {
      q.$or = [{ paidBranch: bReg }, { branchCode: bReg }];
    }

    const receipts = await Receipt.find(q);
    const vouchers = await Voucher.find(bReg ? { branchCode: bReg } : {});
    const leads = await DailyLead.find(bReg ? { branchCode: bReg } : {});

    const totalCollected = receipts.reduce((acc, r) => acc + (r.amountPayingNow || 0), 0);
    const totalExpenses = vouchers.reduce((acc, v) => acc + (v.amount || 0), 0);
    const netProfit = totalCollected - totalExpenses;
    const totalLeads = leads.reduce((acc, l) => acc + (l.totalInquiries || 0), 0);

    const pendingReceipts = receipts.filter(r => (r.pendingBalance || 0) > 0);
    const pendingFeesAmount = pendingReceipts.reduce((acc, r) => acc + (r.pendingBalance || 0), 0);
    const pendingFeesCount = pendingReceipts.length;

    const idfcInflow = receipts.filter(r => r.account === 'IDFC Main').reduce((a, r) => a + (r.amountPayingNow || 0), 0);
    const idfcOutflow = vouchers.filter(v => v.account === 'IDFC Main').reduce((a, v) => a + (v.amount || 0), 0);
    const idfcMainBalance = Math.max(0, idfcInflow - idfcOutflow);

    const cashInflow = receipts.filter(r => r.account === 'Cash').reduce((a, r) => a + (r.amountPayingNow || 0), 0);
    const cashOutflow = vouchers.filter(v => v.account === 'Cash').reduce((a, v) => a + (v.amount || 0), 0);
    const partnerCashBalance = Math.max(0, cashInflow - cashOutflow);

    const branchCounts = {};
    receipts.forEach(r => {
      const b = r.paidBranch || r.branchCode || 'Salem ★';
      branchCounts[b] = (branchCounts[b] || 0) + 1;
    });

    const leaderboard = Object.keys(branchCounts).map(b => ({
      branch: b,
      admissionsCount: branchCounts[b],
      revenue: receipts.filter(r => (r.paidBranch === b || r.branchCode === b)).reduce((acc, r) => acc + (r.amountPayingNow || 0), 0)
    })).sort((a, b) => b.admissionsCount - a.admissionsCount);

    res.json({
      totalCollected,
      totalExpenses,
      netProfit,
      totalLeads,
      leaderboard,
      idfcMainBalance,
      partnerCashBalance,
      pendingFeesAmount,
      pendingFeesCount,
      receiptsCount: receipts.length,
      vouchersCount: vouchers.length,
      databaseType: 'MongoDB'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/database/reset
app.post('/api/database/reset', async (req, res) => {
  try {
    const result = await resetDatabase();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const startServer = (portToTry) => {
  const server = app.listen(portToTry, () => {
    console.log(`Thoughtflows Franchise Portal MERN Server running on port ${portToTry}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[Port Busy] Port ${portToTry} is in use (or TIME_WAIT). Retrying on port ${portToTry + 1}...`);
      setTimeout(() => {
        startServer(portToTry + 1);
      }, 500);
    } else {
      console.error('Server startup error:', err);
    }
  });
};

startServer(PORT);
