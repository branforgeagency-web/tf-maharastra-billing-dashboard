import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  region: { type: String, required: true },
  isFeatured: { type: Boolean, default: false },
  // Equity stakeholders map (Percentage share out of 100%)
  equityStakeholders: {
    type: Map,
    of: Number,
    default: { "Partner": 50, "Management": 50 }
  }
}, {
  timestamps: true
});

const Branch = mongoose.model('Branch', branchSchema);
export default Branch;
