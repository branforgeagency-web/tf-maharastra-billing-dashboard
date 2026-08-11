import React, { useState, useEffect } from 'react';
import { Search, Plus, FileSpreadsheet, Eye, Trash2, ArrowLeft, AlertTriangle, Edit, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreateReceiptModal from '../components/CreateReceiptModal';
import CreateVoucherModal from '../components/CreateVoucherModal';
import ImportReceiptsModal from '../components/ImportReceiptsModal';
import ReceiptViewModal from '../components/ReceiptViewModal';

export default function IncomeExpenseView({ selectedBranch, setSelectedBranch }) {
  const [subTab, setSubTab] = useState('receipts'); // 'receipts' | 'vouchers'
  const [voucherViewMode, setVoucherViewMode] = useState('list'); // 'list' | 'breakdown'
  
  const [receipts, setReceipts] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All status');
  const [receiptTypeFilter, setReceiptTypeFilter] = useState('All receipt types');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Voucher Filters State
  const [voucherSearch, setVoucherSearch] = useState('');
  const [voucherCategoryFilter, setVoucherCategoryFilter] = useState('All categories');
  const [voucherPocketFilter, setVoucherPocketFilter] = useState('All pockets');

  // Modals State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [editingVoucher, setEditingVoucher] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedBranch, searchTerm, statusFilter, receiptTypeFilter, startDate, endDate]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedBranch) params.append('branch', selectedBranch);
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'All status') params.append('status', statusFilter);
      if (receiptTypeFilter !== 'All receipt types') params.append('category', receiptTypeFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const [rRes, vRes] = await Promise.all([
        fetch(`/api/receipts?${params.toString()}`),
        fetch(`/api/vouchers?${params.toString()}`)
      ]);

      const rData = await rRes.json();
      const vData = await vRes.json();

      setReceipts(Array.isArray(rData) ? rData : []);
      setVouchers(Array.isArray(vData) ? vData : []);
    } catch (e) {
      console.error(e);
      setReceipts([]);
      setVouchers([]);
    }
  };

  const handleDeleteReceipt = async (id) => {
    if (!window.confirm('Delete receipt record?')) return;
    try {
      await fetch(`/api/receipts/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteVoucher = async (id) => {
    if (!window.confirm('Delete voucher record?')) return;
    try {
      await fetch(`/api/vouchers/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLegacy = async () => {
    if (!window.confirm('Delete all LEGACY imported receipts? Real receipts will not be touched.')) return;
    try {
      const res = await fetch('/api/receipts/delete-legacy', { method: 'POST' });
      const d = await res.json();
      alert(d.message || 'Legacy records cleared');
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCleanupDuplicates = async () => {
    if (!window.confirm('Scan and cleanup duplicate receipt numbers?')) return;
    try {
      const res = await fetch('/api/receipts/cleanup-duplicates', { method: 'POST' });
      const d = await res.json();
      alert(d.message || 'Duplicates cleaned');
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(receipts.map(r => r.id || r._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Aggregations
  const totalCollected = receipts.reduce((a, r) => a + (r.amountPayingNow || 0), 0);
  const totalPending = receipts.reduce((a, r) => a + (r.pendingBalance || 0), 0);
  const totalExpenses = vouchers.reduce((a, v) => a + (v.amount || 0), 0);

  const branchCode = selectedBranch?.includes('Kolhapur') ? 'KP' : selectedBranch?.includes('Pune') ? 'PN' : 'SL';
  const branchDisplayName = selectedBranch ? selectedBranch.replace('★', '').trim() : 'Salem';

  // Voucher Filtering
  const filteredVouchers = vouchers.filter(v => {
    const matchesSearch = !voucherSearch || 
      v.title?.toLowerCase().includes(voucherSearch.toLowerCase()) ||
      v.payeeVendor?.toLowerCase().includes(voucherSearch.toLowerCase()) ||
      v.category?.toLowerCase().includes(voucherSearch.toLowerCase()) ||
      v.voucherNo?.toLowerCase().includes(voucherSearch.toLowerCase());

    const matchesCategory = voucherCategoryFilter === 'All categories' || v.category === voucherCategoryFilter;
    
    const matchesPocket = voucherPocketFilter === 'All pockets' || 
      (voucherPocketFilter === 'Partner Cash' && v.party === 'Partner' && v.account === 'Cash') ||
      (voucherPocketFilter === 'Partner Non-IDFC' && v.party === 'Partner' && v.account !== 'Cash') ||
      (voucherPocketFilter === 'Management IDFC' && v.party === 'Management');

    return matchesSearch && matchesCategory && matchesPocket;
  });

  // Monthly Breakdown Aggregation for Vouchers
  const monthlyCategoryBreakdown = filteredVouchers.reduce((acc, v) => {
    const cat = v.category || 'Miscellaneous Expenses';
    acc[cat] = (acc[cat] || 0) + (v.amount || 0);
    return acc;
  }, {});

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Top Title Bar with Import Action */}
      <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/income-expense" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-slate-400)', textDecoration: 'none', fontWeight: '600' }}>
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(5, 150, 105, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            ₹
          </div>

          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-white)' }}>
              Income & Expense
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: '2px 0 0 0' }}>
              Receipts & vouchers · {branchDisplayName}
            </p>
          </div>
        </div>

        <button onClick={() => setIsImportModalOpen(true)} style={{ padding: '9px 16px', background: 'rgba(13, 148, 136, 0.12)', color: '#0d9488', border: '1px solid rgba(13, 148, 136, 0.3)', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileSpreadsheet className="w-4 h-4" />
          <span>Import from billing software</span>
        </button>
      </div>

      {/* Branch Banner Card */}
      <div style={{ background: 'var(--bg-card)', padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--border-color)', borderLeft: '4px solid #0d9488', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(13, 148, 136, 0.12)', color: '#0d9488', fontWeight: '900', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(13, 148, 136, 0.3)' }}>
            {branchCode}
          </div>
          <div>
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', letterSpacing: '0.5px' }}>SHOWING DATA FOR</span>
            <h2 style={{ fontSize: '16px', fontWeight: '800', margin: '2px 0', color: 'var(--text-white)' }}>{branchDisplayName}</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: 0 }}>
              50-50 franchise partnership
            </p>
          </div>
        </div>

        {setSelectedBranch && (
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            style={{ padding: '8px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontWeight: '700', fontSize: '13px', outline: 'none', cursor: 'pointer', minWidth: '180px' }}
          >
            <option value="Pune (FC Road) ★">Pune (FC Road) ★</option>
            <option value="Kolhapur (Tarabai Park) ★">Kolhapur (Tarabai Park) ★</option>
            <option value="All Branches (Global View)">All Branches (Global View)</option>
          </select>
        )}
      </div>

      {/* Sub-Tabs: Income vs Expenses */}
      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px' }}>
        <button
          onClick={() => setSubTab('receipts')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'receipts' ? '2.5px solid #0d9488' : '2.5px solid transparent',
            color: subTab === 'receipts' ? '#0d9488' : 'var(--text-slate-400)',
            fontWeight: '800',
            fontSize: '14px',
            padding: '8px 12px 12px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>Income</span>
          <span className="sidebar-badge badge-emerald" style={{ fontSize: '11px', padding: '2px 8px' }}>
            {receipts.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('vouchers')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'vouchers' ? '2.5px solid #0d9488' : '2.5px solid transparent',
            color: subTab === 'vouchers' ? '#0d9488' : 'var(--text-slate-400)',
            fontWeight: '800',
            fontSize: '14px',
            padding: '8px 12px 12px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>Expenses</span>
          <span className="sidebar-badge badge-rose" style={{ fontSize: '11px', padding: '2px 8px' }}>
            {vouchers.length}
          </span>
        </button>
      </div>

      {/* Main Income View */}
      {subTab === 'receipts' && (
        <>
          {/* Sub-Header & Primary Action */}
          <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--text-white)' }}>
                Income — Receipts
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: '2px 0 0 0' }}>
                {branchDisplayName} branch · <strong>{receipts.length} receipts</strong> · <strong style={{ color: 'var(--emerald-primary)' }}>₹{totalCollected.toLocaleString('en-IN')} collected</strong> · <strong style={{ color: '#fb7185' }}>₹{totalPending.toLocaleString('en-IN')} pending</strong>
              </p>
            </div>

            <button onClick={() => setIsReceiptModalOpen(true)} className="btn-primary-green" style={{ background: '#0d9488', padding: '9px 18px', fontSize: '13.5px' }}>
              <Plus className="w-4 h-4" />
              <span>New receipt</span>
            </button>
          </div>

          {/* Search & Filter Controls Toolbar */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '10px', background: 'var(--bg-card)', padding: '14px 18px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ position: 'relative' }}>
              <Search className="w-4 h-4 text-slate-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by student name, receipt no, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 36px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '12.5px', outline: 'none' }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '12.5px', outline: 'none' }}
            >
              <option value="All status">All status</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>

            <select
              value={receiptTypeFilter}
              onChange={(e) => setReceiptTypeFilter(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '12.5px', outline: 'none' }}
            >
              <option value="All receipt types">All receipt types</option>
              <option value="Course Fee">Course Fee</option>
              <option value="Exam Fee">Exam Fee</option>
              <option value="Book Fee">Book Fee</option>
              <option value="College Revenue">College Revenue</option>
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '12px', outline: 'none' }}
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '12px', outline: 'none' }}
            />
          </div>

          {/* Utility Action Warning Bar (Delete LEGACY & Cleanup Duplicates) */}
          <div style={{ background: 'rgba(254, 243, 199, 0.05)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '10px 16px', borderRadius: '12px', display: 'flex', justifyBetween: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={handleDeleteLegacy} style={{ padding: '6px 14px', background: 'rgba(244, 63, 94, 0.1)', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                Delete LEGACY imports...
              </button>

              <button onClick={handleCleanupDuplicates} style={{ padding: '6px 14px', background: 'rgba(217, 119, 6, 0.1)', color: '#d97706', border: '1px solid rgba(217, 119, 6, 0.3)', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                Cleanup duplicates...
              </button>
            </div>

            <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Use to undo a wrong bulk-import. Doesn't touch any real receipts.
            </span>
          </div>

          {/* Receipts Table */}
          <div className="portal-table-container">
            <table className="portal-data-table">
              <thead>
                <tr>
                  <th style={{ width: '3%' }}>
                    <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === receipts.length && receipts.length > 0} />
                  </th>
                  <th style={{ width: '10%' }}>DATE</th>
                  <th style={{ width: '16%' }}>RECEIPT NO</th>
                  <th style={{ width: '18%' }}>STUDENT</th>
                  <th style={{ width: '18%' }}>COURSE</th>
                  <th style={{ textAlign: 'right', width: '10%' }}>TOTAL</th>
                  <th style={{ textAlign: 'right', width: '10%' }}>PAID</th>
                  <th style={{ textAlign: 'right', width: '10%' }}>PENDING</th>
                  <th style={{ textAlign: 'center', width: '8%' }}>STATUS</th>
                  <th style={{ textAlign: 'center', width: '7%' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {receipts.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-slate-400)', padding: '36px' }}>
                      No student receipts recorded for {branchDisplayName}. Click "New receipt" or "Import from billing software" to add data.
                    </td>
                  </tr>
                ) : (
                  receipts.map((r) => (
                    <tr key={r.id || r._id}>
                      <td>
                        <input type="checkbox" checked={selectedIds.includes(r.id || r._id)} onChange={() => handleSelectOne(r.id || r._id)} />
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-slate-400)' }}>
                        {r.dateOfReceipt}
                      </td>
                      <td>
                        <strong style={{ display: 'block', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}>{r.receiptNo}</strong>
                        <span style={{ fontSize: '10px', color: 'var(--text-slate-400)' }}>
                          <strong style={{ color: r.party === 'Partner' ? 'var(--emerald-primary)' : 'var(--indigo-primary)' }}>{r.party || 'Partner'}</strong> · {r.account || 'Cash'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ display: 'block', color: 'var(--text-slate-200)', fontSize: '13px' }}>{r.studentName}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)' }}>{r.cellNumber}</span>
                      </td>
                      <td>
                        <span style={{ display: 'block', color: 'var(--text-slate-300)', fontSize: '12.5px' }}>{r.course}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                        ₹{(r.courseFee || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 'bold', color: 'var(--emerald-primary)' }}>
                        ₹{(r.amountPayingNow || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '13px', color: (r.pendingBalance || 0) > 0 ? '#fb7185' : 'var(--text-slate-400)' }}>
                        ₹{(r.pendingBalance || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge-pill ${r.status === 'Paid' ? 'badge-paid' : r.status === 'Partial' ? 'badge-partial' : 'badge-pending'}`}>
                          {r.status || 'Partial'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button onClick={() => setEditingReceipt(r)} className="action-btn" title="Edit Receipt"><Edit className="w-3.5 h-3.5 text-teal-500" /></button>
                          <button onClick={() => setViewingReceipt(r)} className="action-btn" title="View Receipt Invoice"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteReceipt(r.id || r._id)} className="action-btn" style={{ color: '#fb7185' }} title="Delete Receipt"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Main Expenses View (Matching Screenshot Exact Layout) */}
      {subTab === 'vouchers' && (
        <>
          {/* Sub-Header Bar & Action Controls */}
          <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--text-white)' }}>
                Expenses — Vouchers
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: '2px 0 0 0' }}>
                {branchDisplayName} branch · <strong>{vouchers.length} vouchers</strong> · <strong style={{ color: 'var(--text-white)' }}>₹{totalExpenses.toLocaleString('en-IN')} total spent</strong>
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* View Toggle Mode Selector: List vs Monthly Breakdown */}
              <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-input)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => setVoucherViewMode('list')}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: '700',
                    borderRadius: '8px',
                    border: 'none',
                    background: voucherViewMode === 'list' ? 'var(--bg-card)' : 'transparent',
                    color: voucherViewMode === 'list' ? 'var(--text-white)' : 'var(--text-slate-400)',
                    boxShadow: voucherViewMode === 'list' ? 'var(--shadow-card)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  List
                </button>
                <button
                  onClick={() => setVoucherViewMode('breakdown')}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: '700',
                    borderRadius: '8px',
                    border: 'none',
                    background: voucherViewMode === 'breakdown' ? 'var(--bg-card)' : 'transparent',
                    color: voucherViewMode === 'breakdown' ? 'var(--text-white)' : 'var(--text-slate-400)',
                    boxShadow: voucherViewMode === 'breakdown' ? 'var(--shadow-card)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  Monthly breakdown
                </button>
              </div>

              <button onClick={() => setIsVoucherModalOpen(true)} className="btn-primary-green" style={{ background: '#0d9488', padding: '9px 18px', fontSize: '13px' }}>
                <Plus className="w-4 h-4" />
                <span>New voucher</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '10px', background: 'var(--bg-card)', padding: '14px 18px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ position: 'relative' }}>
              <Search className="w-4 h-4 text-slate-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by payee, category,"
                value={voucherSearch}
                onChange={(e) => setVoucherSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 36px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '12.5px', outline: 'none' }}
              />
            </div>

            <select
              value={voucherCategoryFilter}
              onChange={(e) => setVoucherCategoryFilter(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '12.5px', outline: 'none' }}
            >
              <option value="All categories">All categories</option>
              <option value="Salaries">Salaries</option>
              <option value="Statutory Payments (PF, PT & ESI)">Statutory Payments (PF, PT & ESI)</option>
              <option value="Rent & Maintenance">Rent & Maintenance</option>
              <option value="Electricity (EB)">Electricity (EB)</option>
              <option value="IT & Software">IT & Software</option>
              <option value="TF App Payment">TF App Payment</option>
              <option value="Google Suite (Email / Workspace)">Google Suite (Email / Workspace)</option>
              <option value="Zoom Subscription">Zoom Subscription</option>
              <option value="Marketing & Advertisements">Marketing & Advertisements</option>
              <option value="Internet & Communication">Internet & Communication</option>
              <option value="Daily Pooja">Daily Pooja</option>
              <option value="Stationery & Supplies">Stationery & Supplies</option>
              <option value="Office Maintenance & Cleaning Supplies">Office Maintenance & Cleaning Supplies</option>
              <option value="Office Utilities — Water Supply">Office Utilities — Water Supply</option>
              <option value="Training & Education">Training & Education</option>
              <option value="Travel & Conveyance">Travel & Conveyance</option>
              <option value="Staff Welfare">Staff Welfare</option>
              <option value="Student Welfare">Student Welfare</option>
              <option value="Cultural Expenses">Cultural Expenses</option>
              <option value="Systems & Hardware">Systems & Hardware</option>
              <option value="Courier">Courier</option>
              <option value="Transportation">Transportation</option>
              <option value="Taxes (GST, Corporation, etc.)">Taxes (GST, Corporation, etc.)</option>
              <option value="Donations">Donations</option>
              <option value="Miscellaneous Expenses">Miscellaneous Expenses</option>
              <option value="Lead Incentive Paid">Lead Incentive Paid</option>
              <option value="Exam Fee Paid to Certification Body (Pass-through)">Exam Fee Paid to Certification Body (Pass-through)</option>
            </select>

            <select
              value={voucherPocketFilter}
              onChange={(e) => setVoucherPocketFilter(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '12.5px', outline: 'none' }}
            >
              <option value="All pockets">All pockets</option>
              <option value="Partner Cash">Partner Cash</option>
              <option value="Partner Non-IDFC">Partner Non-IDFC</option>
              <option value="Management IDFC">Management IDFC</option>
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '12px', outline: 'none' }}
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '12px', outline: 'none' }}
            />
          </div>

          {/* LIST VIEW MODE */}
          {voucherViewMode === 'list' ? (
            <div className="portal-table-container">
              <table className="portal-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '12%' }}>DATE</th>
                    <th style={{ width: '18%' }}>VOUCHER NO</th>
                    <th style={{ width: '22%' }}>PAYEE</th>
                    <th style={{ width: '20%' }}>CATEGORY</th>
                    <th style={{ width: '13%' }}>POCKET</th>
                    <th style={{ textAlign: 'right', width: '10%' }}>AMOUNT</th>
                    <th style={{ textAlign: 'center', width: '5%' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVouchers.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-slate-400)', padding: '36px' }}>
                        No expense vouchers recorded for {branchDisplayName}. Click "New voucher" to add expenses.
                      </td>
                    </tr>
                  ) : (
                    filteredVouchers.map((v) => (
                      <tr key={v.id || v._id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-slate-400)' }}>{v.voucherDate}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-slate-400)' }}>{v.voucherNo || `VCH/${branchCode}/2026/0100`}</td>
                        <td>
                          <strong style={{ display: 'block', color: '#fff', fontSize: '13px' }}>{v.title || v.payeeVendor}</strong>
                        </td>
                        <td>
                          <span className="sidebar-badge badge-cyan" style={{ fontSize: '10px', padding: '3px 8px' }}>
                            {v.category || 'Miscellaneous Expenses'}
                          </span>
                        </td>
                        <td>
                          <strong style={{ display: 'block', color: 'var(--text-slate-200)', fontSize: '12px' }}>{v.party || 'Partner'}</strong>
                          <span style={{ fontSize: '10px', color: 'var(--text-slate-400)' }}>{v.account || 'Cash'}</span>
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: '#fb7185', fontSize: '13.5px' }}>
                          ₹{(v.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button onClick={() => setEditingVoucher(v)} className="action-btn" style={{ color: 'var(--text-slate-400)', padding: '4px' }} title="Edit Voucher">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteVoucher(v.id || v._id)} className="action-btn" style={{ color: '#fb7185', padding: '4px' }} title="Delete Voucher">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* MONTHLY BREAKDOWN VIEW MODE */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {Object.entries(monthlyCategoryBreakdown).map(([cat, amt]) => (
                <div key={cat} style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--cyan-primary)', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                    {cat}
                  </span>
                  <div style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: '#fb7185' }}>
                    ₹{amt.toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', marginTop: '4px', display: 'block' }}>
                    Total spent in category
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <CreateReceiptModal
        isOpen={isReceiptModalOpen || !!editingReceipt}
        onClose={() => { setIsReceiptModalOpen(false); setEditingReceipt(null); }}
        onSaveSuccess={(newR) => { fetchData(); if (newR && !editingReceipt) setViewingReceipt(newR); setEditingReceipt(null); }}
        initialBranch={selectedBranch}
        initialData={editingReceipt}
      />

      <CreateVoucherModal
        isOpen={isVoucherModalOpen || !!editingVoucher}
        onClose={() => { setIsVoucherModalOpen(false); setEditingVoucher(null); }}
        onSaveSuccess={() => { fetchData(); setEditingVoucher(null); }}
        initialBranch={selectedBranch}
        initialData={editingVoucher}
      />

      <ImportReceiptsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => fetchData()}
      />

      <ReceiptViewModal
        isOpen={!!viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        receipt={viewingReceipt}
      />

    </div>
  );
}
