import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, ArrowLeft, Zap, FileText, CheckCircle2, Trash2, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreateInvestmentModal from '../components/CreateInvestmentModal';

export default function InitialInvestmentView({ selectedBranch, setSelectedBranch }) {
  const [items, setItems] = useState([]);
  const [setupDate, setSetupDate] = useState('');
  const [setupStatus, setSetupStatus] = useState('Completed (live)');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchInvestments();
  }, [selectedBranch]);

  const fetchInvestments = async () => {
    try {
      const res = await fetch(`/api/initial-investment?branch=${encodeURIComponent(selectedBranch)}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this investment item record?')) return;
    try {
      await fetch(`/api/initial-investment/${id}`, { method: 'DELETE' });
      fetchInvestments();
    } catch (e) {
      console.error(e);
    }
  };

  const branchCode = selectedBranch?.includes('Kolhapur') ? 'KP' : 'PN';
  const branchDisplayName = selectedBranch ? selectedBranch.replace('★', '').trim() : 'Pune (FC Road)';

  const totalInvested = items.reduce((acc, item) => acc + (item.amount || 0), 0);
  const categoriesCount = new Set(items.map(i => i.category)).size;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Header Row with Breadcrumb & Primary Add Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link to="/income-expense" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-slate-400)', textDecoration: 'none', fontWeight: '600' }}>
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)' }}>
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-white)' }}>Initial Investment</h1>
              <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: '2px 0 0 0' }}>
                Setup costs, capex, and ROI tracking for this branch
              </p>
            </div>
          </div>
        </div>

        <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="btn-primary-green" style={{ padding: '9px 18px', fontSize: '13px' }}>
          <Plus className="w-4 h-4" />
          <span>Add investment item</span>
        </button>
      </div>

      {/* Branch Banner Card */}
      <div style={{ background: 'var(--bg-card)', padding: '18px 22px', borderRadius: '16px', border: '1.5px solid var(--border-color)', borderLeft: '4px solid #8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', fontWeight: '900', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            {branchCode}
          </div>
          <div>
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', letterSpacing: '0.5px' }}>SETUP COSTS FOR</span>
            <h2 style={{ fontSize: '16px', fontWeight: '800', margin: '2px 0', color: 'var(--text-white)' }}>{branchDisplayName}</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: 0 }}>
              Track every rupee invested to launch this branch · informs ROI & break-even projections
            </p>
          </div>
        </div>

        {setSelectedBranch && (
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            style={{ padding: '8px 14px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontWeight: '700', fontSize: '13px', outline: 'none', cursor: 'pointer', minWidth: '180px' }}
          >
            <option value="Pune (FC Road) ★">Pune (FC Road) ★</option>
            <option value="Kolhapur (Tarabai Park) ★">Kolhapur (Tarabai Park) ★</option>
            <option value="All Branches (Global View)">All Branches (Global View)</option>
          </select>
        )}
      </div>

      {/* 3 Metric Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        
        {/* Card 1: Total Invested (Purple) */}
        <div style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), var(--bg-card))', border: '1.5px solid rgba(139, 92, 246, 0.3)', padding: '18px', borderRadius: '16px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Briefcase className="w-4 h-4" />
            <span>TOTAL INVESTED</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--text-white)' }}>
            ₹{totalInvested.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', marginTop: '4px', display: 'block' }}>
            {items.length} items across {categoriesCount} categories
          </span>
        </div>

        {/* Card 2: Revenue Earned (Green) */}
        <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), var(--bg-card))', border: '1.5px solid rgba(16, 185, 129, 0.3)', padding: '18px', borderRadius: '16px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--emerald-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <FileText className="w-4 h-4" />
            <span>REVENUE EARNED SINCE SETUP</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--emerald-primary)' }}>
            ₹0
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', marginTop: '4px', display: 'block' }}>
            {setupDate ? `Setup date: ${setupDate}` : 'Setup date not set — add one below'}
          </span>
        </div>

        {/* Card 3: Investment Recovered (Gold) */}
        <div style={{ background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08), var(--bg-card))', border: '1.5px solid rgba(217, 119, 6, 0.3)', padding: '18px', borderRadius: '16px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--amber-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Zap className="w-4 h-4" />
            <span>INVESTMENT RECOVERED</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--amber-primary)' }}>
            0%
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', marginTop: '4px', display: 'block' }}>
            break-even ETA: —
          </span>
        </div>

      </div>

      {/* Branch Setup Date & Status Configuration Bar */}
      <div style={{ background: 'var(--bg-card)', padding: '16px 20px', borderRadius: '16px', border: '1.5px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ minWidth: 0 }}>
          <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>BRANCH SETUP DATE</label>
          <input
            type="date"
            value={setupDate}
            onChange={(e) => setSetupDate(e.target.value)}
            style={{ width: '100%', padding: '9.5px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ minWidth: 0 }}>
          <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>SETUP STATUS</label>
          <select
            value={setupStatus}
            onChange={(e) => setSetupStatus(e.target.value)}
            style={{ width: '100%', padding: '9.5px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--emerald-primary)', fontWeight: 'bold', fontSize: '13px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
          >
            <option value="Completed (live)">Completed (live)</option>
            <option value="Setting up">Setting up</option>
            <option value="Planning phase">Planning phase</option>
          </select>
        </div>
      </div>

      {/* Items Table OR Empty State Box */}
      {items.length === 0 ? (
        <div style={{ background: 'rgba(139, 92, 246, 0.03)', border: '2px dashed rgba(139, 92, 246, 0.3)', borderRadius: '20px', padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(124, 58, 237, 0.25)' }}>
            <Briefcase className="w-7 h-7" />
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-white)' }}>
              No investment items recorded yet
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-slate-400)', margin: 0, maxWidth: '560px', lineHeight: '1.6' }}>
              Click "Add investment item" to log your first setup cost. Common items like rent deposit, laptops, software licenses, and statutory fees are pre-suggested. You can also use free-form entries for anything unique.
            </p>
          </div>

          <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="btn-primary-green" style={{ marginTop: '8px', padding: '10px 20px', fontSize: '13px' }}>
            <Plus className="w-4 h-4" />
            <span>Add first item</span>
          </button>

        </div>
      ) : (
        <div className="portal-table-container">
          <table className="portal-data-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Category</th>
                <th>Vendor / Contractor</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                <th style={{ textAlign: 'center', width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id || item._id}>
                  <td><strong style={{ color: 'var(--text-white)' }}>{item.description}</strong></td>
                  <td><span className="sidebar-badge badge-cyan">{item.category}</span></td>
                  <td>{item.vendor || 'Direct'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-slate-400)' }}>{item.date}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--emerald-primary)' }}>
                    ₹{(item.amount || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="action-btn" style={{ padding: '4px' }} title="Edit Item">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteItem(item.id || item._id)} className="action-btn" style={{ color: '#fb7185', padding: '4px' }} title="Delete Item">
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

      {/* Add / Edit Investment Item Modal */}
      <CreateInvestmentModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        onSaveSuccess={() => fetchInvestments()}
        initialBranch={selectedBranch}
        initialData={editingItem}
      />

    </div>
  );
}
