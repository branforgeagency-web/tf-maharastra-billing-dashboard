import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import Branch from './models/Branch.js';
import Receipt from './models/Receipt.js';
import Voucher from './models/Voucher.js';
import DailyLead from './models/DailyLead.js';
import DailyTarget from './models/DailyTarget.js';
import B2BRevenue from './models/B2BRevenue.js';
import Employee from './models/Employee.js';
import BalanceSheet from './models/BalanceSheet.js';
import InitialInvestment from './models/InitialInvestment.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let mongoServer = null;

const COLLECTION_MODELS = {
  receipts: Receipt,
  vouchers: Voucher,
  daily_leads: DailyLead,
  daily_targets: DailyTarget,
  b2b_revenues: B2BRevenue,
  employees: Employee,
  balance_sheets: BalanceSheet,
  initial_investments: InitialInvestment
};

export const persistAllCollections = async () => {
  try {
    for (const [key, Model] of Object.entries(COLLECTION_MODELS)) {
      const records = await Model.find({});
      const filePath = path.join(DATA_DIR, `${key}.json`);
      fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('[Database Persistence] Error persisting collections to disk:', err.message);
  }
};

export const loadCollectionsFromDisk = async () => {
  try {
    for (const [key, Model] of Object.entries(COLLECTION_MODELS)) {
      const filePath = path.join(DATA_DIR, `${key}.json`);
      if (fs.existsSync(filePath)) {
        const count = await Model.countDocuments();
        if (count === 0) {
          const raw = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(raw);
          if (Array.isArray(data) && data.length > 0) {
            await Model.insertMany(data);
            console.log(`[Database Persistence] Restored ${data.length} records into ${key} from persistent disk store.`);
          }
        }
      }
    }
  } catch (err) {
    console.error('[Database Persistence] Error restoring collections from disk:', err.message);
  }
};

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (uri && !uri.includes('username:password')) {
    try {
      console.log(`[MongoDB] Connecting to MongoDB Atlas cloud cluster...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
      console.log(`[MongoDB] Connected successfully to MongoDB Atlas database "${mongoose.connection.name}" on host ${mongoose.connection.host}!`);
      await initializeSystemBranches();
      await loadCollectionsFromDisk();
      startAutoDiskSync();
      return;
    } catch (err) {
      console.error(`[MongoDB] MongoDB Atlas connection error: ${err.message}`);
    }
  }

  try {
    const localUri = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/thoughtflows_maharashtra';
    console.log(`[MongoDB] Attempting connection to local MongoDB service at ${localUri}...`);
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 1500 });
    console.log('[MongoDB] Connected to local MongoDB instance: thoughtflows_maharashtra');
    await initializeSystemBranches();
    await loadCollectionsFromDisk();
    startAutoDiskSync();
    return;
  } catch (localErr) {
    console.log('[MongoDB] Local MongoDB daemon not active.');
  }

  try {
    console.log('[MongoDB] Starting MongoMemoryServer database instance with persistent disk storage...');
    mongoServer = await MongoMemoryServer.create({
      instance: { dbName: 'thoughtflows_maharashtra' }
    });
    const memoryUri = mongoServer.getUri();
    console.log(`[MongoDB] MongoMemoryServer running at ${memoryUri}`);
    await mongoose.connect(memoryUri);
    console.log('[MongoDB] Mongoose connected to MongoDB database successfully!');
    await initializeSystemBranches();
    await loadCollectionsFromDisk();
    startAutoDiskSync();
  } catch (memErr) {
    console.error('[MongoDB] Failed to start MongoMemoryServer:', memErr.message);
  }
};

const startAutoDiskSync = () => {
  setInterval(async () => {
    await persistAllCollections();
  }, 3000);
};

export const resetDatabase = async () => {
  try {
    await Promise.all([
      Receipt.deleteMany({}),
      Voucher.deleteMany({}),
      DailyLead.deleteMany({}),
      DailyTarget.deleteMany({}),
      B2BRevenue.deleteMany({}),
      Employee.deleteMany({}),
      BalanceSheet.deleteMany({}),
      InitialInvestment.deleteMany({})
    ]);

    for (const key of Object.keys(COLLECTION_MODELS)) {
      const filePath = path.join(DATA_DIR, `${key}.json`);
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
      }
    }

    await initializeSystemBranches();
    console.log('[MongoDB Reset] Clean fresh database created!');
    return { success: true, message: 'Database reset successfully. Fresh start created!' };
  } catch (err) {
    console.error('[MongoDB Reset] Error resetting database:', err.message);
    throw err;
  }
};

const initializeSystemBranches = async () => {
  try {
    const existingBranchesCount = await Branch.countDocuments();
    if (existingBranchesCount === 0) {
      await Branch.insertMany(systemBranches);
      console.log('[MongoDB] System branches initialized for Pune & Kolhapur.');
    } else {
      console.log(`[MongoDB] Database active with ${existingBranchesCount} registered branches.`);
    }
  } catch (err) {
    console.error('[MongoDB] Error initializing system branches:', err.message);
  }
};

const systemBranches = [
  { 
    code: 'Pune', 
    name: 'Pune (FC Road) ★', 
    region: 'Maharashtra', 
    isFeatured: true, 
    equityStakeholders: { "Pune College": 50, "Thoughtflows": 25, "Career Vidhyalaya": 20, "Nilanjan": 5 } 
  },
  { 
    code: 'Kolhapur', 
    name: 'Kolhapur (Tarabai Park) ★', 
    region: 'Maharashtra', 
    isFeatured: true, 
    equityStakeholders: { "Genesis College": 50, "Thoughtflows": 25, "Career Vidhyalaya": 25 } 
  },
  { 
    code: 'All', 
    name: 'All Maharashtra Branches (Pune & Kolhapur)', 
    region: 'Maharashtra Consolidated', 
    isFeatured: true, 
    equityStakeholders: { "Partner Colleges": 50, "Thoughtflows": 25, "Career Vidhyalaya": 20, "Nilanjan": 5 } 
  }
];
