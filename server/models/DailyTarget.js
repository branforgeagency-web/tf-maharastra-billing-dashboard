import mongoose from 'mongoose';

const dailyTargetSchema = new mongoose.Schema({
  branchCode: { type: String, required: true },
  month: { type: String, required: true }, // e.g. '2026-08'
  targetLeads: { type: Number, default: 100 },
  targetAdmissions: { type: Number, default: 20 },
  targetDemos: { type: Number, default: 30 },
  targetRevenue: { type: Number, default: 50000 },
  targetPosts: { type: Number, default: 60 },
  targetReviews: { type: Number, default: 30 },
  targetWorkshops: { type: Number, default: 5 },
  targetColleges: { type: Number, default: 10 },
  targetMous: { type: Number, default: 2 },
  targetCorporateContacts: { type: Number, default: 5 },
  platformPosts: {
    instagram: { type: Number, default: 10 },
    facebook: { type: Number, default: 10 },
    linkedin: { type: Number, default: 10 },
    youtube: { type: Number, default: 10 },
    twitter: { type: Number, default: 10 },
    threads: { type: Number, default: 10 }
  }
}, {
  timestamps: true
});

const DailyTarget = mongoose.model('DailyTarget', dailyTargetSchema);
export default DailyTarget;
