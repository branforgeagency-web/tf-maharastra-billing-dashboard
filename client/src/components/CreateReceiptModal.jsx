import React, { useState, useEffect } from 'react';
import { X, Calculator, Plus, AlertCircle, Sparkles, CheckCircle2, User, Phone, Mail, MapPin, Building, BookOpen, GraduationCap, DollarSign, CreditCard } from 'lucide-react';

const COURSES_WITH_PRICES = [
  { name: 'AMCT Beginner — ₹17,000 (45 days)', fee: 17000 },
  { name: 'AMCT Intermediate — ₹23,000 (3 Months)', fee: 23000 },
  { name: 'AMCT Advanced — ₹29,000 (4 Months)', fee: 29000 },
  { name: 'Internship — Beginner — ₹35,000 (5 Months)', fee: 35000 },
  { name: 'Internship — Intermediate — ₹42,000 (6 Months)', fee: 42000 },
  { name: 'Internship — Advanced — ₹48,000 (7 Months)', fee: 48000 },
  { name: 'CPC — ₹14,000 (45 days)', fee: 14000 },
  { name: 'CPC Fast Track — ₹11,500', fee: 11500 },
  { name: 'CPC + ED — ₹21,000 (2 Months)', fee: 21000 },
  { name: 'CPC + E/M — ₹21,000 (2 Months)', fee: 21000 },
  { name: 'CIC (Freshers) — ₹29,000 (2 Months)', fee: 29000 },
  { name: 'CIC (with IPDRG experience) — ₹21,000 (2 Months)', fee: 21000 },
  { name: 'IP-DRG — ₹17,500 (45 days)', fee: 17500 },
  { name: 'CIC Fast Track — ₹10,000', fee: 10000 },
  { name: 'CCS — ₹29,000 (45 days)', fee: 29000 },
  { name: 'CCS (with IPDRG experience) — ₹21,000 (45 days)', fee: 21000 },
  { name: 'CIC + IP Specialty — ₹29,000 (2 Months)', fee: 29000 },
  { name: 'CCS + IP Specialty — ₹29,000 (2 Months)', fee: 29000 },
  { name: 'CPT Alone — ₹9,000', fee: 9000 },
  { name: 'CRC — ₹18,000 (2 Months)', fee: 18000 }
];

const MAHARASHTRA_BRANCHES = [
  'Pune (FC Road) ★',
  'Kolhapur (Tarabai Park) ★'
];

