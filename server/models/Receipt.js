import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema({
  branchCode: { type: String, required: true },
  receiptNo: { type: String, required: true, unique: true },
  dateOfReceipt: { type: String, required: true },
  receiptCategory: {
    type: String,
    enum: ['Course Fee', 'Exam Fee', 'Book Fee', 'Courier Fee', 'College Revenue', 'Company Revenue'],
    required: true
  },
  paymentType: {
    type: String,
    enum: ['New Fee', 'Pending Fee'],
    required: true
  },
  studentName: { type: String, required: true },
  cellNumber: { type: String, required: true },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  paidBranch: { type: String, required: true },
  course: { type: String, required: true },
  modeOfTraining: {
    type: String,
    enum: ['Online', 'Offline'],
    required: true
  },
  leadGeneratedBy: { type: String, default: '' },
  leadBranch: { type: String, default: '' },
  courseFee: { type: Number, required: true },
  taxableValue: { type: Number, required: true },
  gstAmount: { type: Number, required: true },
  installmentPlan: { type: String, default: 'Full payment' },
  installmentNumber: { type: String, default: 'Installment 1' },
  amountPayingNow: { type: Number, required: true },
  previouslyPaid: { type: Number, default: 0 },
  pendingBalance: { type: Number, default: 0 },
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
  status: {
    type: String,
    enum: ['Paid', 'Partial', 'Pending'],
    required: true
  }
}, {
  timestamps: true
});

const Receipt = mongoose.model('Receipt', receiptSchema);
export default Receipt;
