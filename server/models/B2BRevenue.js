import mongoose from 'mongoose';

const b2bRevenueSchema = new mongoose.Schema({
  branchCode: { type: String, required: true },
  receiptNo: { type: String, default: '' },
  dateOfReceipt: { type: String, required: true },
  receiptCategory: { type: String, default: 'College Revenue' },
  institutionType: { type: String, enum: ['College', 'Company'], required: true },
  institutionName: { type: String, required: true },
  location: { type: String, default: '' },
  mobileNumber: { type: String, default: '' },
  headName: { type: String, default: '' },
  candidatesTrained: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  paidBranch: { type: String, default: 'Pune (FC Road) ★' },
  leadGeneratedBy: { type: String, default: '' },
  leadBranch: { type: String, default: 'Pune (FC Road) ★' },
  baseAmount: { type: Number, default: 0 },
  gstRate: { type: String, default: '18%' },
  gstAmount: { type: Number, default: 0 },
  tdsRate: { type: String, default: '2%' },
  tdsAmount: { type: Number, default: 0 },
  netAmountReceived: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, default: 0 },
  isSez: { type: Boolean, default: false },
  party: { type: String, enum: ['Partner', 'Management'], default: 'Partner' },
  account: { type: String, enum: ['IDFC Main', 'Non IDFC', 'Cash'], default: 'Cash' },
  contractDate: { type: String, default: '' }
}, {
  timestamps: true
});

const B2BRevenue = mongoose.model('B2BRevenue', b2bRevenueSchema);
export default B2BRevenue;
