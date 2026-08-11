import React, { useState, useEffect } from 'react';
import { X, Users, DollarSign, Save } from 'lucide-react';

export default function AddEmployeeModal({ isOpen, onClose, onSaveSuccess, initialBranch = 'Pune (FC Road) ★', initialData = null }) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    joiningDate: today,
    status: 'Active (included in payroll)',
    grossSalary: '25000',
    paidBy: 'Partner',
    basicSalary: '12500',
    hra: '6250',
    conveyance: '1600',
    specialAllowance: '4650',
    pfDeduction: '1800',
    insuranceType: 'None',
    defaultBonus: '0',
    defaultVariable: '0',
    mobileRecharge: '0',
    rechargePaidBy: 'Employee (we reimburse -> added to net pay)',
    branchCode: initialBranch || 'Pune (FC Road) ★'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        designation: initialData.designation || '',
        joiningDate: initialData.joiningDate || today,
        status: initialData.status || 'Active (included in payroll)',
        grossSalary: initialData.grossSalary !== undefined ? String(initialData.grossSalary) : '25000',
        paidBy: initialData.paidBy || 'Partner',
        basicSalary: initialData.basicSalary !== undefined ? String(initialData.basicSalary) : '12500',
        hra: initialData.hra !== undefined ? String(initialData.hra) : '6250',
        conveyance: initialData.conveyance !== undefined ? String(initialData.conveyance) : '1600',
        specialAllowance: initialData.specialAllowance !== undefined ? String(initialData.specialAllowance) : '4650',
        pfDeduction: initialData.pfDeduction !== undefined ? String(initialData.pfDeduction) : '1800',
        insuranceType: initialData.insuranceType || 'None',
        defaultBonus: initialData.defaultBonus !== undefined ? String(initialData.defaultBonus) : '0',
        defaultVariable: initialData.defaultVariable !== undefined ? String(initialData.defaultVariable) : '0',
        mobileRecharge: initialData.mobileRecharge !== undefined ? String(initialData.mobileRecharge) : '0',
        rechargePaidBy: initialData.rechargePaidBy || 'Employee (we reimburse -> added to net pay)',
        branchCode: initialData.branchCode || initialBranch || 'Pune (FC Road) ★'
      });
    } else {
      autoDivideGross('25000');
    }
  }, [initialData, initialBranch, isOpen]);

  const autoDivideGross = (grossVal) => {
    const g = parseFloat(grossVal) || 0;
    const b = Math.round(g * 0.5);
    const h = Math.round(b * 0.5);
    const c = g >= 20000 ? 1600 : Math.round(g * 0.05);
    const s = Math.max(0, g - (b + h + c));
    const p = Math.min(1800, Math.round(b * 0.12));

    setFormData(prev => ({
      ...prev,
      grossSalary: grossVal,
      basicSalary: String(b),
      hra: String(h),
      conveyance: String(c),
      specialAllowance: String(s),
      pfDeduction: String(p)
    }));
  };

  const handleGrossChange = (val) => {
    autoDivideGross(val);
  };

  if (!isOpen) return null;

  // Live Arithmetic calculations
  const grossNum = parseFloat(formData.grossSalary) || 0;
  const basicNum = parseFloat(formData.basicSalary) || 0;
  const hraNum = parseFloat(formData.hra) || 0;
  const convNum = parseFloat(formData.conveyance) || 0;
  const specNum = Math.max(0, grossNum - (basicNum + hraNum + convNum));
  const pfNum = parseFloat(formData.pfDeduction) || 0;

  const bonusNum = parseFloat(formData.defaultBonus) || 0;
  const varNum = parseFloat(formData.defaultVariable) || 0;
  const rechNum = parseFloat(formData.mobileRecharge) || 0;
  const isRechargeReimbursed = (formData.rechargePaidBy || '').includes('Employee');
  const addOnsTotal = bonusNum + varNum + (isRechargeReimbursed ? rechNum : 0);

  let employerIns = 0;
  if (formData.insuranceType === 'Aditya Birla') {
    employerIns = 1470;
  } else if (formData.insuranceType === 'ESI' || (grossNum <= 21000 && formData.insuranceType !== 'None')) {
    employerIns = Math.round(grossNum * 0.04);
  }

  const netPayCalculated = grossNum + addOnsTotal - pfNum;
  const companyCostCalculated = netPayCalculated + pfNum + employerIns + (!isRechargeReimbursed ? rechNum : 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || grossNum <= 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        grossSalary: grossNum,
        basicSalary: basicNum,
        hra: hraNum,
        conveyance: convNum,
        specialAllowance: specNum,
        pfDeduction: pfNum,
        pfAmount: pfNum,
        defaultBonus: bonusNum,
        defaultVariable: varNum,
        mobileRecharge: rechNum,
        netSalary: netPayCalculated,
        branchCode: formData.branchCode || initialBranch || 'Pune (FC Road) ★'
      };

      const isEdit = initialData && (initialData.id || initialData._id);
      const targetId = initialData ? (initialData.id || initialData._id) : '';
      const url = isEdit ? `/api/employees/${targetId}` : '/api/employees';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay-backdrop">
      <div className="modal-dialog-container animate-modal-up" style={{ maxWidth: '620px', width: '95%' }}>
        
        {/* Header */}
        <div className="modal-header-bar">
          <h3 className="modal-title-text" style={{ fontSize: '18px', fontWeight: '800' }}>
            {initialData ? 'Edit employee' : 'Add employee'}
          </h3>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          
          <div className="modal-body-scroll" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Section 1: EMPLOYEE IDENTITY */}
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--tf-teal-primary)', letterSpacing: '0.6px', display: 'block' }}>
              EMPLOYEE IDENTITY
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '4px' }}>
                  FULL NAME <span style={{ color: '#fb7185' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Karthik R"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '4px' }}>
                  DESIGNATION <span style={{ color: '#fb7185' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Senior Trainer"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '4px' }}>JOIN DATE</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '4px' }}>STATUS</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
                >
                  <option value="Active (included in payroll)">Active (included in payroll)</option>
                  <option value="On Leave (excluded from payroll)">On Leave (excluded from payroll)</option>
                  <option value="Resigned">Resigned</option>
                </select>
              </div>
            </div>

            {/* Section 2: SALARY STRUCTURE (MONTHLY) */}
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--tf-teal-primary)', letterSpacing: '0.6px', display: 'block', marginTop: '6px' }}>
              SALARY STRUCTURE (MONTHLY) · AUTO-DIVIDES AS YOU TYPE
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '2px' }}>
                  GROSS PAY (₹/MONTH) <span style={{ color: '#fb7185' }}>*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="25000"
                  value={formData.grossSalary}
                  onChange={(e) => handleGrossChange(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none', fontWeight: 'bold' }}
                />
                <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)', display: 'block', marginTop: '3px' }}>
                  Master figure. ESI applies only if ≤ ₹21,000.
                </span>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '2px' }}>
                  PAID BY <span style={{ color: '#fb7185' }}>*</span>
                </label>
                <select
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none', fontWeight: 'bold' }}
                >
                  <option value="Partner">Partner</option>
                  <option value="Management">Management</option>
                </select>
                <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)', display: 'block', marginTop: '3px' }}>
                  Decides which side books the salary expense. PF + ESI always go to Management regardless.
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '2px' }}>
                  BASIC SALARY (₹) <span style={{ color: '#fb7185' }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
                />
                <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)', display: 'block', marginTop: '3px' }}>
                  Default 50% of gross - drives PF
                </span>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '2px' }}>
                  HRA (₹) <span style={{ color: '#fb7185' }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.hra}
                  onChange={(e) => setFormData({ ...formData, hra: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
                />
                <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)', display: 'block', marginTop: '3px' }}>
                  Default 50% of basic = 25% of gross
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '2px' }}>
                  CONVEYANCE (₹) <span style={{ color: '#fb7185' }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.conveyance}
                  onChange={(e) => setFormData({ ...formData, conveyance: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
                />
                <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)', display: 'block', marginTop: '3px' }}>
                  Default ₹1,600 or 5% of gross
                </span>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '2px' }}>SPECIAL ALLOWANCE (₹)</label>
                <input
                  type="number"
                  readOnly
                  value={specNum}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-slate-300)', fontSize: '13px', outline: 'none' }}
                />
                <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)', display: 'block', marginTop: '3px' }}>
                  Auto = Gross - (Basic + HRA + Conveyance)
                </span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '2px' }}>PF — EMPLOYEE DEDUCTION (₹)</label>
              <input
                type="number"
                value={formData.pfDeduction}
                onChange={(e) => setFormData({ ...formData, pfDeduction: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
              />
              <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)', display: 'block', marginTop: '3px' }}>
                Auto = 12% of Basic (capped ₹1,800). Employer matches 1:1 — total PF expense = 2x.
              </span>
            </div>

            {/* Section 3: HEALTH INSURANCE */}
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--tf-teal-primary)', letterSpacing: '0.6px', display: 'block', marginTop: '6px' }}>
              HEALTH INSURANCE
            </span>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '2px' }}>INSURANCE TYPE</label>
              <select
                value={formData.insuranceType}
                onChange={(e) => setFormData({ ...formData, insuranceType: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
              >
                <option value="None">None</option>
                <option value="ESI">ESI</option>
                <option value="Aditya Birla">Aditya Birla Health Insurance</option>
              </select>
              <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)', display: 'block', marginTop: '3px' }}>
                ESI = 0.75% employee + 3.25% employer (only if Gross ≤ ₹21k). Aditya Birla = employer paid.
              </span>
            </div>

            {/* Section 4: DEFAULT MONTHLY ADD-ONS (OPTIONAL) */}
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--tf-teal-primary)', letterSpacing: '0.6px', display: 'block', marginTop: '6px' }}>
              DEFAULT MONTHLY ADD-ONS (OPTIONAL)
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '2px' }}>DEFAULT BONUS (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.defaultBonus}
                  onChange={(e) => setFormData({ ...formData, defaultBonus: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
                />
                <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)', display: 'block', marginTop: '3px' }}>
                  Recurring monthly bonus. Editable at payroll time.
                </span>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '2px' }}>DEFAULT VARIABLE PAY (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.defaultVariable}
                  onChange={(e) => setFormData({ ...formData, defaultVariable: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
                />
                <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)', display: 'block', marginTop: '3px' }}>
                  Performance linked variable. Editable at payroll time.
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '2px' }}>MOBILE RECHARGE (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.mobileRecharge}
                  onChange={(e) => setFormData({ ...formData, mobileRecharge: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-white)', display: 'block', marginBottom: '2px' }}>RECHARGE PAID BY</label>
                <select
                  value={formData.rechargePaidBy}
                  onChange={(e) => setFormData({ ...formData, rechargePaidBy: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
                >
                  <option value="Employee (we reimburse -> added to net pay)">Employee (we reimburse → added to net pay)</option>
                  <option value="Employer (direct payment)">Employer (direct payment)</option>
                </select>
              </div>
            </div>

            {/* Blue Calculation Summary Box */}
            <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1.5px solid rgba(59, 130, 246, 0.3)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Gross Pay (Basic + HRA + Conveyance + Special)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{grossNum.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60a5fa' }}>
                <span>+ Bonus + Variable + Recharge (if employee-paid)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>+₹{addOnsTotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fb7185' }}>
                <span>- PF (employee deduction)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>-₹{pfNum.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ borderTop: '1px dashed rgba(59, 130, 246, 0.4)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', color: 'var(--tf-teal-primary)', fontSize: '14px' }}>
                <span>Net Pay (to employee bank account)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{netPayCalculated.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-slate-400)', paddingTop: '4px' }}>
                <span>Company's full monthly cost (incl. employer PF + ESI + Aditya Birla)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{companyCostCalculated.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>

          {/* Footer Bar */}
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
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save employee'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
