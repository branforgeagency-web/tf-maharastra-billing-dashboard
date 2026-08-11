import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, ShieldCheck, DollarSign, CheckCircle2 } from 'lucide-react';

export default function ExamFeesView({ selectedBranch }) {
  const [examFees, setExamFees] = useState([]);
  const [formData, setFormData] = useState({
    studentName: '',
    receiptNo: '',
    certificationBody: 'AAPC',
    collectedAmount: '',
    bodyPayableAmount: '',
    remarks: '',
    branchCode: selectedBranch || 'Salem'
  });

  useEffect(() => {
    fetchExamFees();
  }, [selectedBranch]);

  const fetchExamFees = () => {
    fetch('/api/exam-fees')
      .then(res => res.json())
      .then(data => setExamFees(data))
      .catch(err => console.error(err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentName || !formData.collectedAmount) return;

    const collected = parseFloat(formData.collectedAmount) || 0;
    const bodyPayable = parseFloat(formData.bodyPayableAmount) || collected;

    try {
      const res = await fetch('/api/exam-fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          collectedAmount: collected,
          bodyPayableAmount: bodyPayable,
          receiptNo: formData.receiptNo || `TF/EXM/${Date.now().toString().slice(-4)}`,
          branchCode: selectedBranch || 'Salem'
        })
      });

      if (res.ok) {
        fetchExamFees();
        setFormData({
          studentName: '',
          receiptNo: '',
          certificationBody: 'AAPC',
          collectedAmount: '',
          bodyPayableAmount: '',
          remarks: '',
          branchCode: selectedBranch || 'Salem'
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalCollected = examFees.reduce((acc, e) => acc + (e.collectedAmount || 0), 0);
  const totalRemitted = examFees.filter(e => e.paymentStatus === 'Remitted to Body').reduce((acc, e) => acc + (e.collectedAmount || 0), 0);
  const totalPendingRemittance = Math.max(0, totalCollected - totalRemitted);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(15, 23, 42, 0.9))', padding: '20px', borderRadius: '16px', border: '1px solid rgba(236, 72, 153, 0.3)', display: 'flex', justifyBetween: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen className="w-5 h-5 text-pink-400" />
            Exam Fees & Certification Pass-Through Ledger — {selectedBranch}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: '4px 0 0 0' }}>
            Separate exam collections (AAPC / AHIMA) from tuition revenue to maintain certification body payables.
          </p>
        </div>
      </div>

      <div className="metrics-grid-4">
        <div className="metric-card-box">
          <span className="metric-title-label">Exam Fees Collected</span>
          <div className="metric-value-amount" style={{ color: 'var(--pink-primary)' }}>
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
          <span className="metric-subtitle-text">Student AAPC/AHIMA Collections</span>
        </div>

        <div className="metric-card-box">
          <span className="metric-title-label">Remitted to Body</span>
          <div className="metric-value-amount" style={{ color: 'var(--emerald-primary)' }}>
            ₹{totalRemitted.toLocaleString('en-IN')}
          </div>
          <span className="metric-subtitle-text">Paid to AAPC/AHIMA</span>
        </div>

        <div className="metric-card-box">
          <span className="metric-title-label">Body Payable Outstanding</span>
          <div className="metric-value-amount" style={{ color: 'var(--amber-primary)' }}>
            ₹{totalPendingRemittance.toLocaleString('en-IN')}
          </div>
          <span className="metric-subtitle-text">Pass-Through Liability</span>
        </div>

        <div className="metric-card-box">
          <span className="metric-title-label">Total Exam Voucher Count</span>
          <div className="metric-value-amount" style={{ color: 'var(--cyan-primary)' }}>
            {examFees.length} Vouchers
          </div>
          <span className="metric-subtitle-text">Registered Exam Candidates</span>
        </div>
      </div>

      <div className="dashboard-grid-2">
        
        {/* Entry Form */}
        <div className="dashboard-panel-card">
          <div className="panel-title-bar">
            <h3 className="panel-heading">Register Exam Fee Collection</h3>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              required
              placeholder="Candidate / Student Name *"
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <select
                value={formData.certificationBody}
                onChange={(e) => setFormData({ ...formData, certificationBody: e.target.value })}
                style={{ padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
              >
                <option value="AAPC">AAPC (CPC Exam)</option>
                <option value="AHIMA">AHIMA (CCS Exam)</option>
                <option value="CPC Exam">CPC Exam Only</option>
                <option value="CIC Exam">CIC Inpatient Exam</option>
                <option value="CCS Exam">CCS Specialty Exam</option>
              </select>

              <input
                type="text"
                placeholder="Receipt No. (Optional)"
                value={formData.receiptNo}
                onChange={(e) => setFormData({ ...formData, receiptNo: e.target.value })}
                style={{ padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="number"
                required
                placeholder="Amount Collected (₹) *"
                value={formData.collectedAmount}
                onChange={(e) => setFormData({ ...formData, collectedAmount: e.target.value })}
                style={{ padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--emerald-primary)', fontWeight: 'bold', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
              />

              <input
                type="number"
                placeholder="Body Payable (₹)"
                value={formData.bodyPayableAmount}
                onChange={(e) => setFormData({ ...formData, bodyPayableAmount: e.target.value })}
                style={{ padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <button type="submit" className="btn-primary-green" style={{ marginTop: '6px' }}>
              <Plus className="w-4 h-4" />
              <span>Record Exam Fee Voucher</span>
            </button>
          </form>
        </div>

        {/* Exam Roster */}
        <div className="portal-table-container">
          <table className="portal-data-table">
            <thead>
              <tr>
                <th>Student & Receipt</th>
                <th>Certification Body</th>
                <th style={{ textAlign: 'right' }}>Collected</th>
                <th style={{ textAlign: 'right' }}>Body Payable</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {examFees.map((item) => (
                <tr key={item.id || item._id}>
                  <td>
                    <strong style={{ color: '#fff', display: 'block' }}>{item.studentName}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)' }}>{item.receiptNo}</span>
                  </td>
                  <td><span className="sidebar-badge badge-rose">{item.certificationBody}</span></td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--emerald-primary)' }}>₹{item.collectedAmount?.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{item.bodyPayableAmount?.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'center' }}><span className="badge-pill badge-paid">{item.paymentStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
