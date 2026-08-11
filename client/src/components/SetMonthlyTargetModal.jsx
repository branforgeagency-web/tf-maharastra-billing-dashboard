import React, { useState, useEffect } from 'react';
import { X, Target, Save, ChevronRight, ChevronDown, Trash2, Sparkles } from 'lucide-react';

export default function SetMonthlyTargetModal({ isOpen, onClose, onSaveSuccess, initialBranch = 'Pune (FC Road) ★' }) {
  const currentYear = new Date().getFullYear();
  const currentMonthNum = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const defaultMonth = `${currentYear}-${currentMonthNum}`;

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [showPlatformPosts, setShowPlatformPosts] = useState(false);
  const [showMoreTargets, setShowMoreTargets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    targetLeads: '',
    targetAdmissions: '',
    targetDemos: '',
    targetRevenue: '',
    targetPosts: '',
    targetReviews: '',
    targetWorkshops: '',
    targetColleges: '',
    targetMous: '',
    targetCorporateContacts: '',
    platformPosts: {
      instagram: '',
      facebook: '',
      linkedin: '',
      youtube: '',
      twitter: '',
      threads: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      fetchTargetForMonth(selectedMonth);
    }
  }, [isOpen, selectedMonth, initialBranch]);

  const fetchTargetForMonth = async (m) => {
    try {
      const params = new URLSearchParams();
      if (initialBranch) params.append('branch', initialBranch);
      params.append('month', m);

      const res = await fetch(`/api/daily-target?${params.toString()}`);
      if (res.ok) {
        const d = await res.json();
        if (d) {
          setFormData({
            targetLeads: d.targetLeads !== undefined ? d.targetLeads : '',
            targetAdmissions: d.targetAdmissions !== undefined ? d.targetAdmissions : '',
            targetDemos: d.targetDemos !== undefined ? d.targetDemos : '',
            targetRevenue: d.targetRevenue !== undefined ? d.targetRevenue : '',
            targetPosts: d.targetPosts !== undefined ? d.targetPosts : '',
            targetReviews: d.targetReviews !== undefined ? d.targetReviews : '',
            targetWorkshops: d.targetWorkshops !== undefined ? d.targetWorkshops : '',
            targetColleges: d.targetColleges !== undefined ? d.targetColleges : '',
            targetMous: d.targetMous !== undefined ? d.targetMous : '',
            targetCorporateContacts: d.targetCorporateContacts !== undefined ? d.targetCorporateContacts : '',
            platformPosts: {
              instagram: d.platformPosts?.instagram || '',
              facebook: d.platformPosts?.facebook || '',
              linkedin: d.platformPosts?.linkedin || '',
              youtube: d.platformPosts?.youtube || '',
              twitter: d.platformPosts?.twitter || '',
              threads: d.platformPosts?.threads || ''
            }
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        branchCode: initialBranch || 'Pune (FC Road) ★',
        month: selectedMonth,
        targetLeads: Number(formData.targetLeads) || 0,
        targetAdmissions: Number(formData.targetAdmissions) || 0,
        targetDemos: Number(formData.targetDemos) || 0,
        targetRevenue: Number(formData.targetRevenue) || 0,
        targetPosts: Number(formData.targetPosts) || 0,
        targetReviews: Number(formData.targetReviews) || 0,
        targetWorkshops: Number(formData.targetWorkshops) || 0,
        targetColleges: Number(formData.targetColleges) || 0,
        targetMous: Number(formData.targetMous) || 0,
        targetCorporateContacts: Number(formData.targetCorporateContacts) || 0,
        platformPosts: {
          instagram: Number(formData.platformPosts.instagram) || 0,
          facebook: Number(formData.platformPosts.facebook) || 0,
          linkedin: Number(formData.platformPosts.linkedin) || 0,
          youtube: Number(formData.platformPosts.youtube) || 0,
          twitter: Number(formData.platformPosts.twitter) || 0,
          threads: Number(formData.platformPosts.threads) || 0
        }
      };

      const res = await fetch('/api/daily-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearTarget = async () => {
    if (!window.confirm('Clear all targets set for this month?')) return;
    try {
      const params = new URLSearchParams();
      if (initialBranch) params.append('branch', initialBranch);
      params.append('month', selectedMonth);

      await fetch(`/api/daily-target?${params.toString()}`, { method: 'DELETE' });
      setFormData({
        targetLeads: '',
        targetAdmissions: '',
        targetDemos: '',
        targetRevenue: '',
        targetPosts: '',
        targetReviews: '',
        targetWorkshops: '',
        targetColleges: '',
        targetMous: '',
        targetCorporateContacts: '',
        platformPosts: { instagram: '', facebook: '', linkedin: '', youtube: '', twitter: '', threads: '' }
      });
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay-backdrop">
      <div className="modal-dialog-container animate-modal-up" style={{ maxWidth: '580px', width: '95%' }}>
        
        {/* Header */}
        <div className="modal-header-bar">
          <h3 className="modal-title-text" style={{ fontSize: '18px', fontWeight: '800' }}>
            Set monthly target
          </h3>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          
          <div className="modal-body-scroll" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Pace Alert Tip Box */}
            <div style={{ background: 'rgba(13, 148, 136, 0.08)', border: '1px solid rgba(13, 148, 136, 0.3)', borderRadius: '12px', padding: '12px 14px', fontSize: '12px', color: 'var(--tf-teal-primary)', fontWeight: '600' }}>
              and the daily pace needed to hit each target.
            </div>

            {/* Target Month Dropdown Selector */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '6px' }}>
                Target for which month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-white)', fontSize: '13px', fontWeight: '700', outline: 'none' }}
              >
                <option value="2026-08">August 2026 · this month</option>
                <option value="2026-09">September 2026</option>
                <option value="2026-10">October 2026</option>
                <option value="2026-11">November 2026</option>
                <option value="2026-12">December 2026</option>
              </select>
            </div>

            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', letterSpacing: '0.6px', display: 'block', marginTop: '4px' }}>
              TARGETS · LEAVE BLANK TO SKIP
            </span>

            {/* 1. Leads target */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span>🎯</span>
                <span>Leads target (count)</span>
              </label>
              <input
                type="number"
                placeholder="e.g., 100"
                value={formData.targetLeads}
                onChange={(e) => setFormData({ ...formData, targetLeads: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-white)', fontSize: '13.5px', outline: 'none' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginTop: '4px' }}>
                All sources combined — walk-in, phone, social, etc.
              </span>
            </div>

            {/* 2. Admissions target */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span>❇️</span>
                <span>Admissions target (count)</span>
              </label>
              <input
                type="number"
                placeholder="e.g., 20"
                value={formData.targetAdmissions}
                onChange={(e) => setFormData({ ...formData, targetAdmissions: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-white)', fontSize: '13.5px', outline: 'none' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginTop: '4px' }}>
                New students enrolled in courses
              </span>
            </div>

            {/* 3. Demos target */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span>🎤</span>
                <span>Demos target (count)</span>
              </label>
              <input
                type="number"
                placeholder="e.g., 30"
                value={formData.targetDemos}
                onChange={(e) => setFormData({ ...formData, targetDemos: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-white)', fontSize: '13.5px', outline: 'none' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginTop: '4px' }}>
                Demo sessions conducted
              </span>
            </div>

            {/* 4. Training revenue target */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span>💰</span>
                <span>Training revenue target (₹)</span>
              </label>
              <input
                type="number"
                placeholder="e.g., 50000"
                value={formData.targetRevenue}
                onChange={(e) => setFormData({ ...formData, targetRevenue: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-white)', fontSize: '13.5px', outline: 'none' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginTop: '4px' }}>
                Corporate training revenue this month
              </span>
            </div>

            {/* 5. Purple Social Media Targets Box */}
            <div style={{ background: 'rgba(147, 51, 234, 0.06)', border: '1.5px solid rgba(147, 51, 234, 0.3)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: '900', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🎆</span>
                <span>SOCIAL MEDIA TARGETS</span>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '4px' }}>
                  Posts target (count)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 60"
                  value={formData.targetPosts}
                  onChange={(e) => setFormData({ ...formData, targetPosts: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
                />
                <span style={{ fontSize: '11px', color: '#c084fc', display: 'block', marginTop: '4px' }}>
                  Total posts across all platforms (Instagram, Facebook, LinkedIn, YouTube, Twitter/X, Threads)
                </span>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '4px' }}>
                  Reviews target (count)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 30"
                  value={formData.targetReviews}
                  onChange={(e) => setFormData({ ...formData, targetReviews: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
                />
                <span style={{ fontSize: '11px', color: '#c084fc', display: 'block', marginTop: '4px' }}>
                  Total reviews from GMB + Justdial combined
                </span>
              </div>

              {/* Per-platform post targets toggle */}
              <button
                type="button"
                onClick={() => setShowPlatformPosts(prev => !prev)}
                style={{ background: 'none', border: 'none', color: '#a855f7', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0, marginTop: '4px' }}
              >
                {showPlatformPosts ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span>+ Set per-platform post targets (optional)</span>
              </button>

              {showPlatformPosts && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '8px' }}>
                  {['instagram', 'facebook', 'linkedin', 'youtube', 'twitter', 'threads'].map(platform => (
                    <div key={platform}>
                      <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', textTransform: 'capitalize', display: 'block', marginBottom: '2px' }}>{platform}</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={formData.platformPosts[platform]}
                        onChange={(e) => setFormData({
                          ...formData,
                          platformPosts: { ...formData.platformPosts, [platform]: e.target.value }
                        })}
                        style={{ width: '100%', padding: '6px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expandable More Targets Toggle */}
            <button
              type="button"
              onClick={() => setShowMoreTargets(prev => !prev)}
              style={{ background: 'none', border: 'none', color: 'var(--tf-teal-primary)', fontSize: '12.5px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0 }}
            >
              {showMoreTargets ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <span>+ More targets (workshops, colleges, MOUs, corporate contacts)</span>
            </button>

            {showMoreTargets && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-input)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '2px' }}>Workshops target</label>
                  <input
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.targetWorkshops}
                    onChange={(e) => setFormData({ ...formData, targetWorkshops: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '2px' }}>Colleges target</label>
                  <input
                    type="number"
                    placeholder="e.g., 10"
                    value={formData.targetColleges}
                    onChange={(e) => setFormData({ ...formData, targetColleges: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '2px' }}>MOUs target</label>
                  <input
                    type="number"
                    placeholder="e.g., 2"
                    value={formData.targetMous}
                    onChange={(e) => setFormData({ ...formData, targetMous: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '2px' }}>Corporate contacts target</label>
                  <input
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.targetCorporateContacts}
                    onChange={(e) => setFormData({ ...formData, targetCorporateContacts: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '12.5px' }}
                  />
                </div>
              </div>
            )}

          </div>

          {/* Footer Bar */}
          <div className="modal-footer-bar" style={{ padding: '14px 20px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 18px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-slate-300)', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleClearTarget}
              style={{ background: 'none', border: 'none', color: '#fb7185', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
            >
              Clear target for month
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary-green"
              style={{ background: 'var(--tf-teal-primary)', padding: '9px 20px', fontSize: '13px' }}
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save target'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
