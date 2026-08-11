import mongoose from 'mongoose';

const PartnerSettlementSchema = new mongoose.Schema({
  branchCode: { type: String, required: true },
  periodMonth: { type: String, required: true }, // e.g. "August 2026"
  grossRevenue: { type: Number, default: 0 },
  totalExpenses: { type: Number, default: 0 },
  netProfitPool: { type: Number, default: 0 },
  partnerSharePercent: { type: Number, default: 50 },
  partnerShareAmount: { type: Number, default: 0 },
  managementShareAmount: { type: Number, default: 0 },
  crossBranchIncentiveAdjustments: { type: Number, default: 0 },
  finalSettlementAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['Draft', 'Calculated', 'Approved', 'Settled'], default: 'Calculated' },
  settlementDate: { type: String },
  notes: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('PartnerSettlement', PartnerSettlementSchema);
