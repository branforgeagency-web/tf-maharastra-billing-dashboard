import mongoose from 'mongoose';

const balanceSheetSchema = new mongoose.Schema({
  branchCode: { type: String, required: true },
  quarter: { type: String, required: true }, // e.g. 'Q1 (Apr-Jun)', 'Q2 (Jul-Sep)', 'Q3 (Oct-Dec)', 'Q4 (Jan-Mar)'
  fyYear: { type: String, required: true }, // e.g. 'FY 2026-27'
  assets: {
    cashInHand: { type: Number, default: 0 },
    idfcMainBank: { type: Number, default: 0 },
    nonIdfcBank: { type: Number, default: 0 },
    accountsReceivable: { type: Number, default: 0 }, // Pending fees
    capitalAssets: { type: Number, default: 0 }
  },
  liabilities: {
    accountsPayable: { type: Number, default: 0 },
    gstPayable: { type: Number, default: 0 },
    tdsPayable: { type: Number, default: 0 },
    statutoryPfEsi: { type: Number, default: 0 }
  },
  netWorth: { type: Number, default: 0 }
}, {
  timestamps: true
});

const BalanceSheet = mongoose.model('BalanceSheet', balanceSheetSchema);
export default BalanceSheet;
