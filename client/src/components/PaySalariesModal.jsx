import React, { useState, useEffect } from 'react';
import { X, DollarSign, Wallet, CheckCircle2 } from 'lucide-react';

export default function PaySalariesModal({ isOpen, onClose, onSaveSuccess, initialBranch = 'Pune (FC Road) ★', employees = [] }) {
  const today = new Date().toISOString().split('T')[0];
  const monthName = new Date().toLocaleString('default', { month: 'long' }) + ', ' + new Date().getFullYear();

  const [payMonth, setPayMonth] = useState(monthName);
  const [paymentDate, setPaymentDate] = useState(today);
  const [paidFrom, setPaidFrom] = useState('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editable Bonus, Variable, and Recharge per employee
  const [empAdjustments, setEmpAdjustments] = useState({});

  useEffect(() => {
    if (employees && employees.length > 0) {
      const initialMap = {};
      employees.forEach(emp => {
        const id = emp.id || emp._id;
        initialMap[id] = {
          bonus: emp.defaultBonus || 0,
          variable: emp.defaultVariable || 0,
          recharge: emp.mobileRecharge || 0
        };
      });
      setEmpAdjustments(initialMap);
    }
  }, [employees, isOpen]);

  if (!isOpen) return null;

  const handleAdjChange = (id, field, val) => {
    setEmpAdjustments(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: Number(val) || 0
      }
    }));
  };

  // Calculations across employees
  let totalNetPay = 0;
  let totalStatutory = 0;
  let totalStaffWelfare = 0;
  let totalRecharge = 0;
  let partnerCount = 0;
  let partnerTotalNet = 0;
  let mgmtCount = 0;
  let mgmtTotalNet = 0;

  const activeEmployees = employees.filter(e => !e.status || e.status.includes('Active'));

  activeEmployees.forEach(emp => {
    const id = emp.id || emp._id;
    const adj = empAdjustments[id] || { bonus: 0, variable: 0, recharge: 0 };
    
    const gross = emp.grossSalary || 0;
    const pf = emp.pfDeduction || emp.pfAmount || 0;
    const isRechargeReimbursed = (emp.rechargePaidBy || '').includes('Employee');
    
    const net = gross + (adj.bonus || 0) + (adj.variable || 0) + (isRechargeReimbursed ? (adj.recharge || 0) : 0) - pf;
    totalNetPay += net;

    if (emp.paidBy === 'Management') {
      mgmtCount++;
      mgmtTotalNet += net;
    } else {
      partnerCount++;
      partnerTotalNet += net;
    }

    // Statutory PF (emp + employer match) + ESI
    const stat = (pf * 2);
    totalStatutory += stat;

    // Staff Welfare (Aditya Birla)
    if (emp.insuranceType === 'Aditya Birla') {
      totalStaffWelfare += 1470;
    } else if (emp.insuranceType === 'ESI' || (gross <= 21000 && emp.insuranceType !== 'None')) {
      totalStatutory += Math.round(gross * 0.04);
    }

    if (!isRechargeReimbursed) {
      totalRecharge += (adj.recharge || 0);
    }
  });

  const totalCashOutflow = totalNetPay + totalStatutory + totalStaffWelfare + totalRecharge;

  const handleBookPayrollExpenses = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        branchCode: initialBranch || 'Pune (FC Road) ★',
        month: payMonth,
        paymentDate,
        account: paidFrom,
        netSalaryTotal: totalNetPay,
        statutoryTotal: totalStatutory,
        staffWelfareTotal: totalStaffWelfare,
        rechargeTotal
      };

      const res = await fetch('/api/payroll/run', {
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

  return (
    <div className="modal-overlay-backdrop">
      <div className="modal-dialog-container animate-modal-up" style={{ maxWidth: '820px', width: '95%' }}>
        
        {/* Header */}
        <div className="modal-header-bar">
          <h3 className="modal-title-text" style={{ fontSize: '18px', fontWeight: '800' }}>
            Pay salaries · monthly payroll run
          </h3>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleBookPayrollExpenses} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          
          <div className="modal-body-scroll" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* What this does Tip Box */}
            <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1.5px solid rgba(59, 130, 246, 0.3)', borderRadius: '14px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: '900', color: '#3b82f6' }}>What this does</span>
              <p style={{ fontSize: '12px', color: 'var(--text-slate-300)', margin: 0, lineHeight: 1.4 }}>
                Books expense vouchers for the selected month: <strong style={{ color: '#fff' }}>Salaries</strong> (net pay sum), <strong style={{ color: '#fff' }}>Statutory Payments</strong> (full PF + ESI incl. employer share), and <strong style={{ color: '#fff' }}>Internet & Communication</strong> (any employer-paid recharges). All amounts feed into P&L and 50-50 settlement automatically.
              </p>
            </div>

            {/* Inputs Grid: PAY FOR MONTH, PAYMENT DATE, PAID FROM, SPLIT BY PAID-BY */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-white)', display: 'block', marginBottom: '4px' }}>
                  PAY FOR MONTH <span style={{ color: '#fb7185' }}>*</span>
                </label>
                <input
                  type="text"
                  value={payMonth}
                  onChange={(e) => setPayMonth(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', fontWeight: 'bold', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-white)', display: 'block', marginBottom: '4px' }}>
                  PAYMENT DATE <span style={{ color: '#fb7185' }}>*</span>
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-white)', display: 'block', marginBottom: '4px' }}>
                  PAID FROM <span style={{ color: '#fb7185' }}>*</span>
                </label>
                <select
                  value={paidFrom}
                  onChange={(e) => setPaidFrom(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', fontWeight: 'bold', outline: 'none' }}
                >
                  <option value="Cash">Cash</option>
                  <option value="IDFC Main">IDFC Main</option>
                  <option value="Non IDFC">Non IDFC</option>
                </select>
                <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)', display: 'block', marginTop: '4px' }}>
                  Salaries auto-split by each employee's "Paid by" — Mgmt-paid go from IDFC/Cash, Partner-paid from Non-IDFC/Cash.
                </span>
              </div>

              {/* SPLIT BY PAID-BY Box */}
              <div style={{ background: 'var(--bg-card)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', letterSpacing: '0.5px' }}>
                  SPLIT BY PAID-BY
                </span>
                <span style={{ fontSize: '13px', fontWeight: '900', color: '#d97706' }}>
                  {partnerCount} Partner · ₹{partnerTotalNet.toLocaleString('en-IN')} net
                </span>
                {mgmtCount > 0 && (
                  <span style={{ fontSize: '13px', fontWeight: '900', color: '#6366f1' }}>
                    {mgmtCount} Management · ₹{mgmtTotalNet.toLocaleString('en-IN')} net
                  </span>
                )}
              </div>
            </div>

            {/* PAYROLL PREVIEW TABLE */}
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--tf-teal-primary)', letterSpacing: '0.6px', display: 'block', marginTop: '6px' }}>
              PAYROLL PREVIEW — EDIT BONUS / VARIABLE / RECHARGE PER EMPLOYEE
            </span>

            <div className="portal-table-container">
              <table className="portal-data-table">
                <thead>
                  <tr>
                    <th>EMPLOYEE · PAID BY</th>
                    <th>GROSS + ADD-ONS</th>
                    <th style={{ width: '100px' }}>BONUS (₹)</th>
                    <th style={{ width: '100px' }}>VARIABLE (₹)</th>
                    <th style={{ width: '100px' }}>RECHARGE (₹)</th>
                    <th style={{ textAlign: 'right' }}>NET PAY</th>
                  </tr>
                </thead>
                <tbody>
                  {activeEmployees.map((emp) => {
                    const id = emp.id || emp._id;
                    const adj = empAdjustments[id] || { bonus: 0, variable: 0, recharge: 0 };
                    const gross = emp.grossSalary || 0;
                    const pf = emp.pfDeduction || emp.pfAmount || 0;
                    const isRechargeReimbursed = (emp.rechargePaidBy || '').includes('Employee');
                    const net = gross + (adj.bonus || 0) + (adj.variable || 0) + (isRechargeReimbursed ? (adj.recharge || 0) : 0) - pf;

                    return (
                      <tr key={id}>
                        <td>
                          <strong style={{ display: 'block', color: '#fff', fontSize: '13px' }}>{emp.name}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block' }}>{emp.designation}</span>
                          <span className={`badge-pill ${emp.paidBy === 'Management' ? 'badge-partial' : 'badge-paid'}`} style={{ fontSize: '9.5px', marginTop: '4px', display: 'inline-block' }}>
                            {emp.paidBy || 'PARTNER'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: 'var(--text-slate-300)', display: 'block' }}>Gross ₹{gross.toLocaleString('en-IN')}</span>
                          <span style={{ fontSize: '11px', color: '#fb7185', display: 'block' }}>-PF ₹{pf.toLocaleString('en-IN')}</span>
                          {emp.insuranceType === 'Aditya Birla' && <span style={{ fontSize: '11px', color: '#818cf8', display: 'block' }}>AB ₹1,470</span>}
                        </td>
                        <td>
                          <input
                            type="number"
                            value={adj.bonus}
                            onChange={(e) => handleAdjChange(id, 'bonus', e.target.value)}
                            style={{ width: '80px', padding: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '12px', outline: 'none' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={adj.variable}
                            onChange={(e) => handleAdjChange(id, 'variable', e.target.value)}
                            style={{ width: '80px', padding: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '12px', outline: 'none' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={adj.recharge}
                            onChange={(e) => handleAdjChange(id, 'recharge', e.target.value)}
                            style={{ width: '80px', padding: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '12px', outline: 'none' }}
                          />
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '900', color: '#d97706', fontSize: '14px' }}>
                          ₹{net.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Blue Expense Summary Calculation Box */}
            <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1.5px solid rgba(59, 130, 246, 0.3)', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Salaries expense (net pay sum) <span style={{ fontSize: '11px', color: 'var(--text-slate-400)' }}>- split by paid-by</span></span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--tf-teal-primary)', fontWeight: '900' }}>₹{totalNetPay.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Statutory expense (PF emp+er · ESI emp+er)
                  <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontSize: '9.5px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>100% MGMT</span>
                </span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{totalStatutory.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Aditya Birla premium (Staff Welfare)
                  <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontSize: '9.5px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>100% MGMT</span>
                </span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{totalStaffWelfare.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Recharge expense (employer-paid) <span style={{ fontSize: '11px', color: 'var(--text-slate-400)' }}>- split by paid-by</span></span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{totalRecharge.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ borderTop: '1px dashed rgba(59, 130, 246, 0.4)', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '15px' }}>
                <span>Total cash outflow</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--tf-teal-primary)' }}>₹{totalCashOutflow.toLocaleString('en-IN')}</span>
              </div>

              {/* Note inside summary */}
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '10px 12px', fontSize: '11.5px', color: '#f59e0b', marginTop: '6px' }}>
                <strong>Note:</strong> Statutory (PF + ESI) and Aditya Birla premiums are <strong>100% Management-borne</strong> — they don't enter the 50-50 partner split. Only Salaries and Recharge follow each employee's "Paid by" tag.
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer-bar" style={{ padding: '14px 20px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '9px 18px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-slate-300)', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary-green"
              style={{ background: 'var(--tf-teal-primary)', padding: '9px 22px', fontSize: '13px' }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Booking expenses...' : 'Book expenses for this month'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