export default function CreateReceiptModal({ isOpen, onClose, onSaveSuccess, initialBranch, initialData = null }) {
  const defaultBranch = (initialBranch && !initialBranch.includes('Salem')) ? initialBranch : 'Pune (FC Road) ★';

  const [formData, setFormData] = useState({
    dateOfReceipt: new Date().toISOString().split('T')[0],
    receiptCategory: 'Course Fee',
    paymentType: 'New Fee',
    studentName: '',
    cellNumber: '',
    email: '',
    address: '',
    paidBranch: defaultBranch,
    course: '',
    modeOfTraining: 'Offline',
    leadGeneratedBy: '',
    leadBranch: defaultBranch,
    courseFee: 0,
    installmentPlan: 'Full payment',
    installmentNumber: 'Installment 1',
    amountPayingNow: 0,
    previouslyPaid: 0,
    party: 'Partner',
    account: 'Cash',
    receiptNo: ''
  });

  const [idfcWarning, setIdfcWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        dateOfReceipt: initialData.dateOfReceipt || new Date().toISOString().split('T')[0],
        receiptCategory: initialData.receiptCategory || 'Course Fee',
        paymentType: initialData.paymentType || 'New Fee',
        studentName: initialData.studentName || '',
        cellNumber: initialData.cellNumber || '',
        email: initialData.email || '',
        address: initialData.address || '',
        paidBranch: initialData.paidBranch || defaultBranch,
        course: initialData.course || '',
        modeOfTraining: initialData.modeOfTraining || 'Offline',
        leadGeneratedBy: initialData.leadGeneratedBy || '',
        leadBranch: initialData.leadBranch || defaultBranch,
        courseFee: initialData.courseFee || 0,
        installmentPlan: initialData.installmentPlan || 'Full payment',
        installmentNumber: initialData.installmentNumber || 'Installment 1',
        amountPayingNow: initialData.amountPayingNow || 0,
        previouslyPaid: initialData.previouslyPaid || 0,
        party: initialData.party || 'Partner',
        account: initialData.account || 'Cash',
        receiptNo: initialData.receiptNo || ''
      });
    } else if (initialBranch && !initialBranch.includes('Salem')) {
      setFormData(prev => ({ 
        ...prev, 
        paidBranch: initialBranch, 
        leadBranch: initialBranch 
      }));
    }
  }, [initialData, initialBranch, isOpen]);

  useEffect(() => {
    if (!initialData && formData.paidBranch) {
      fetch(`/api/next-receipt-no?branch=${encodeURIComponent(formData.paidBranch)}`)
        .then(res => res.json())
        .then(d => setFormData(prev => ({ ...prev, receiptNo: d.receiptNo })))
        .catch(err => console.error(err));
    }
  }, [formData.paidBranch]);

  if (!isOpen) return null;

  const handleCourseChange = (e) => {
    const selectedCourseName = e.target.value;
    const courseObj = COURSES_WITH_PRICES.find(c => c.name === selectedCourseName);
    const fee = courseObj ? courseObj.fee : 0;
    setFormData({
      ...formData,
      course: selectedCourseName,
      courseFee: fee,
      amountPayingNow: fee
    });
  };

  const handleAccountChange = (acc) => {
    if (acc === 'IDFC Main') {
      setFormData({ ...formData, account: acc, party: 'Management' });
      setIdfcWarning(true);
    } else {
      setFormData({ ...formData, account: acc });
      setIdfcWarning(false);
    }
  };

  const courseFee = parseFloat(formData.courseFee) || 0;
  const taxableValue = (courseFee / 1.18).toFixed(2);
  const gstAmount = (courseFee - taxableValue).toFixed(2);
  const previouslyPaid = parseFloat(formData.previouslyPaid) || 0;
  const amountPayingNow = parseFloat(formData.amountPayingNow) || 0;
  const pendingBalance = Math.max(0, (courseFee - previouslyPaid - amountPayingNow)).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentName.trim() || !formData.cellNumber.trim()) {
      alert('Please fill student name and cell number');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const savedReceipt = await res.json();
        if (onSaveSuccess) onSaveSuccess(savedReceipt);
        onClose();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to save receipt');
      }
    } catch (err) {
      console.error(err);
      alert('Network error saving receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay-backdrop">
      <div className="modal-dialog-container animate-modal-up" style={{ maxWidth: '850px', width: '95%' }}>
        
        {/* Header */}
        <div className="modal-header-bar">
          <div>
            <h3 className="modal-title-text" style={{ fontSize: '18px', fontWeight: '800' }}>
              <Calculator className="w-5 h-5 text-emerald-500" />
              Create new receipt
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
            
            {/* 1. Receipt Date & Auto Receipt No */}
            <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
                  />
                  <p style={{ fontSize: '10px', color: 'var(--text-slate-400)', margin: '4px 0 0 0' }}>
                    Default is today. Change this to enter old/backdated receipts (e.g., for January 2026 pending fees).
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '2px' }}>
                    Receipt No. (Auto)
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '6px' }}>
                    Generated receipt number
                  </span>
                  <input
                    type="text"
                    readOnly
                    value={formData.receiptNo}
                    style={{ width: '100%', padding: '9px 12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: 'var(--emerald-primary)', fontWeight: '800', fontSize: '14px', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { cat: 'Course Fee', desc: 'Student tuition in ₹' },
                  { cat: 'Exam Fee', desc: 'AAPC / AHIMA voucher' },
                  { cat: 'Book Fee', desc: 'Books / materials' },
                  { cat: 'Courier Fee', desc: 'Shipping in ₹' },
                  { cat: 'College Revenue', desc: '🎓 B2B · institution' },
                  { cat: 'Company Revenue', desc: '🏢 B2B · SEZ / non-SEZ' }
                ].map((item) => (
                  <div
                    key={item.cat}
                    onClick={() => setFormData({ ...formData, receiptCategory: item.cat })}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: formData.receiptCategory === item.cat ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
                      border: formData.receiptCategory === item.cat ? '2px solid var(--emerald-primary)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '800', color: formData.receiptCategory === item.cat ? 'var(--emerald-primary)' : 'var(--text-white)' }}>
                      {item.cat}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-slate-400)', marginTop: '2px' }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Payment Type */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)', display: 'block', marginBottom: '2px' }}>
                Payment type
              </label>
              <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '8px' }}>
                Is this a new admission fee or a pending-fee installment?
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['New Fee', 'Pending Fee'].map(type => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setFormData({ ...formData, paymentType: type })}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      border: formData.paymentType === type ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                      background: formData.paymentType === type ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-card)',
                      color: formData.paymentType === type ? '#3b82f6' : 'var(--text-white)',
                      fontWeight: '800',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Student details */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User className="w-4 h-4 text-emerald-500" />
                Student details
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Student name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Cell number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="98765 43210"
                    value={formData.cellNumber}
                    onChange={(e) => setFormData({ ...formData, cellNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Email</label>
                  <input
                    type="email"
                    placeholder="student@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Address</label>
                  <input
                    type="text"
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            {/* 5. Branch, course & mode */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen className="w-4 h-4 text-emerald-500" />
                Branch, course & mode
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '2px' }}>Paid branch *</label>
                  <select
                    value={formData.paidBranch}
                    onChange={(e) => setFormData({ ...formData, paidBranch: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--emerald-primary)', fontWeight: 'bold', fontSize: '13px' }}
                  >
                    {MAHARASHTRA_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <span style={{ fontSize: '10px', color: 'var(--text-slate-400)', marginTop: '2px', display: 'block' }}>
                    Where the student is paying / will be trained
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '2px' }}>Course *</label>
                  <select
                    value={formData.course}
                    onChange={handleCourseChange}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '12px' }}
                  >
                    <option value="">Select course…</option>
                    {COURSES_WITH_PRICES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Mode of training</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['Offline', 'Online'].map(mode => (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => setFormData({ ...formData, modeOfTraining: mode })}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          border: formData.modeOfTraining === mode ? '2px solid #10b981' : '1px solid var(--border-color)',
                          background: formData.modeOfTraining === mode ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-input)',
                          color: formData.modeOfTraining === mode ? '#10b981' : 'var(--text-white)',
                          fontWeight: '700',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Lead source */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GraduationCap className="w-4 h-4 text-emerald-500" />
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

            {/* 7. Fee & installment */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Fee & installment
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Course fee (₹, inclusive of GST)</label>
                  <input
                    type="number"
                    value={formData.courseFee}
                    onChange={(e) => setFormData({ ...formData, courseFee: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px', fontWeight: 'bold' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Installment plan</label>
                  <select
                    value={formData.installmentPlan}
                    onChange={(e) => setFormData({ ...formData, installmentPlan: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
                  >
                    <option value="Full payment">Full payment</option>
                    <option value="2 installments">2 installments</option>
                    <option value="3 installments">3 installments</option>
                    <option value="4 installments">4 installments</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>This installment number</label>
                  <select
                    value={formData.installmentNumber}
                    onChange={(e) => setFormData({ ...formData, installmentNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontSize: '13px' }}
                  >
                    <option value="Installment 1">Installment 1</option>
                    <option value="Installment 2">Installment 2</option>
                    <option value="Installment 3">Installment 3</option>
                    <option value="Installment 4">Installment 4</option>
                    <option value="Final">Final</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>Amount paying now (₹)</label>
                  <input
                    type="number"
                    value={formData.amountPayingNow}
                    onChange={(e) => setFormData({ ...formData, amountPayingNow: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--emerald-primary)', fontSize: '13px', fontWeight: 'bold' }}
                  />
                </div>
              </div>
            </div>

            {/* 8. Received by — which pocket? */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard className="w-4 h-4 text-emerald-500" />
                Received by — which pocket?
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '6px' }}>Party</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { p: 'Partner', label: 'Partner', sub: 'Franchisee' },
                      { p: 'Management', label: 'Management', sub: 'HQ Coimbatore' }
                    ].map(item => (
                      <button
                        type="button"
                        key={item.p}
                        disabled={formData.account === 'IDFC Main' && item.p === 'Partner'}
                        onClick={() => setFormData({ ...formData, party: item.p })}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: formData.party === item.p ? '2px solid #10b981' : '1px solid var(--border-color)',
                          background: formData.party === item.p ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-input)',
                          opacity: (formData.account === 'IDFC Main' && item.p === 'Partner') ? 0.4 : 1,
                          cursor: 'pointer'
                        }}
                      >
                        <strong style={{ fontSize: '12px', color: 'var(--text-white)', display: 'block' }}>{item.label}</strong>
                        <span style={{ fontSize: '9px', color: 'var(--text-slate-400)' }}>{item.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginBottom: '6px' }}>Account</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                    {[
                      { acc: 'IDFC Main', label: 'IDFC Main', sub: 'Shared · Mgmt' },
                      { acc: 'Non IDFC', label: 'Non IDFC', sub: 'Other banks' },
                      { acc: 'Cash', label: 'Cash', sub: 'Physical cash' }
                    ].map(item => (
                      <button
                        type="button"
                        key={item.acc}
                        onClick={() => handleAccountChange(item.acc)}
                        style={{
                          padding: '8px 6px',
                          borderRadius: '8px',
                          border: formData.account === item.acc ? '2px solid #10b981' : '1px solid var(--border-color)',
                          background: formData.account === item.acc ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-input)',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <strong style={{ fontSize: '11px', color: 'var(--text-white)', display: 'block' }}>{item.label}</strong>
                        <span style={{ fontSize: '8px', color: 'var(--text-slate-400)' }}>{item.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* IDFC Rule Banner */}
              <div style={{ 
                background: 'rgba(13, 148, 136, 0.06)', 
                border: '1.5px solid rgba(13, 148, 136, 0.35)', 
                borderRadius: '10px', 
                padding: '10px 14px', 
                fontSize: '12px', 
                color: 'var(--text-slate-300)', 
                lineHeight: '1.45',
                marginTop: '6px'
              }}>
                <strong style={{ color: 'var(--tf-teal-primary)', fontWeight: '800' }}>IDFC Main is a shared joint account.</strong> Receipts and expenses here always credit/debit to Management — Partner option is disabled.
              </div>
            </div>

            {/* 9. Live Calculations Arithmetic Summary Box (Exact Screenshot Match) */}
            <div style={{ 
              background: 'rgba(13, 148, 136, 0.05)', 
              borderRadius: '16px', 
              border: '1.5px solid rgba(13, 148, 136, 0.25)', 
              padding: '18px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              
              {/* Row 1: Course fee (inclusive of GST) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '13.5px', color: 'var(--text-white)', fontWeight: '800' }}>
                  Course fee (inclusive of GST)
                </strong>
                <strong style={{ fontSize: '15px', color: 'var(--tf-teal-primary)', fontFamily: 'var(--font-mono)', fontWeight: '900' }}>
                  ₹{courseFee.toLocaleString('en-IN')}
                </strong>
              </div>

              {/* Dashed Line 1 */}
              <div style={{ borderBottom: '1px dashed rgba(13, 148, 136, 0.35)', margin: '2px 0' }} />

              {/* Row 2: Taxable value */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--text-slate-300)' }}>
                  Taxable value (base amount)
                </span>
                <span style={{ fontSize: '13.5px', color: 'var(--text-white)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                  ₹{parseFloat(taxableValue).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Row 3: GST 18% */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--text-slate-300)' }}>
                  GST 18%
                </span>
                <span style={{ fontSize: '13.5px', color: 'var(--text-white)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                  ₹{parseFloat(gstAmount).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Dashed Line 2 */}
              <div style={{ borderBottom: '1px dashed rgba(13, 148, 136, 0.35)', margin: '2px 0' }} />

              {/* Row 4: Total (inclusive) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '13.5px', color: 'var(--tf-teal-primary)', fontWeight: '800' }}>
                  Total (inclusive)
                </strong>
                <strong style={{ fontSize: '15px', color: 'var(--tf-teal-primary)', fontFamily: 'var(--font-mono)', fontWeight: '900' }}>
                  ₹{courseFee.toLocaleString('en-IN')}
                </strong>
              </div>

              {/* Dashed Line 3 */}
              <div style={{ borderBottom: '1px dashed rgba(13, 148, 136, 0.35)', margin: '2px 0' }} />

              {/* Row 5: Previously paid */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--text-slate-300)' }}>
                  Previously paid
                </span>
                <span style={{ fontSize: '13.5px', color: 'var(--text-white)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                  ₹{previouslyPaid.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Row 6: Paying now */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--text-slate-300)' }}>
                  Paying now
                </span>
                <span style={{ fontSize: '14px', color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                  ₹{amountPayingNow.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Row 7: Pending balance */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--text-slate-300)' }}>
                  Pending balance
                </span>
                <span style={{ fontSize: '14px', color: pendingBalance > 0 ? '#fb7185' : 'var(--emerald-primary)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                  ₹{parseFloat(pendingBalance).toLocaleString('en-IN')}
                </span>
              </div>

            </div>

          </div>

          {/* Footer Submit Bar */}
          <div className="modal-footer-bar" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} className="action-btn" style={{ padding: '9px 20px', borderRadius: '10px' }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary-green" style={{ padding: '9px 22px', borderRadius: '10px', background: 'var(--tf-teal-primary)', opacity: isSubmitting ? 0.7 : 1 }}>
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save & generate receipt'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
