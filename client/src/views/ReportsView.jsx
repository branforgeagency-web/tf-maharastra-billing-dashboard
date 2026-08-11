import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, Search, Table } from 'lucide-react';

export default function ReportsView({ selectedBranch }) {
  const [reportType, setReportType] = useState('receipts');
  const [reportData, setReportData] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReport();
  }, [reportType, selectedBranch]);

  const fetchReport = () => {
    let endpoint = '/api/receipts';
    if (reportType === 'vouchers') endpoint = '/api/vouchers';
    else if (reportType === 'b2b') endpoint = '/api/b2b';
    else if (reportType === 'payroll') endpoint = '/api/payroll';

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        if (reportType === 'payroll') setReportData(data.employees || []);
        else setReportData(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err));
  };

  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) return;
    const headers = Object.keys(reportData[0]).join(',');
    const rows = reportData.map(obj => Object.values(obj).map(v => `"${v}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Thoughtflows_${reportType}_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner */}
      <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', justifyBetween: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText className="w-5 h-5 text-cyan-400" />
            Custom ERP Report Generator & Audit Exporter — {selectedBranch}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: '4px 0 0 0' }}>
            Generate structured financial audit reports and export to CSV / Excel.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            style={{ padding: '8px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-white)', fontWeight: 'bold', fontSize: '13px' }}
          >
            <option value="receipts">Student Receipts Report</option>
            <option value="vouchers">Expense Vouchers Report</option>
            <option value="b2b">B2B Institutional Report</option>
            <option value="payroll">Employee Payroll Report</option>
          </select>

          <button onClick={handleExportCSV} className="btn-primary-green">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Data Table */}
      <div className="portal-table-container">
        <table className="portal-data-table">
          <thead>
            <tr>
              <th>Record ID / No</th>
              <th>Primary Party / Student</th>
              <th>Branch / Category</th>
              <th style={{ textAlign: 'right' }}>Amount (₹)</th>
              <th style={{ textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item, idx) => (
              <tr key={item.id || item._id || idx}>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-slate-400)' }}>
                  {item.receiptNo || item.invoiceRef || item._id || `REC-${idx + 1}`}
                </td>
                <td><strong style={{ color: '#fff' }}>{item.studentName || item.title || item.institutionName || item.name}</strong></td>
                <td><span className="sidebar-badge badge-emerald">{item.paidBranch || item.category || item.institutionType || item.designation}</span></td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--emerald-primary)' }}>
                  ₹{(item.amountPayingNow || item.amount || item.totalAmount || item.netSalary || 0).toLocaleString('en-IN')}
                </td>
                <td style={{ textAlign: 'center' }}><span className="badge-pill badge-paid">{item.status || 'Verified'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
