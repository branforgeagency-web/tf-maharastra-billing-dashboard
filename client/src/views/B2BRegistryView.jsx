import React, { useState, useEffect } from 'react';
import { Building2, Plus, ArrowLeft, Download, Upload, GraduationCap, Building, Search, X, Trash2, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreateB2BModal from '../components/CreateB2BModal';

export default function B2BRegistryView({ selectedBranch, setSelectedBranch }) {
  const [list, setList] = useState([]);
  const [activeTab, setActiveTab] = useState('College'); // 'College' | 'Company'
  const [periodFilter, setPeriodFilter] = useState('This month');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingB2B, setEditingB2B] = useState(null);

  const [formData, setFormData] = useState({
    institutionType: 'College',
    institutionName: '',
    candidatesTrained: '',
    isSez: false,
    totalAmount: '',
    paidAmount: '',
    contractDate: new Date().toISOString().split('T')[0],
    branchCode: selectedBranch || 'Pune'
  });

  useEffect(() => {
    fetchB2B();
  }, [selectedBranch]);

  const fetchB2B = () => {
    const params = new URLSearchParams();
    if (selectedBranch) params.append('branch', selectedBranch);

    fetch(`/api/b2b?${params.toString()}`)
      .then(res => res.json())
      .then(data => setList(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  const handleOpenModal = (type = activeTab) => {
    setFormData(prev => ({
      ...prev,
      institutionType: type,
      branchCode: selectedBranch || 'Pune'
    }));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.institutionName.trim() || !formData.totalAmount) return;

    const total = parseFloat(formData.totalAmount) || 0;
    const paid = parseFloat(formData.paidAmount) || total;
    const pending = Math.max(0, total - paid);

    try {
      const res = await fetch('/api/b2b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          candidatesTrained: parseInt(formData.candidatesTrained, 10) || 1,
          totalAmount: total,
          paidAmount: paid,
          pendingAmount: pending,
          branchCode: selectedBranch || 'Pune'
        })
      });

      if (res.ok) {
        fetchB2B();
        setIsModalOpen(false);
        setFormData({
          institutionType: activeTab,
          institutionName: '',
          candidatesTrained: '',
          isSez: false,
          totalAmount: '',
          paidAmount: '',
          contractDate: new Date().toISOString().split('T')[0],
          branchCode: selectedBranch || 'Pune'
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete B2B entry?')) return;
    try {
      await fetch(`/api/b2b/${id}`, { method: 'DELETE' });
      fetchB2B();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCSV = () => {
    if (list.length === 0) return;
    const headers = "Date,Institution Name,Type,Candidates Trained,Total Value,Paid Amount,Pending Amount,Tax Status\n";
    const rows = list.map(item => 
      `"${item.contractDate}","${item.institutionName}","${item.institutionType}","${item.candidatesTrained}","${item.totalAmount}","${item.paidAmount || item.totalAmount}","${item.pendingAmount || 0}","${item.isSez ? 'SEZ (0% GST)' : 'Standard 18%'}"`
    ).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Thoughtflows_B2B_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered List based on tab, period, and search term
  const filteredList = list.filter(item => {
    const matchesTab = item.institutionType === activeTab;
    const matchesSearch = !searchTerm || 
      item.institutionName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Metrics Computations
  const grossRevenue = filteredList.reduce((acc, i) => acc + (i.totalAmount || 0), 0);
  const candidatesTrainedTotal = filteredList.reduce((acc, i) => acc + (i.candidatesTrained || 0), 0);
  const sezCount = filteredList.filter(i => i.isSez).length;
  const sezPercent = filteredList.length > 0 ? Math.round((sezCount / filteredList.length) * 100) : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Top Header Row with Breadcrumb & Actions */}
      <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/income-expense" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-slate-400)', textDecoration: 'none', fontWeight: '600' }}>
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 className="w-5 h-5 text-blue-500" />
          </div>

          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-white)' }}>
              B2B · College & Company
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: '2px 0 0 0' }}>
              Institutional revenue · SEZ & Non-SEZ · candidate training rolls
            </p>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {setSelectedBranch && (
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{ padding: '8px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-white)', fontWeight: '700', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="Pune (FC Road) ★">Pune (FC Road) ★</option>
              <option value="Kolhapur (Tarabai Park) ★">Kolhapur (Tarabai Park) ★</option>
              <option value="All Branches (Global View)">All Branches (Global View)</option>
            </select>
          )}

          <button onClick={() => handleOpenModal()} className="btn-primary-green" style={{ background: '#0d9488', padding: '9px 16px', fontSize: '13px' }}>
            <Plus className="w-4 h-4" />
            <span>Add B2B entry</span>
          </button>

          <button onClick={handleExportCSV} style={{ padding: '9px 16px', background: 'var(--bg-card)', color: 'var(--text-white)', border: '1px solid var(--border-color)', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button onClick={() => handleOpenModal()} style={{ padding: '9px 16px', background: 'var(--bg-card)', color: 'var(--text-white)', border: '1px solid var(--border-color)', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Upload className="w-4 h-4" />
            <span>Upload CSV / Excel</span>
          </button>
        </div>

      </div>

      {/* Info Callout Box (Matching Screenshot) */}
      <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '14px', padding: '14px 18px', fontSize: '12.5px', color: '#38bdf8', lineHeight: '1.6' }}>
        <strong>What this is:</strong> A dedicated registry for B2B transactions kept separate from individual student receipts. Income still rolls into the same P&L (no double counting) — this view is for tracking the institutional pipeline, SEZ vs Non-SEZ revenue mix, and candidates trained per deal.
      </div>

      {/* Sub-Tabs: College vs Company */}
      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('College')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'College' ? '2.5px solid #0d9488' : '2.5px solid transparent',
            color: activeTab === 'College' ? '#0d9488' : 'var(--text-slate-400)',
            fontWeight: '800',
            fontSize: '14px',
            padding: '8px 12px 12px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <GraduationCap className="w-4 h-4" />
          <span>College</span>
        </button>

        <button
          onClick={() => setActiveTab('Company')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'Company' ? '2.5px solid #0d9488' : '2.5px solid transparent',
            color: activeTab === 'Company' ? '#0d9488' : 'var(--text-slate-400)',
            fontWeight: '800',
            fontSize: '14px',
            padding: '8px 12px 12px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Building className="w-4 h-4" />
          <span>Company</span>
        </button>
      </div>

      {/* 4 Summary Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        
        {/* Card 1: TOTAL ENTRIES */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '14px', boxShadow: 'var(--shadow-card)' }}>
          <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>
            TOTAL ENTRIES
          </span>
          <div style={{ fontSize: '26px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--text-white)' }}>
            {filteredList.length}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', marginTop: '4px', display: 'block' }}>
            {periodFilter.toLowerCase()} · all branches
          </span>
        </div>

        {/* Card 2: GROSS REVENUE */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '14px', boxShadow: 'var(--shadow-card)' }}>
          <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>
            GROSS REVENUE
          </span>
          <div style={{ fontSize: '26px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--emerald-primary)' }}>
            ₹{grossRevenue.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', marginTop: '4px', display: 'block' }}>
            {filteredList.length} {activeTab.toLowerCase()}s entry
          </span>
        </div>

        {/* Card 3: CANDIDATES TRAINED */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '14px', boxShadow: 'var(--shadow-card)' }}>
          <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>
            CANDIDATES TRAINED
          </span>
          <div style={{ fontSize: '26px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: 'var(--cyan-primary)' }}>
            {candidatesTrainedTotal}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', marginTop: '4px', display: 'block' }}>
            students delivered
          </span>
        </div>

        {/* Card 4: SEZ SPLIT */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '14px', boxShadow: 'var(--shadow-card)' }}>
          <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', display: 'block', marginBottom: '4px' }}>
            SEZ SPLIT
          </span>
          <div style={{ fontSize: activeTab === 'College' ? '14px' : '22px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: activeTab === 'College' ? 'var(--text-slate-400)' : 'var(--amber-primary)', marginTop: '4px' }}>
            {activeTab === 'College' ? '—' : `${sezPercent}% SEZ`}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', marginTop: '4px', display: 'block' }}>
            {activeTab === 'College' ? 'N/A for college' : 'SEZ (0% GST) vs Standard'}
          </span>
        </div>

      </div>

      {/* Period Filter & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)' }}>PERIOD</span>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            style={{ padding: '8px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
          >
            <option value="This month">This month</option>
            <option value="This quarter">This quarter</option>
            <option value="This year">This year</option>
            <option value="All time">All time</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search className="w-4 h-4 text-slate-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by name, mobile, contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
          />
        </div>
      </div>

      {/* Main Content Area: Empty State OR Data Table */}
      {filteredList.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '56px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', boxShadow: 'var(--shadow-card)' }}>
          
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(13, 148, 136, 0.12)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {activeTab === 'College' ? <GraduationCap className="w-8 h-8" /> : <Building className="w-8 h-8" />}
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-white)' }}>
              No {activeTab.toLowerCase()} entries yet
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-slate-400)', margin: 0, maxWidth: '520px', lineHeight: '1.6' }}>
              Click "Add B2B entry" above to record your first {activeTab.toLowerCase()} engagement. This view is filtered by the period dropdown and the active tab.
            </p>
          </div>

          <button onClick={() => handleOpenModal()} className="btn-primary-green" style={{ background: '#0d9488', padding: '10px 20px', fontSize: '13.5px', marginTop: '6px' }}>
            <Plus className="w-4 h-4" />
            <span>Add {activeTab.toLowerCase()} entry</span>
          </button>

        </div>
      ) : (
        <div className="portal-table-container">
          <table className="portal-data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Institution Name</th>
                <th>Trained</th>
                <th style={{ textAlign: 'right' }}>Total Value</th>
                <th style={{ textAlign: 'right' }}>Paid</th>
                <th style={{ textAlign: 'right' }}>Pending</th>
                <th style={{ textAlign: 'center' }}>Tax Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item) => (
                <tr key={item.id || item._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-slate-400)' }}>{item.contractDate}</td>
                  <td>
                    <strong style={{ display: 'block', color: '#fff' }}>{item.institutionName}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-slate-400)' }}>{item.institutionType} Contract</span>
                  </td>
                  <td><span className="sidebar-badge badge-emerald">{item.candidatesTrained} Students</span></td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--emerald-primary)' }}>
                    ₹{item.totalAmount?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--emerald-primary)' }}>
                    ₹{(item.paidAmount || item.totalAmount)?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#fb7185' }}>
                    ₹{(item.pendingAmount || 0)?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge-pill ${item.isSez ? 'badge-paid' : 'badge-partial'}`}>
                      {item.isSez ? 'SEZ (0% GST)' : 'Standard 18%'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button onClick={() => setEditingB2B(item)} className="action-btn" title="Edit entry">
                        <Edit className="w-3.5 h-3.5 text-teal-500" />
                      </button>
                      <button onClick={() => handleDelete(item.id || item._id)} className="action-btn" style={{ color: '#fb7185' }} title="Delete entry">
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

      {/* Dedicated B2B Modal with Tax Treatment & Live Arithmetic */}
      <CreateB2BModal
        isOpen={isModalOpen || !!editingB2B}
        onClose={() => { setIsModalOpen(false); setEditingB2B(null); }}
        onSaveSuccess={() => { fetchB2B(); setEditingB2B(null); }}
        initialBranch={selectedBranch || 'Pune (FC Road) ★'}
        initialType={activeTab}
        initialData={editingB2B}
      />

    </div>
  );
}
