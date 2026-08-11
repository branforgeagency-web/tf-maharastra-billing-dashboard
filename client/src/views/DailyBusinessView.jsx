import React, { useState, useEffect } from 'react';
import { Target, Calendar, Plus, Trash2, CheckCircle2, X, Save, Edit3, Award, MessageSquare, Heart } from 'lucide-react';
import SetMonthlyTargetModal from '../components/SetMonthlyTargetModal';

export default function DailyBusinessView({ selectedBranch, setSelectedBranch }) {
  const [leads, setLeads] = useState([]);
  const [target, setTarget] = useState(null);
  const [timeframe, setTimeframe] = useState('Day'); // 'Day' | 'Week' | 'Month'
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState(null);

  // Form State matching screenshot exact layout
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    
    // Leads by source
    walkIns: 0,
    phoneCalls: 0,
    websiteLeads: 0,
    socialMediaLeads: 0,
    referrals: 0,
    collegeVisits: 0,
    workshops: 0,
    otherLeads: 0,

    // Conversions & Activities
    admissions: 0,
    demosConducted: 0,
    workshopsConducted: 0,
    collegesVisitedCount: 0,
    mousSigned: 0,
    newCompanyContacts: 0,
    corporateTrainingsDelivered: 0,
    trainingRevenueToday: 0,
    studentsTrainedToday: 0,
    notes: '',

    // Social Media Activity Today
    socialPosts: { instagram: 0, facebook: 0, linkedin: 0, youtube: 0, twitter: 0, threads: 0 },
    socialReviews: { google: 0, justdial: 0 },
    socialFollowers: { instagram: 0, facebook: 0, linkedin: 0, youtube: 0, twitter: 0, threads: 0 }
  });

  // Monthly Target Modal Form State
  const [targetForm, setTargetForm] = useState({
    targetAdmissions: 50,
    targetLeads: 200,
    targetRevenue: 1000000
  });

  useEffect(() => {
    fetchDailyLeads();
    fetchDailyTarget();
  }, [selectedBranch]);

  const fetchDailyLeads = () => {
    const params = new URLSearchParams();
    if (selectedBranch) params.append('branch', selectedBranch);

    fetch(`/api/daily-leads?${params.toString()}`)
      .then(res => res.json())
      .then(data => setLeads(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  const fetchDailyTarget = () => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const params = new URLSearchParams();
    if (selectedBranch) params.append('branch', selectedBranch);
    params.append('month', currentMonth);

    fetch(`/api/daily-target?${params.toString()}`)
      .then(res => res.json())
      .then(data => setTarget(data))
      .catch(err => console.error(err));
  };

  const handleSubmitDailyEntry = async (e) => {
    e.preventDefault();

    const totalInquiries = 
      (Number(formData.walkIns) || 0) +
      (Number(formData.phoneCalls) || 0) +
      (Number(formData.websiteLeads) || 0) +
      (Number(formData.socialMediaLeads) || 0) +
      (Number(formData.referrals) || 0) +
      (Number(formData.collegeVisits) || 0) +
      (Number(formData.workshops) || 0) +
      (Number(formData.otherLeads) || 0);

    const conversionsCount = Number(formData.admissions) || 0;

    const payload = {
      ...formData,
      branchCode: selectedBranch || 'Salem',
      totalInquiries,
      conversions: conversionsCount
    };

    try {
      const url = editingLeadId ? `/api/daily-leads/${editingLeadId}` : '/api/daily-leads';
      const method = editingLeadId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        fetchDailyLeads();
        setEditingLeadId(null);
        // Reset counts to 0 except date
        setFormData({
          date: new Date().toISOString().split('T')[0],
          walkIns: 0, phoneCalls: 0, websiteLeads: 0, socialMediaLeads: 0,
          referrals: 0, collegeVisits: 0, workshops: 0, otherLeads: 0,
          admissions: 0, demosConducted: 0, workshopsConducted: 0, collegesVisitedCount: 0,
          mousSigned: 0, newCompanyContacts: 0, corporateTrainingsDelivered: 0,
          trainingRevenueToday: 0, studentsTrainedToday: 0, notes: '',
          socialPosts: { instagram: 0, facebook: 0, linkedin: 0, youtube: 0, twitter: 0, threads: 0 },
          socialReviews: { google: 0, justdial: 0 },
          socialFollowers: { instagram: 0, facebook: 0, linkedin: 0, youtube: 0, twitter: 0, threads: 0 }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTarget = async (e) => {
    e.preventDefault();
    const currentMonth = new Date().toISOString().substring(0, 7);

    try {
      const res = await fetch('/api/daily-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchCode: selectedBranch || 'Salem',
          month: currentMonth,
          targetAdmissions: Number(targetForm.targetAdmissions) || 50,
          targetLeads: Number(targetForm.targetLeads) || 200,
          targetRevenue: Number(targetForm.targetRevenue) || 1000000
        })
      });

      if (res.ok) {
        const saved = await res.json();
        setTarget(saved);
        setIsTargetModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Delete daily entry?')) return;
    try {
      await fetch(`/api/daily-leads/${id}`, { method: 'DELETE' });
      fetchDailyLeads();
    } catch (err) {
      console.error(err);
    }
  };

  // Computations for Social Totals
  const totalPostsToday = Object.values(formData.socialPosts).reduce((a, b) => a + (Number(b) || 0), 0);
  const totalReviewsToday = Object.values(formData.socialReviews).reduce((a, b) => a + (Number(b) || 0), 0);
  const totalFollowersToday = Object.values(formData.socialFollowers).reduce((a, b) => a + (Number(b) || 0), 0);

  // Month Progress Calculations
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysLeft = daysInMonth - currentDay;

  const achievedAdmissions = leads.reduce((acc, l) => acc + (Number(l.admissions || l.conversions) || 0), 0);
  const targetAdmissions = target?.targetAdmissions || 0;
  const progressPercent = targetAdmissions > 0 ? Math.min(100, Math.round((achievedAdmissions / targetAdmissions) * 100)) : 0;

  const branchCode = selectedBranch?.includes('Kolhapur') ? 'KP' : selectedBranch?.includes('Pune') ? 'PN' : 'SL';
  const branchDisplayName = selectedBranch ? selectedBranch.replace('★', '').trim() : 'Salem';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Branch Banner Card */}
      <div style={{ background: 'var(--bg-card)', padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--border-color)', borderLeft: '4px solid #0d9488', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(13, 148, 136, 0.12)', color: '#0d9488', fontWeight: '900', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(13, 148, 136, 0.3)' }}>
            {branchCode}
          </div>
          <div>
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', letterSpacing: '0.5px' }}>DAILY BUSINESS FOR</span>
            <h2 style={{ fontSize: '16px', fontWeight: '800', margin: '2px 0', color: 'var(--text-white)' }}>{branchDisplayName}</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: 0 }}>
              50-50 franchise partnership
            </p>
          </div>
        </div>

        {setSelectedBranch && (
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            style={{ padding: '8px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontWeight: '700', fontSize: '13px', outline: 'none', cursor: 'pointer', minWidth: '180px' }}
          >
            <option value="Pune (FC Road) ★">Pune (FC Road) ★</option>
            <option value="Kolhapur (Tarabai Park) ★">Kolhapur (Tarabai Park) ★</option>
            <option value="All Branches (Global View)">All Branches (Global View)</option>
          </select>
        )}
      </div>

      {/* MONTHLY TARGET & ACHIEVEMENT Card (Yellow/Gold Bordered Card) */}
      <div style={{ background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.15), var(--bg-card))', border: '1px dashed rgba(245, 158, 11, 0.5)', padding: '20px', borderRadius: '18px', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#d97706', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target className="w-5 h-5 text-amber-500" />
              MONTHLY TARGET & ACHIEVEMENT
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', marginTop: '2px', display: 'block' }}>
              {now.toLocaleString('default', { month: 'long' })} {now.getFullYear()} · {currentDay} of {daysInMonth} days elapsed · {daysLeft} days left
            </span>
          </div>

          <button onClick={() => setIsTargetModalOpen(true)} className="action-btn" style={{ background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', fontWeight: '700', padding: '6px 14px', fontSize: '12px', borderRadius: '10px' }}>
            <Edit3 className="w-4 h-4 text-amber-600" />
            <span>Set monthly target</span>
          </button>
        </div>

        {/* Target Content Area */}
        {!target ? (
          <div style={{ background: 'rgba(251, 191, 36, 0.05)', border: '1px dashed rgba(245, 158, 11, 0.3)', borderRadius: '14px', padding: '32px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target className="w-6 h-6" />
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-white)', margin: 0 }}>
              No target set for this month yet
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: 0, maxWidth: '580px', lineHeight: '1.6' }}>
              Click "Set monthly target" above to define how many leads, admissions, demos and training revenue you're aiming for in {now.toLocaleString('default', { month: 'long' })} {now.getFullYear()}. Progress will then update live as you enter daily entries.
            </p>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)' }}>
                Admissions Goal: {achievedAdmissions} / {targetAdmissions} Achieved
              </span>
              <span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>
                {progressPercent}%
              </span>
            </div>

            <div style={{ width: '100%', height: '10px', background: 'var(--bg-card)', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #10b981)', transition: 'width 0.5s ease' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Timeframe Selector Bar */}
      <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          {['Day', 'Week', 'Month'].map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`action-btn ${timeframe === t ? 'action-btn-wa' : ''}`}
              style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '700' }}
            >
              {t}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '12px', color: 'var(--text-slate-400)' }}>Enter today's leads and conversions</span>
      </div>

      {/* Form Card: Today's Business Entry */}
      <form onSubmit={handleSubmitDailyEntry} className="dashboard-panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div className="panel-title-bar">
          <h3 className="panel-heading" style={{ color: '#fff' }}>
            <Calendar className="w-5 h-5 text-teal-400" />
            Today's business entry
          </h3>
        </div>

        {/* Entry Date Row */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', display: 'block', marginBottom: '6px' }}>
            ENTRY DATE
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={{ width: '220px', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
            />
            <span style={{ fontSize: '11.5px', color: 'var(--text-slate-400)' }}>
              Enter daily counts. Leave 0 for items with no activity.
            </span>
          </div>
        </div>

        {/* Section: LEADS BY SOURCE */}
        <div>
          <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#0d9488', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
            LEADS BY SOURCE · HOW DID EACH LEAD COME IN?
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { key: 'walkIns', label: 'WALK-IN' },
              { key: 'phoneCalls', label: 'PHONE CALL' },
              { key: 'websiteLeads', label: 'WEBSITE' },
              { key: 'socialMediaLeads', label: 'SOCIAL MEDIA' },
              { key: 'referrals', label: 'REFERRAL' },
              { key: 'collegeVisits', label: 'COLLEGE VISIT' },
              { key: 'workshops', label: 'WORKSHOP' },
              { key: 'otherLeads', label: 'OTHER' }
            ].map(item => (
              <div key={item.key} style={{ background: 'rgba(13, 148, 136, 0.05)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(13, 148, 136, 0.2)' }}>
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#0d9488', display: 'block', marginBottom: '4px' }}>{item.label}</label>
                <input
                  type="number"
                  min="0"
                  value={formData[item.key]}
                  onChange={(e) => setFormData({ ...formData, [item.key]: Number(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '6px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '14px', fontWeight: 'bold', outline: 'none' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section: CONVERSIONS & ACTIVITIES */}
        <div>
          <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
            CONVERSIONS & ACTIVITIES
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
            {[
              { key: 'admissions', label: 'ADMISSIONS' },
              { key: 'demosConducted', label: 'DEMOS CONDUCTED' },
              { key: 'workshopsConducted', label: 'WORKSHOPS CONDUCTED' },
              { key: 'collegesVisitedCount', label: 'COLLEGES VISITED' },
              { key: 'mousSigned', label: 'MOUS SIGNED TODAY' },
              { key: 'newCompanyContacts', label: 'NEW COMPANY CONTACTS' },
              { key: 'corporateTrainingsDelivered', label: 'CORPORATE TRAININGS DELIVERED' },
              { key: 'trainingRevenueToday', label: 'TRAINING REVENUE TODAY (₹)' },
              { key: 'studentsTrainedToday', label: 'STUDENTS TRAINED TODAY (CORPORATE)' },
            ].map(item => (
              <div key={item.key} style={{ background: 'var(--bg-input)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>{item.label}</label>
                <input
                  type="number"
                  min="0"
                  value={formData[item.key]}
                  onChange={(e) => setFormData({ ...formData, [item.key]: Number(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '6px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '14px', fontWeight: 'bold', outline: 'none' }}
                />
              </div>
            ))}
          </div>

          <div>
            <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>NOTES / HIGHLIGHTS</label>
            <input
              type="text"
              placeholder="Visited XYZ college, signed MOU..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
            />
          </div>
        </div>

        {/* Section: SOCIAL MEDIA ACTIVITY TODAY (Purple Border Card) */}
        <div style={{ background: 'rgba(124, 58, 237, 0.04)', border: '1px solid rgba(124, 58, 237, 0.25)', padding: '18px', borderRadius: '16px' }}>
          
          <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#a855f7', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              📱 SOCIAL MEDIA ACTIVITY TODAY
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--text-slate-400)' }}>Posts published & reviews received</span>
          </div>

          {/* 1. POSTS PUBLISHED */}
          <div style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#a855f7', display: 'block', marginBottom: '8px' }}>
              POSTS PUBLISHED — BY PLATFORM
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '8px' }}>
              {['instagram', 'facebook', 'linkedin', 'youtube', 'twitter', 'threads'].map(p => (
                <div key={p} style={{ background: 'var(--bg-input)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label style={{ fontSize: '9px', fontWeight: '800', color: '#a855f7', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>{p}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.socialPosts[p]}
                    onChange={(e) => setFormData({ ...formData, socialPosts: { ...formData.socialPosts, [p]: Number(e.target.value) || 0 } })}
                    style={{ width: '100%', padding: '4px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(124, 58, 237, 0.1)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyBetween: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-slate-400)' }}>Total posts today</span>
              <strong style={{ color: '#a855f7', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>{totalPostsToday}</strong>
            </div>
          </div>

          {/* 2. REVIEWS RECEIVED */}
          <div style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#a855f7', display: 'block', marginBottom: '8px' }}>
              REVIEWS RECEIVED — BY PLATFORM
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <label style={{ fontSize: '9.5px', fontWeight: '800', color: '#f59e0b', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>⭐ GOOGLE MY BUSINESS</label>
                <input
                  type="number"
                  min="0"
                  value={formData.socialReviews.google}
                  onChange={(e) => setFormData({ ...formData, socialReviews: { ...formData.socialReviews, google: Number(e.target.value) || 0 } })}
                  style={{ width: '100%', padding: '4px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <label style={{ fontSize: '9.5px', fontWeight: '800', color: '#38bdf8', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>📞 JUSTDIAL</label>
                <input
                  type="number"
                  min="0"
                  value={formData.socialReviews.justdial}
                  onChange={(e) => setFormData({ ...formData, socialReviews: { ...formData.socialReviews, justdial: Number(e.target.value) || 0 } })}
                  style={{ width: '100%', padding: '4px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
              </div>
            </div>

            <div style={{ background: 'rgba(124, 58, 237, 0.1)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyBetween: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-slate-400)' }}>Total reviews today</span>
              <strong style={{ color: '#a855f7', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>{totalReviewsToday}</strong>
            </div>
          </div>

          {/* 3. FOLLOWERS GAINED */}
          <div>
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#a855f7', display: 'block', marginBottom: '8px' }}>
              FOLLOWERS / SUBSCRIBERS GAINED TODAY — BY PLATFORM (net new, optional)
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '8px' }}>
              {['instagram', 'facebook', 'linkedin', 'youtube', 'twitter', 'threads'].map(p => (
                <div key={p} style={{ background: 'var(--bg-input)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label style={{ fontSize: '9px', fontWeight: '800', color: '#a855f7', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>{p}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.socialFollowers[p]}
                    onChange={(e) => setFormData({ ...formData, socialFollowers: { ...formData.socialFollowers, [p]: Number(e.target.value) || 0 } })}
                    style={{ width: '100%', padding: '4px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(124, 58, 237, 0.1)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyBetween: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-slate-400)' }}>Total follower gain today</span>
              <strong style={{ color: '#a855f7', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>{totalFollowersToday}</strong>
            </div>
          </div>

        </div>

        {/* Submit Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button type="submit" className="btn-primary-green" style={{ background: '#0d9488', padding: '10px 24px', fontSize: '14px', borderRadius: '10px' }}>
            <Save className="w-4 h-4" />
            <span>Save daily entry</span>
          </button>
        </div>

      </form>

      {/* Recent Daily Entries Card (Bottom) */}
      <div className="dashboard-panel-card">
        <div className="panel-title-bar">
          <h3 className="panel-heading" style={{ color: '#fff' }}>
            📋 Recent daily entries
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-slate-400)' }}>{leads.length} records</span>
        </div>

        {leads.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', padding: '48px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(13, 148, 136, 0.12)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar className="w-6 h-6" />
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-white)', margin: 0 }}>
              No daily business entries yet
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: 0 }}>
              Fill out the form above to log the first day.
            </p>
          </div>
        ) : (
          <div className="portal-table-container">
            <table className="portal-data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Admissions</th>
                  <th>Total Inquiries</th>
                  <th>Walk-ins / Calls</th>
                  <th>Demos / Workshops</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id || l._id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: '#fff' }}>{l.date}</td>
                    <td><span className="sidebar-badge badge-emerald">+{l.admissions || l.conversions || 0} Admissions</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{l.totalInquiries || 0}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-slate-300)' }}>
                      Walk-ins: {l.walkIns || 0} | Calls: {l.phoneCalls || 0}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-slate-300)' }}>
                      Demos: {l.demosConducted || 0} | Workshops: {l.workshopsConducted || 0}
                    </td>
                    <td style={{ fontSize: '11.5px', color: 'var(--text-slate-400)' }}>
                      {l.notes ? `"${l.notes}"` : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button onClick={() => { setEditingLeadId(l.id || l._id); setFormData({ ...l }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="action-btn" title="Edit entry">
                          <Edit3 className="w-3.5 h-3.5 text-teal-500" />
                        </button>
                        <button onClick={() => handleDeleteEntry(l.id || l._id)} className="action-btn" style={{ color: '#fb7185' }} title="Delete entry">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Set Monthly Target Modal */}
      <SetMonthlyTargetModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        onSaveSuccess={() => fetchDailyTarget()}
        initialBranch={selectedBranch}
      />

    </div>
  );
}
