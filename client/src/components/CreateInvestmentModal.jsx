import React, { useState, useEffect } from 'react';
import { X, Save, Building, HardDrive, Shield, Sparkles } from 'lucide-react';

const COMMON_ITEMS = [
  'Rent advance / security deposit',
  'Interior fit-out & renovation',
  'Signage & branding',
  'AC installation',
  'Electrical wiring & UPS / power backup',
  'Plumbing / water cooler',
  'Office furniture (desks, chairs, cabinets)',
  'CCTV / security',
  'Fire safety equipment'
];

export default function CreateInvestmentModal({ isOpen, onClose, onSaveSuccess, initialBranch = 'Pune (FC Road) ★', initialData = null }) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    category: 'Infrastructure & Setup',
    description: '',
    amount: '',
    date: today,
    vendor: '',
    quantity: '',
    notes: '',
    branchCode: initialBranch || 'Pune (FC Road) ★'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        category: initialData.category || 'Infrastructure & Setup',
        description: initialData.description || '',
        amount: initialData.amount !== undefined ? String(initialData.amount) : '',
        date: initialData.date || today,
        vendor: initialData.vendor || '',
        quantity: initialData.quantity || '',
        notes: initialData.notes || '',
        branchCode: initialData.branchCode || initialBranch || 'Pune (FC Road) ★'
      });
    } else {
      setFormData({
        category: 'Infrastructure & Setup',
        description: '',
        amount: '',
        date: today,
        vendor: '',
        quantity: '',
        notes: '',
        branchCode: initialBranch || 'Pune (FC Road) ★'
      });
    }
  }, [initialData, initialBranch, isOpen]);

  if (!isOpen) return null;

  const handleChipClick = (itemText) => {
    setFormData(prev => ({
      ...prev,
      description: itemText
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.amount) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        branchCode: formData.branchCode || initialBranch || 'Pune (FC Road) ★'
      };

      const isEdit = initialData && (initialData.id || initialData._id);
      const targetId = initialData ? (initialData.id || initialData._id) : '';
      const url = isEdit ? `/api/initial-investment/${targetId}` : '/api/initial-investment';
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay-backdrop">
      <div className="modal-dialog-container animate-modal-up" style={{ maxWidth: '580px', width: '95%' }}>
        
        {/* Header */}
        <div className="modal-header-bar" style={{ padding: '16px 22px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 className="modal-title-text" style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-white)' }}>
            {initialData ? 'Edit investment item' : 'Add investment item'}
          </h3>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          
          <div className="modal-body-scroll" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* 1. CATEGORY */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px', letterSpacing: '0.5px' }}>
                CATEGORY <span style={{ color: '#fb7185' }}>*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13.5px', fontWeight: '600', outline: 'none' }}
              >
                <option value="Infrastructure & Setup">🏢 Infrastructure & Setup</option>
                <option value="IT Hardware & Devices">💻 IT Hardware & Devices</option>
                <option value="Office Furniture & Fixtures">🪑 Office Furniture & Fixtures</option>
                <option value="Deposits & Advances">🔒 Deposits & Advances</option>
                <option value="Signage, Branding & Marketing">🎨 Signage, Branding & Marketing</option>
                <option value="Legal, License & Registration">📜 Legal, License & Registration</option>
                <option value="Working Capital & Initial Ops">💼 Working Capital & Initial Ops</option>
                <option value="Other Launch Costs">📦 Other Launch Costs</option>
              </select>
            </div>

            {/* 2. ITEM DESCRIPTION */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px', letterSpacing: '0.5px' }}>
                ITEM DESCRIPTION <span style={{ color: '#fb7185' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., 15 Lenovo laptops · ThinkPad E15"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13.5px', outline: 'none' }}
              />
            </div>

            {/* 3. COMMON ITEMS Quick Chips */}
            <div>
              <span style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
                COMMON ITEMS:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {COMMON_ITEMS.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => handleChipClick(item)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '16px',
                      border: '1px solid rgba(147, 51, 234, 0.3)',
                      background: 'rgba(147, 51, 234, 0.06)',
                      color: 'var(--purple-primary)',
                      fontSize: '11.5px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. AMOUNT (₹) */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px', letterSpacing: '0.5px' }}>
                AMOUNT (₹) <span style={{ color: '#fb7185' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  required
                  placeholder="₹ 0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--emerald-primary)', fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-mono)', outline: 'none' }}
                />
              </div>
            </div>

            {/* 5. DATE ACQUIRED */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px', letterSpacing: '0.5px' }}>
                DATE ACQUIRED
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
              />
            </div>

            {/* 6. VENDOR / SOURCE (OPTIONAL) */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px', letterSpacing: '0.5px' }}>
                VENDOR / SOURCE (OPTIONAL)
              </label>
              <input
                type="text"
                placeholder="e.g., Lenovo India, XYZ Interiors"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
              />
            </div>

            {/* 7. QUANTITY (OPTIONAL) */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px', letterSpacing: '0.5px' }}>
                QUANTITY (OPTIONAL)
              </label>
              <input
                type="text"
                placeholder="e.g., 15"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
              />
            </div>

            {/* 8. NOTES (OPTIONAL) */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px', letterSpacing: '0.5px' }}>
                NOTES (OPTIONAL)
              </label>
              <input
                type="text"
                placeholder="Warranty info, asset tag, invoice number..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none' }}
              />
            </div>

            {/* Yellow Tip Banner Box */}
            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1.5px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '12px 14px', fontSize: '12px', color: '#d97706', lineHeight: '1.45' }}>
              <strong>Note:</strong> This is a one-time setup investment record — separate from ongoing operating expenses (which you log under Receipts & Vouchers). Use this for capital items, deposits, registrations, and other launch costs.
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer-bar" style={{ padding: '14px 22px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
              <span>{isSubmitting ? 'Saving...' : 'Save item'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
