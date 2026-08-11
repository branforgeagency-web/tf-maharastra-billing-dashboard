import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema({
  branchCode: { type: String, required: true },
  voucherNo: { type: String, default: '' },
  voucherDate: { type: String, required: true },
  category: { type: String, required: true },
  title: { type: String, default: '' },
  payeeVendor: { type: String, default: '' },
  invoiceRef: { type: String, default: '' },
  notes: { type: String, default: '' },
  amount: { type: Number, required: true },
  hasGst: { type: Boolean, default: false },
  baseAmount: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  party: {
    type: String,
    enum: ['Partner', 'Management'],
    required: true
  },
  account: {
    type: String,
    enum: ['IDFC Main', 'Non IDFC', 'Cash'],
    required: true
  },
  isCapitalAsset: { type: Boolean, default: false }
}, {
  timestamps: true
});

const Voucher = mongoose.model('Voucher', voucherSchema);
export default Voucher;
