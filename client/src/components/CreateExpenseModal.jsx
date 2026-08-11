import React, { useState } from 'react';
import { X, DollarSign, Calendar, Tag, UserCheck, AlertTriangle, ArrowRight } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Salaries',
  'Office Rent',
  'Electricity & Utilities',
  'Courier & Logistics',
  'Marketing & Ads',
  'Software & Subscriptions',
  'Stationery & Printing',
  'Miscellaneous'
];

export default function CreateExpenseModal({ isOpen, onClose, onSaveSuccess, initialBranch = 'Salem' }) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    expense_date: today,
    category: 'Salaries',
    title: '',
    amount: '',
    party: 'Partner',
    account_type: 'Cash',
    vendor: '',
    notes: '',
    branch_code: initialBranch
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAccountTypeSelect = (accType) => {
    if (accType === 'IDFC Main') {
      setFormData(prev => ({
        ...prev,
        account_type: 'IDFC Main',
        party: 'Management' // IDFC Main constraint rule
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        account_type: accType
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg('Please enter expense title');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setErrorMsg('Please enter a valid expense amount');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save expense');
      }

      const savedExpense = await res.json();
      setIsSubmitting(false);
      onSaveSuccess(savedExpense);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.message);
    }
  };

  if (!isOpen) return null;

  const isIdfcLocked = formData.account_type === 'IDFC Main';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto animate-slide-up">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Record Operational Expense</h2>
              <p className="text-xs text-slate-400">Log branch expenditure with pocket allocation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-200 text-sm">
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Expense Date</label>
              <input
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-sm focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-rose-500 focus:outline-none"
              >
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Expense Title / Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. August Office Premises Rent / Staff Salary"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Amount (₹) *</label>
              <input
                type="number"
                required
                placeholder="25000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono font-bold text-sm text-rose-400 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Vendor / Payee</label>
              <input
                type="text"
                placeholder="e.g. Salem Commercial Props"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Account Selection & Pocket Routing */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-3">
            <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">Account Routing & Pocket</span>
            
            {isIdfcLocked && (
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>IDFC Main selected: Party locked to <strong>Management</strong>.</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Payment Account</label>
                <select
                  value={formData.account_type}
                  onChange={(e) => handleAccountTypeSelect(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium focus:outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="Non IDFC">Non IDFC (Local Bank)</option>
                  <option value="IDFC Main">IDFC Main (Shared-Mgmt)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Debited Pocket</label>
                <select
                  disabled={isIdfcLocked}
                  value={formData.party}
                  onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium focus:outline-none disabled:opacity-50"
                >
                  <option value="Partner">Partner (Franchisee)</option>
                  <option value="Management">Management (HQ)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : 'Save Expense'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
