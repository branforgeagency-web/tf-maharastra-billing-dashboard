import mongoose from 'mongoose';

const dailyLeadSchema = new mongoose.Schema({
  branchCode: { type: String, required: true, default: 'Salem' },
  date: { type: String, required: true },
  
  // Leads by source
  walkIns: { type: Number, default: 0 },
  phoneCalls: { type: Number, default: 0 },
  websiteLeads: { type: Number, default: 0 },
  socialMediaLeads: { type: Number, default: 0 },
  referrals: { type: Number, default: 0 },
  collegeVisits: { type: Number, default: 0 },
  workshops: { type: Number, default: 0 },
  otherLeads: { type: Number, default: 0 },
  totalInquiries: { type: Number, default: 0 },

  // Conversions & activities
  admissions: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  demosConducted: { type: Number, default: 0 },
  workshopsConducted: { type: Number, default: 0 },
  collegesVisitedCount: { type: Number, default: 0 },
  mousSigned: { type: Number, default: 0 },
  newCompanyContacts: { type: Number, default: 0 },
  corporateTrainingsDelivered: { type: Number, default: 0 },
  trainingRevenueToday: { type: Number, default: 0 },
  studentsTrainedToday: { type: Number, default: 0 },
  notes: { type: String, default: '' },

  // Social Media Activity Today
  socialPosts: {
    instagram: { type: Number, default: 0 },
    facebook: { type: Number, default: 0 },
    linkedin: { type: Number, default: 0 },
    youtube: { type: Number, default: 0 },
    twitter: { type: Number, default: 0 },
    threads: { type: Number, default: 0 }
  },
  socialReviews: {
    google: { type: Number, default: 0 },
    justdial: { type: Number, default: 0 }
  },
  socialFollowers: {
    instagram: { type: Number, default: 0 },
    facebook: { type: Number, default: 0 },
    linkedin: { type: Number, default: 0 },
    youtube: { type: Number, default: 0 },
    twitter: { type: Number, default: 0 },
    threads: { type: Number, default: 0 }
  },
  socialReviewsCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

const DailyLead = mongoose.model('DailyLead', dailyLeadSchema);
export default DailyLead;
