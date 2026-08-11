import React, { useState } from 'react';
import { X, DollarSign, Tag, AlertTriangle, Lightbulb, CheckSquare, Plus, FileText, Building2, Wallet } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Salaries',
  'Statutory Payments (PF, PT & ESI)',
  'Rent & Maintenance',
  'Electricity (EB)',
  'IT & Software',
  'TF App Payment',
  'Google Suite (Email / Workspace)',
  'Zoom Subscription',
  'Marketing & Advertisements',
  'Internet & Communication',
  'Daily Pooja',
  'Stationery & Supplies',
  'Office Maintenance & Cleaning Supplies',
  'Office Utilities — Water Supply',
  'Training & Education',
  'Travel & Conveyance',
  'Staff Welfare',
  'Student Welfare',
  'Cultural Expenses',
  'Systems & Hardware',
  'Courier',
  'Transportation',
  'Taxes (GST, Corporation, etc.)',
  'Donations',
  'Miscellaneous Expenses',
  'Lead Incentive Paid',
  'Exam Fee Paid to Certification Body (Pass-through)'
];

export default function CreateVoucherModal({ isOpen, onClose, onSaveSuccess, initialBranch = 'Pune (FC Road) ★', initialData = null }) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    voucherDate: today,
    category: 'Salaries',
    payeeVendor: '',
    invoiceRef: '',
    notes: '',
    amount: '',
    hasGst: false,
    party: 'Partner',
    account: 'Cash',
    isCapitalAsset: false,
    branchCode: initialBranch || 'Pune (FC Road) ★'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        voucherDate: initialData.voucherDate || today,
        category: initialData.category || 'Salaries',
        payeeVendor: initialData.payeeVendor || '',
        invoiceRef: initialData.invoiceRef || '',
        notes: initialData.notes || initialData.title || '',
        amount: initialData.amount || '',
        hasGst: !!initialData.hasGst,
        party: initialData.party || 'Partner',
        account: initialData.account || 'Cash',
        isCapitalAsset: !!initialData.isCapitalAsset,
        branchCode: initialData.branchCode || initialBranch || 'Pune (FC Road) ★'
      });
    } else {
      setFormData({
        voucherDate: today,
        category: 'Salaries',
        payeeVendor: '',
        invoiceRef: '',
        notes: '',
        amount: '',
        hasGst: false,
        party: 'Partner',
        account: 'Cash',
        isCapitalAsset: false,
        branchCode: initialBranch || 'Pune (FC Road) ★'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Live Amount & GST calculations
  const totalAmount = parseFloat(formData.amount) || 0;
  const baseAmount = formData.hasGst ? Math.round((totalAmount / 1.18) * 100) / 100 : totalAmount;
  const gstAmount = Math.round((totalAmount - baseAmount) * 100) / 100;

  const handleAccountSelect = (acc) => {
    if (acc === 'IDFC Main') {
      setFormData(prev => ({ ...prev, account: acc, party: 'Management' }));
    } else {
      setFormData(prev => ({ ...prev, account: acc }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.payeeVendor.trim() || totalAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        title: formData.notes || `${formData.category} - ${formData.payeeVendor}`,
        amount: totalAmount,
        baseAmount,
        gstAmount,
        branchCode: formData.branchCode || initialBranch || 'Pune (FC Road) ★'
      };

      const isEdit = initialData && (initialData.id || initialData._id);
      const targetId = initialData ? (initialData.id || initialData._id) : '';
      const url = isEdit ? `/api/vouchers/${targetId}` : '/api/vouchers';
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
        // Reset form
        setFormData({
          voucherDate: today,
          category: 'Salaries',
          payeeVendor: '',
          invoiceRef: '',
          notes: '',
          amount: '',
          hasGst: false,
          party: 'Partner',
          account: 'Cash',
          isCapitalAsset: false,
          branchCode: initialBranch || 'Pune (FC Road) ★'
        });
      }
    } catch (err) {
      console.error('Error saving voucher:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay-backdrop animate-fade-in">
      <div className="modal-dialog-container animate-modal-up" style={{ maxWidth: '620px', maxHeight: '92vh' }}>
        
        {/* Header Bar */}
        <div className="modal-header-bar">
          <h3 className="modal-title-text" style={{ fontSize: '18px', fontWeight: '800' }}>
            Create new voucher
          </h3>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          
          <div className="modal-body-scroll" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 1. VOUCHER DATE */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: 'var(--tf-teal-primary)', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>
                VOUCHER DATE
              </span>

              {/* Tip Box */}
              <div style={{ background: 'rgba(0, 137, 123, 0.06)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(0, 137, 123, 0.25)', fontSize: '11.5px', color: 'var(--text-slate-200)', lineHeight: '1.5', marginBottom: '10px' }}>
                💡 <strong>Tip - use the date you actually paid</strong>, not the invoice date. Cash basis keeps Treasury honest and matches your bank statement. Example: April electricity bill paid on May 5 → date this voucher <strong>May 5</strong>, not April 28. One exception: for big annual bills (insurance, AMC), split into 12 monthly vouchers.
              </div>

              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>
                DATE *
              </label>
              <input
                type="date"
                required
                value={formData.voucherDate}
                onChange={(e) => setFormData({ ...formData, voucherDate: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
              />
            </div>

            {/* 2. CATEGORY */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: 'var(--tf-teal-primary)', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>
                CATEGORY
              </span>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>
                EXPENSE CATEGORY *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, isCapitalAsset: e.target.value === 'Systems & Hardware' || e.target.value === 'IT & Software' ? formData.isCapitalAsset : false })}
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', fontWeight: '700', outline: 'none', cursor: 'pointer' }}
              >
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* 3. PAYEE & DETAILS */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: 'var(--tf-teal-primary)', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>
                PAYEE & DETAILS
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>
                    PAYEE / VENDOR *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Landlord, Electricity Board"
                    value={formData.payeeVendor}
                    onChange={(e) => setFormData({ ...formData, payeeVendor: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>
                    BILL / INVOICE NO.
                  </label>
                  <input
                    type="text"
                    placeholder="Optional reference"
                    value={formData.invoiceRef}
                    onChange={(e) => setFormData({ ...formData, invoiceRef: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>
                  DESCRIPTION / NOTES
                </label>
                <input
                  type="text"
                  placeholder="What was this for?"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* 4. AMOUNT */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: 'var(--tf-teal-primary)', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>
                AMOUNT
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>
                    AMOUNT (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontWeight: 'bold', fontSize: '14px', fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>
                    GST INCLUDED?
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hasGst: false })}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        border: !formData.hasGst ? '2px solid var(--tf-teal-primary)' : '1px solid var(--border-color)',
                        background: !formData.hasGst ? 'rgba(0, 137, 123, 0.12)' : 'var(--bg-card)',
                        color: !formData.hasGst ? 'var(--tf-teal-primary)' : 'var(--text-white)',
                        fontWeight: '800',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      No GST
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hasGst: true })}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        border: formData.hasGst ? '2px solid var(--tf-teal-primary)' : '1px solid var(--border-color)',
                        background: formData.hasGst ? 'rgba(0, 137, 123, 0.12)' : 'var(--bg-card)',
                        color: formData.hasGst ? 'var(--tf-teal-primary)' : 'var(--text-white)',
                        fontWeight: '800',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      18% GST
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. PAID FROM — WHICH POCKET? */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: 'var(--tf-teal-primary)', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>
                PAID FROM — WHICH POCKET?
              </span>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-slate-400)', display: 'block', marginBottom: '6px' }}>
                  PARTY *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { p: 'Partner', sub: 'FRANCHISEE' },
                    { p: 'Management', sub: 'HQ COIMBATORE' }
                  ].map((item) => (
                    <div
                      key={item.p}
                      onClick={() => {
                        if (formData.account !== 'IDFC Main' || item.p === 'Management') {
                          setFormData({ ...formData, party: item.p });
                        }
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: formData.party === item.p ? 'rgba(0, 137, 123, 0.12)' : 'var(--bg-card)',
                        border: formData.party === item.p ? '2px solid var(--tf-teal-primary)' : '1px solid var(--border-color)',
                        cursor: (formData.account === 'IDFC Main' && item.p === 'Partner') ? 'not-allowed' : 'pointer',
                        opacity: (formData.account === 'IDFC Main' && item.p === 'Partner') ? 0.4 : 1,
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: '800', color: formData.party === item.p ? 'var(--tf-teal-primary)' : 'var(--text-white)' }}>
                        {item.p}
                      </div>
                      <div style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-slate-400)', textTransform: 'uppercase', marginTop: '2px' }}>
                        {item.sub}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-slate-400)', display: 'block', marginBottom: '6px' }}>
                  ACCOUNT *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  {[
                    { acc: 'IDFC Main', sub: 'SHARED - MGMT' },
                    { acc: 'Non IDFC', sub: 'OTHER BANKS' },
                    { acc: 'Cash', sub: 'PHYSICAL CASH' }
                  ].map((item) => (
                    <div
                      key={item.acc}
                      onClick={() => handleAccountSelect(item.acc)}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '12px',
                        background: formData.account === item.acc ? 'rgba(0, 137, 123, 0.12)' : 'var(--bg-card)',
                        border: formData.account === item.acc ? '2px solid var(--tf-teal-primary)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: '800', color: formData.account === item.acc ? 'var(--tf-teal-primary)' : 'var(--text-white)' }}>
                        {item.acc}
                      </div>
                      <div style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-slate-400)', textTransform: 'uppercase', marginTop: '2px' }}>
                        {item.sub}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How expenses are shared callout banner */}
              <div style={{ marginTop: '12px', background: 'rgba(217, 119, 6, 0.08)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(217, 119, 6, 0.3)', fontSize: '11px', color: '#b45309', lineHeight: '1.5' }}>
                💡 <strong>How expenses are shared:</strong> The Party field above only tracks <em>whose pocket paid the cash</em>. ALL operational expenses still pool together and split 50-50 in the monthly Settlement. Example: if you (Management) bought a ₹40K laptop, Partner's half (₹20K) gets automatically reimbursed to you via the settlement transfer. Same applies the other way.
              </div>
            </div>

            {/* 6. CAPITAL ASSET? */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: 'var(--tf-teal-primary)', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>
                CAPITAL ASSET?
              </span>

              <div style={{ background: 'var(--bg-card)', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12.5px', fontWeight: '700', color: 'var(--text-white)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isCapitalAsset}
                    onChange={(e) => setFormData({ ...formData, isCapitalAsset: e.target.checked })}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <span>This is a capital asset (laptop, furniture, equipment, AC, etc.)</span>
                    <span style={{ fontSize: '10.5px', fontWeight: 'normal', color: 'var(--text-slate-400)', display: 'block', marginTop: '3px', lineHeight: '1.4' }}>
                      Capital assets technically depreciate over multiple years (computers: 40% WDV/year as per IT Act). For now, the full amount is expensed in this month for the 50-50 split — but checking this flags it so we can build proper depreciation on the Balance Sheet later.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* 7. Live Calculation Box */}
            <div style={{ background: 'rgba(0, 137, 123, 0.08)', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid var(--tf-teal-primary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-slate-300)' }}>
                <span>Base amount</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>₹{baseAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '900', color: 'var(--tf-teal-primary)', paddingTop: '6px', borderTop: '1px dashed rgba(0, 137, 123, 0.4)' }}>
                <span>Total payable</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>

          {/* Footer Bar */}
          <div className="modal-footer-bar">
            <button type="button" onClick={onClose} className="action-btn">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary-green">
              <FileText className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Voucher...' : 'Save voucher'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
