import React, { useState } from 'react';
import { X, Building2, GraduationCap, Building, DollarSign, CreditCard, AlertTriangle, Calendar, MapPin, Phone, User, Users, FileText } from 'lucide-react';

const MAHARASHTRA_BRANCHES = [
  'Pune (FC Road) ★',
  'Kolhapur (Tarabai Park) ★'
];

export default function CreateB2BModal({ isOpen, onClose, onSaveSuccess, initialBranch = 'Pune (FC Road) ★', initialType = 'College', initialData = null }) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    dateOfReceipt: today,
    receiptCategory: initialType === 'Company' ? 'Company Revenue' : 'College Revenue',
    institutionType: initialType || 'College',
    institutionName: '',
    location: '',
    mobileNumber: '',
    headName: '',
    candidatesTrained: '',
    notes: '',
    paidBranch: initialBranch || 'Pune (FC Road) ★',
    leadGeneratedBy: '',
    leadBranch: initialBranch || 'Pune (FC Road) ★',
    baseAmount: 0,
    gstRate: '18%',
    tdsRate: '2%',
    party: 'Partner',
    account: 'Cash',
    isSez: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        dateOfReceipt: initialData.dateOfReceipt || initialData.contractDate || today,
        receiptCategory: initialData.receiptCategory || (initialData.institutionType === 'Company' ? 'Company Revenue' : 'College Revenue'),
        institutionType: initialData.institutionType || 'College',
        institutionName: initialData.institutionName || '',
        location: initialData.location || '',
        mobileNumber: initialData.mobileNumber || '',
        headName: initialData.headName || '',
        candidatesTrained: initialData.candidatesTrained || '',
        notes: initialData.notes || '',
        paidBranch: initialData.paidBranch || initialData.branchCode || initialBranch || 'Pune (FC Road) ★',
        leadGeneratedBy: initialData.leadGeneratedBy || '',
        leadBranch: initialData.leadBranch || initialBranch || 'Pune (FC Road) ★',
        baseAmount: initialData.baseAmount || initialData.totalAmount || 0,
        gstRate: initialData.gstRate || (initialData.isSez ? '0%' : '18%'),
        tdsRate: initialData.tdsRate || '2%',
        party: initialData.party || 'Partner',
        account: initialData.account || 'Cash',
        isSez: !!initialData.isSez
      });
    } else {
      setFormData({
        dateOfReceipt: today,
        receiptCategory: initialType === 'Company' ? 'Company Revenue' : 'College Revenue',
        institutionType: initialType || 'College',
        institutionName: '',
        location: '',
        mobileNumber: '',
        headName: '',
        candidatesTrained: '',
        notes: '',
        paidBranch: initialBranch || 'Pune (FC Road) ★',
        leadGeneratedBy: '',
        leadBranch: initialBranch || 'Pune (FC Road) ★',
        baseAmount: 0,
        gstRate: '18%',
        tdsRate: '2%',
        party: 'Partner',
        account: 'Cash',
        isSez: false
      });
    }
  }, [initialData, initialBranch, initialType, isOpen]);

  if (!isOpen) return null;

  // Live B2B Tax Calculations
  const base = parseFloat(formData.baseAmount) || 0;
  const isSez = formData.isSez || formData.gstRate === '0%' || formData.receiptCategory === 'Company Revenue' && formData.isSez;
  const gstPercent = isSez ? 0 : (formData.gstRate === '18%' ? 0.18 : 0);
  const gstAmount = Math.round(base * gstPercent * 100) / 100;
  const grossInvoice = Math.round((base + gstAmount) * 100) / 100;

  const tdsPercent = formData.tdsRate === '2%' ? 0.02 : (formData.tdsRate === '10%' ? 0.10 : 0);
  const tdsAmount = Math.round(base * tdsPercent * 100) / 100;

  const netReceived = Math.round((grossInvoice - tdsAmount) * 100) / 100;

  const handleCategorySelect = (cat) => {
    const isComp = cat === 'Company Revenue';
    setFormData(prev => ({
      ...prev,
      receiptCategory: cat,
      institutionType: isComp ? 'Company' : 'College',
      isSez: isComp ? prev.isSez : false,
      gstRate: isComp && prev.isSez ? '0%' : '18%'
    }));
  };

  const handleAccountChange = (acc) => {
    if (acc === 'IDFC Main') {
      setFormData(prev => ({ ...prev, account: acc, party: 'Management' }));
    } else {
      setFormData(prev => ({ ...prev, account: acc }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.institutionName.trim() || base <= 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        candidatesTrained: parseInt(formData.candidatesTrained, 10) || 0,
        baseAmount: base,
        gstAmount,
        tdsAmount,
        netAmountReceived: netReceived,
        totalAmount: grossInvoice,
        paidAmount: netReceived,
        pendingAmount: 0,
        contractDate: formData.dateOfReceipt,
        branchCode: formData.paidBranch || initialBranch || 'Pune (FC Road) ★'
      };

      const isEdit = initialData && (initialData.id || initialData._id);
      const targetId = initialData ? (initialData.id || initialData._id) : '';
      const url = isEdit ? `/api/b2b/${targetId}` : '/api/b2b';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        onSaveSuccess(saved);
        onClose();
      }
    } catch (err) {
      console.error('Error saving B2B entry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay-backdrop animate-fade-in">
      <div className="modal-dialog-container animate-modal-up" style={{ maxWidth: '840px', maxHeight: '92vh' }}>
        
        {/* Header */}
        <div className="modal-header-bar">
          <div>
            <h3 className="modal-title-text" style={{ fontSize: '18px', fontWeight: '800' }}>
              <Building2 className="w-5 h-5 text-teal-600" />
              Create new receipt (B2B Revenue)
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-slate-400)' }}>
              Maharashtra Franchise Portal · Pune & Kolhapur Branches
            </span>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          
          <div className="modal-body-scroll" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 1. Receipt Date */}
            <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '2px' }}>
                  Receipt date
                </label>
                <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '6px' }}>
                  Date of receipt
                </span>
                <input
                  type="date"
                  value={formData.dateOfReceipt}
                  onChange={(e) => setFormData({ ...formData, dateOfReceipt: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
                />
                <p style={{ fontSize: '10px', color: 'var(--text-slate-400)', margin: '4px 0 0 0' }}>
                  Default is today. Change this to enter old/backdated receipts (e.g., for January 2026 pending fees).
                </p>
              </div>
            </div>

            {/* 2. Receipt Type Cards */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)', display: 'block', marginBottom: '2px' }}>
                Receipt type
              </label>
              <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '8px' }}>
                What is this receipt for?
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { cat: 'College Revenue', label: '🎓 College Revenue', desc: 'B2B · institution' },
                  { cat: 'Company Revenue', label: '🏢 Company Revenue', desc: 'B2B · SEZ / non-SEZ' }
                ].map((item) => (
                  <div
                    key={item.cat}
                    onClick={() => handleCategorySelect(item.cat)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '14px',
                      background: formData.receiptCategory === item.cat ? 'rgba(0, 137, 123, 0.12)' : 'var(--bg-card)',
                      border: formData.receiptCategory === item.cat ? '2px solid var(--tf-teal-primary)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: '800', color: formData.receiptCategory === item.cat ? 'var(--tf-teal-primary)' : 'var(--text-white)' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-slate-400)', marginTop: '2px' }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. College / Company details */}
            <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {formData.institutionType === 'College' ? <GraduationCap className="w-4 h-4 text-teal-600" /> : <Building className="w-4 h-4 text-teal-600" />}
                {formData.institutionType === 'College' ? 'College details' : 'Company details'}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>
                    {formData.institutionType === 'College' ? 'College name *' : 'Company name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={formData.institutionType === 'College' ? 'e.g., PSG College of Technology' : 'e.g., Omega Healthcare Tech'}
                    value={formData.institutionName}
                    onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Location</label>
                  <input
                    type="text"
                    placeholder="City, State"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Mobile number</label>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>
                    {formData.institutionType === 'College' ? "Principal / Head's name" : "HR / Director's name"}
                  </label>
                  <input
                    type="text"
                    placeholder="Dr. Full Name"
                    value={formData.headName}
                    onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '2px' }}>Candidates trained</label>
                  <input
                    type="number"
                    placeholder="e.g., 40"
                    value={formData.candidatesTrained}
                    onChange={(e) => setFormData({ ...formData, candidatesTrained: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
                  />
                  <span style={{ fontSize: '10px', color: 'var(--text-slate-400)', marginTop: '2px', display: 'block' }}>
                    Number of students delivered training (used for B2B reports)
                  </span>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Notes (optional · what was delivered)</label>
                  <input
                    type="text"
                    placeholder="e.g., 3-day CPC training workshop for 40 students"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            {/* 4. Branch */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-slate-400)', display: 'block', marginBottom: '2px' }}>Paid branch *</label>
              <select
                value={formData.paidBranch}
                onChange={(e) => setFormData({ ...formData, paidBranch: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--tf-teal-primary)', fontWeight: 'bold', fontSize: '13px' }}
              >
                {MAHARASHTRA_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <span style={{ fontSize: '10px', color: 'var(--text-slate-400)', marginTop: '2px', display: 'block' }}>
                Where the student is paying / will be trained
              </span>
            </div>

            {/* 5. Lead source */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users className="w-4 h-4 text-teal-600" />
                Lead source
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Lead generated by — HR name</label>
                  <input
                    type="text"
                    placeholder="e.g., Karthik S"
                    value={formData.leadGeneratedBy}
                    onChange={(e) => setFormData({ ...formData, leadGeneratedBy: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '2px' }}>Lead branch</label>
                  <select
                    value={formData.leadBranch}
                    onChange={(e) => setFormData({ ...formData, leadBranch: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
                  >
                    {MAHARASHTRA_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <span style={{ fontSize: '10px', color: 'var(--text-slate-400)', marginTop: '2px', display: 'block' }}>
                    Lead can come from any branch even if student joins elsewhere
                  </span>
                </div>
              </div>
            </div>

            {/* 6. Invoice amount */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarSign className="w-4 h-4 text-teal-600" />
                Invoice amount
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Invoice base amount (₹, EXCLUDING GST)</label>
                  <input
                    type="number"
                    value={formData.baseAmount}
                    onChange={(e) => setFormData({ ...formData, baseAmount: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px', fontWeight: 'bold' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Net amount received in your bank (₹)</label>
                  <input
                    type="number"
                    readOnly
                    value={netReceived}
                    style={{ width: '100%', padding: '9px 12px', background: 'rgba(0, 137, 123, 0.08)', border: '1px solid rgba(0, 137, 123, 0.3)', borderRadius: '8px', color: 'var(--tf-teal-primary)', fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              </div>
            </div>

            {/* 7. Tax treatment — GST & TDS */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText className="w-4 h-4 text-teal-600" />
                Tax treatment — GST & TDS
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>GST applicable on this invoice</label>
                  <select
                    value={formData.isSez ? '0%' : formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: e.target.value, isSez: e.target.value === '0%' })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
                  >
                    <option value="18%">18% (standard rate)</option>
                    <option value="0%">0% (zero-rated supply / SEZ)</option>
                  </select>
                  <p style={{ fontSize: '10px', color: 'var(--text-slate-400)', margin: '4px 0 0 0' }}>
                    For SEZ companies, GST is 0% (zero-rated supply). For colleges & non-SEZ companies, 18% is standard.
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>TDS rate deducted by buyer</label>
                  <select
                    value={formData.tdsRate}
                    onChange={(e) => setFormData({ ...formData, tdsRate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
                  >
                    <option value="2%">2% — 194C / 194J (technical services)</option>
                    <option value="0%">0% (No TDS deducted)</option>
                    <option value="10%">10% (Professional fees)</option>
                  </select>
                  <p style={{ fontSize: '10px', color: 'var(--text-slate-400)', margin: '4px 0 0 0' }}>
                    TDS is deducted by the buyer (college/company) on the base amount (excluding GST). They will give you a TDS certificate.
                  </p>
                </div>
              </div>
            </div>

            {/* 8. Received by — which pocket? */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard className="w-4 h-4 text-teal-600" />
                Received by — which pocket?
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '6px' }}>Party</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Partner', 'Management'].map(p => (
                      <button
                        type="button"
                        key={p}
                        disabled={formData.account === 'IDFC Main' && p === 'Partner'}
                        onClick={() => setFormData({ ...formData, party: p })}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          border: formData.party === p ? '2px solid var(--tf-teal-primary)' : '1px solid var(--border-color)',
                          background: formData.party === p ? 'rgba(0, 137, 123, 0.12)' : 'var(--bg-input)',
                          color: formData.party === p ? 'var(--tf-teal-primary)' : 'var(--text-white)',
                          fontWeight: '800',
                          fontSize: '12px',
                          opacity: (formData.account === 'IDFC Main' && p === 'Partner') ? 0.4 : 1,
                          cursor: (formData.account === 'IDFC Main' && p === 'Partner') ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '6px' }}>Account</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['IDFC Main', 'Non IDFC', 'Cash'].map(acc => (
                      <button
                        type="button"
                        key={acc}
                        onClick={() => handleAccountChange(acc)}
                        style={{
                          flex: 1,
                          padding: '8px 4px',
                          borderRadius: '8px',
                          border: formData.account === acc ? '2px solid var(--tf-teal-primary)' : '1px solid var(--border-color)',
                          background: formData.account === acc ? 'rgba(0, 137, 123, 0.12)' : 'var(--bg-input)',
                          color: formData.account === acc ? 'var(--tf-teal-primary)' : 'var(--text-white)',
                          fontWeight: '800',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        {acc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {formData.account === 'IDFC Main' && (
                <div className="idfc-warning-banner">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 style={{ marginTop: '2px' }}" />
                  <span>
                    IDFC Main is a shared joint account. Receipts and expenses here always credit/debit to Management — Partner option is disabled.
                  </span>
                </div>
              )}
            </div>

            {/* 9. Live Tax & Fee Arithmetic Summary Table */}
            <div className="arithmetic-summary-box" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              <div className="calc-cell">
                <span className="calc-label">Invoice base (excl. GST)</span>
                <span className="calc-val">₹{base.toLocaleString('en-IN')}</span>
              </div>
              <div className="calc-cell">
                <span className="calc-label">GST {isSez ? '0%' : '18%'}</span>
                <span className="calc-val" style={{ color: 'var(--cyan-primary)' }}>₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="calc-cell">
                <span className="calc-label">Gross invoice (incl. GST)</span>
                <span className="calc-val">₹{grossInvoice.toLocaleString('en-IN')}</span>
              </div>
              <div className="calc-cell">
                <span className="calc-label">TDS {formData.tdsRate} deducted</span>
                <span className="calc-val" style={{ color: '#fb7185' }}>-₹{tdsAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="calc-cell" style={{ background: 'rgba(0, 137, 123, 0.12)', borderColor: 'var(--tf-teal-primary)' }}>
                <span className="calc-label" style={{ color: 'var(--tf-teal-primary)' }}>Net received in bank</span>
                <span className="calc-val" style={{ color: 'var(--tf-teal-primary)' }}>₹{netReceived.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Explanatory Tax Banner */}
            <div style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-slate-400)', lineHeight: '1.4' }}>
              💡 <strong>How this is recorded:</strong> The net amount received hits your bank. GST goes to government (Mgmt remits). TDS deducted is a receivable — claim it back against income tax with the buyer's TDS certificate.
            </div>

          </div>

          {/* Footer Action Bar */}
          <div className="modal-footer-bar">
            <button type="button" onClick={onClose} className="action-btn">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary-green">
              {isSubmitting ? 'Saving B2B Entry...' : 'Save & Generate B2B Receipt'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
