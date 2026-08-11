import mongoose from 'mongoose';

const ExamFeeSchema = new mongoose.Schema({
  branchCode: { type: String, required: true },
  receiptNo: { type: String, required: true },
  studentName: { type: String, required: true },
  certificationBody: { type: String, enum: ['AAPC', 'AHIMA', 'CPC Exam', 'CIC Exam', 'CCS Exam', 'Other'], default: 'AAPC' },
  collectedAmount: { type: Number, required: true },
  bodyPayableAmount: { type: Number, required: true },
  franchiseFeeShare: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Collected', 'Remitted to Body', 'Certificate Issued'], default: 'Collected' },
  remittanceDate: { type: String },
  remarks: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('ExamFee', ExamFeeSchema);
