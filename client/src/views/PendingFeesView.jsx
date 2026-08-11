import React, { useState, useEffect } from 'react';
import { Clock, Phone, MessageSquare, Download, Upload, Plus, AlertTriangle, ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import BulkPendingUploadModal from '../components/BulkPendingUploadModal';
import CreateReceiptModal from '../components/CreateReceiptModal';

export default function PendingFeesView({ selectedBranch, setSelectedBranch }) {
  const [pendingList, setPendingList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active only');
  const [sortOption, setSortOption] = useState('Pending: high → low');
  
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);

  useEffect(() => {
    fetchPendingFees();
  }, [selectedBranch]);

  const fetchPendingFees = () => {
    const params = new URLSearchParams();
    if (selectedBranch) params.append('branch', selectedBranch);

    fetch(`/api/pending-fees?${params.toString()}`)
      .then(res => res.json())
      .then(data => setPendingList(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  const branchCode = selectedBranch?.includes('Kolhapur') ? 'KP' : selectedBranch?.includes('Pune') ? 'PN' : 'SL';
  const branchDisplayName = selectedBranch ? selectedBranch.replace('★', '').trim() : 'Salem';

  // Filtering & Sorting Logic
  const filteredList = pendingList.filter(item => {
    const matchesSearch = !searchTerm || 
      item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cellNumber?.includes(searchTerm) ||
      item.course?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All records' ||
      (statusFilter === 'Active only' && (item.pendingBalance || 0) > 0) ||
      (statusFilter === 'Cleared / Paid' && (item.pendingBalance || 0) === 0);

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortOption === 'Pending: high → low') return (b.pendingBalance || 0) - (a.pendingBalance || 0);
    if (sortOption === 'Pending: low → high') return (a.pendingBalance || 0) - (b.pendingBalance || 0);
    if (sortOption === 'Student: A → Z') return (a.studentName || '').localeCompare(b.studentName || '');
    return 0;
  });

  const totalPendingAmount = filteredList.reduce((acc, item) => acc + (item.pendingBalance || 0), 0);
  const totalPaidAmount = filteredList.reduce((acc, item) => acc + (item.previouslyPaid || 0) + (item.amountPayingNow || 0), 0);

  const handleWhatsAppTrigger = (phone, studentName, amount) => {
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    const text = encodeURIComponent(`Hello ${studentName}, this is a reminder regarding your pending fee balance of ₹${amount.toLocaleString('en-IN')} for your Medical Coding course at Thoughtflows.`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const handleCallTrigger = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleDownloadTemplate = () => {
    const headers = "Student Name,Cell Number,Course,Paid Branch,Total Course Fee,Previously Paid,Pending Balance\n";
    const sampleRow = "Sample Student,+91 9876543210,AMCT Intermediate,Salem ★,23000,5000,18000\n";
    const csvContent = "data:text/csv;charset=utf-8," + headers + sampleRow;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Thoughtflows_Pending_Fees_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Top Header Row with Actions */}
      <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Left Title Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/income-expense" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-slate-400)', textDecoration: 'none', fontWeight: '600' }}>
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-white)' }}>Pending Fees</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: '2px 0 0 0' }}>
              Cumulative pending balance from legacy uploads + ongoing receipt balances - auto-reduces on payment
            </p>
          </div>
        </div>

        {/* Right Top Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleDownloadTemplate} className="action-btn" style={{ background: '#1e293b', color: '#38bdf8', borderColor: '#334155', padding: '9px 16px', fontWeight: '700' }}>
            <Download className="w-4 h-4 text-sky-400" />
            <span>Download template (XLSX)</span>
          </button>

          <button onClick={() => setIsBulkModalOpen(true)} className="action-btn" style={{ background: '#0d9488', color: '#fff', borderColor: '#0f766e', padding: '9px 16px', fontWeight: '700' }}>
            <Upload className="w-4 h-4" />
            <span>Upload pending list (XLSX/CSV)</span>
          </button>

          <button onClick={() => setIsSingleModalOpen(true)} style={{ padding: '9px 16px', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus className="w-4 h-4" />
            <span>Add single entry</span>
          </button>
        </div>

      </div>

      {/* Branch Banner Card */}
      <div style={{ background: 'var(--bg-card)', padding: '18px 22px', borderRadius: '16px', border: '1px solid var(--border-color)', borderLeft: '4px solid #14b8a6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(20, 184, 166, 0.12)', color: '#14b8a6', fontWeight: '900', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(20, 184, 166, 0.3)' }}>
            {branchCode}
          </div>
          <div>
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', letterSpacing: '0.5px' }}>PENDING FEES FOR</span>
            <h2 style={{ fontSize: '16px', fontWeight: '800', margin: '2px 0', color: 'var(--text-white)' }}>{branchDisplayName}</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: 0 }}>
              Records from November 2025 onward + ongoing receipt balances
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

      {/* 3 Metric Summary Cards (Soft Amber/Gold theme matching screenshot) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        
        {/* Card 1: TOTAL PENDING BALANCE */}
        <div style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12), var(--bg-card))', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '18px', borderRadius: '16px', boxShadow: 'var(--shadow-card)' }}>
          <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#d97706', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
            TOTAL PENDING BALANCE
          </span>
          <div style={{ fontSize: '26px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: '#b45309' }}>
            ₹{totalPendingAmount.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', marginTop: '4px', display: 'block' }}>
            {filteredList.length} students owe money
          </span>
        </div>

        {/* Card 2: FROM UPLOADED LIST */}
        <div style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08), var(--bg-card))', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '18px', borderRadius: '16px', boxShadow: 'var(--shadow-card)' }}>
          <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#d97706', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
            FROM UPLOADED LIST
          </span>
          <div style={{ fontSize: '26px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--text-white)' }}>
            ₹0
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', marginTop: '4px', display: 'block' }}>
            0 active entries · 0 total uploaded
          </span>
        </div>

        {/* Card 3: RECOVERED SINCE UPLOAD */}
        <div style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08), var(--bg-card))', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '18px', borderRadius: '16px', boxShadow: 'var(--shadow-card)' }}>
          <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#d97706', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
            RECOVERED SINCE UPLOAD
          </span>
          <div style={{ fontSize: '26px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--emerald-primary)' }}>
            ₹{totalPaidAmount.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', marginTop: '4px', display: 'block' }}>
            payments matched against active records
          </span>
        </div>

      </div>

      {/* Search and Filter Controls Toolbar */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', alignItems: 'center', background: 'var(--bg-card)', padding: '16px 20px', borderRadius: '16px', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ position: 'relative', minWidth: 0 }}>
          <Search className="w-4 h-4 text-slate-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search by name, phone, course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '9.5px 12px 9.5px 36px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ minWidth: 0 }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%', padding: '9.5px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
          >
            <option value="Active only">Active only — still owe money</option>
            <option value="Cleared / Paid">Cleared / Paid</option>
            <option value="All records">All records</option>
          </select>
        </div>

        <div style={{ minWidth: 0 }}>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            style={{ width: '100%', padding: '9.5px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontSize: '13px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
          >
            <option value="Pending: high → low">Pending: high → low</option>
            <option value="Pending: low → high">Pending: low → high</option>
            <option value="Student: A → Z">Student: A → Z</option>
          </select>
        </div>
      </div>

      {/* Pending Students Data Table */}
      <div className="portal-table-container">
        <table className="portal-data-table">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>STUDENT</th>
              <th style={{ width: '25%' }}>COURSE</th>
              <th style={{ textAlign: 'right', width: '15%' }}>TOTAL FEE</th>
              <th style={{ textAlign: 'right', width: '12%' }}>PAID</th>
              <th style={{ textAlign: 'right', width: '13%' }}>PENDING</th>
              <th style={{ textAlign: 'center', width: '10%' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-slate-400)', padding: '36px' }}>
                  No pending fee records found for {branchDisplayName}. Click "Add single entry" or "Upload pending list" to record data.
                </td>
              </tr>
            ) : (
              filteredList.map((item) => (
                <tr key={item.id || item._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: '#fff', fontSize: '13px' }}>{item.studentName || 'Student'}</strong>
                      <span className="sidebar-badge badge-cyan" style={{ fontSize: '9px', padding: '2px 6px' }}>RECEIPT</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)', display: 'block', marginTop: '2px' }}>
                      {item.cellNumber || 'N/A'}
                    </span>
                  </td>

                  <td>
                    <span style={{ display: 'block', color: 'var(--text-slate-200)', fontSize: '12.5px', fontWeight: '600' }}>
                      {item.course || 'AMCT Intermediate'}
                    </span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)' }}>
                      1 payment tracked
                    </span>
                  </td>

                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-slate-200)' }}>
                    ₹{(item.courseFee || 0).toLocaleString('en-IN')}
                  </td>

                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--emerald-primary)', fontWeight: 'bold' }}>
                    ₹{((item.previouslyPaid || 0) + (item.amountPayingNow || 0)).toLocaleString('en-IN')}
                  </td>

                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '13.5px', fontWeight: '900', color: '#fb7185' }}>
                    ₹{(item.pendingBalance || 0).toLocaleString('en-IN')}
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleWhatsAppTrigger(item.cellNumber, item.studentName, item.pendingBalance)}
                        style={{ padding: '5px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Send WhatsApp Reminder"
                      >
                        <span>WA</span>
                      </button>
                      
                      <button
                        onClick={() => handleCallTrigger(item.cellNumber)}
                        style={{ padding: '5px 10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Call Student"
                      >
                        <span>Call</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <BulkPendingUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onUploadSuccess={() => fetchPendingFees()}
      />

      <CreateReceiptModal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        onSaveSuccess={() => fetchPendingFees()}
        initialBranch={selectedBranch}
      />

    </div>
  );
}
