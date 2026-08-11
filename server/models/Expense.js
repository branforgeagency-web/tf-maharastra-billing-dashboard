import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  branch_code: { type: String, required: true },
  expense_date: { type: String, required: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  party: {
    type: String,
    enum: ['Partner', 'Management'],
    required: true
  },
  account_type: {
    type: String,
    enum: ['IDFC Main', 'Non IDFC', 'Cash'],
    required: true
  },
  vendor: { type: String, default: '' },
  notes: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
