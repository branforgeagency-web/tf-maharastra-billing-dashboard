import mongoose from 'mongoose';

const TreasuryTransactionSchema = new mongoose.Schema({
  branchCode: { type: String, required: true },
  transactionType: { type: String, enum: ['Deposit', 'Withdrawal', 'Transfer', 'Opening Balance'], required: true },
  fromAccount: { type: String, enum: ['IDFC Main', 'Non IDFC', 'Cash', 'External Vault'], required: true },
  toAccount: { type: String, enum: ['IDFC Main', 'Non IDFC', 'Cash', 'Vendor', 'HQ'], required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  referenceNo: { type: String, default: '' },
  performedBy: { type: String, default: 'Admin' },
  description: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('TreasuryTransaction', TreasuryTransactionSchema);
