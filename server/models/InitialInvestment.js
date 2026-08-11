import mongoose from 'mongoose';

const initialInvestmentSchema = new mongoose.Schema({
  branchCode: { type: String, required: true, default: 'Pune' },
  description: { type: String, required: true },
  category: { type: String, default: 'Premises Setup' },
  vendor: { type: String, default: '' },
  date: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 }
}, {
  timestamps: true
});

const InitialInvestment = mongoose.model('InitialInvestment', initialInvestmentSchema);
export default InitialInvestment;
