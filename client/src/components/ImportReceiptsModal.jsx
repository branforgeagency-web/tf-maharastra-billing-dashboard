import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ImportReceiptsModal({ isOpen, onClose, onImportSuccess }) {
  const [csvText, setCsvText] = useState('');
  const [parsedItems, setParsedItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sampleCsvData = `Student Name,Cell Number,Paid Branch,Course,Course Fee,Amount Paying,Payment Account
Ananya Sharma,+91 98451 22301,Salem ★,AMCT Intermediate,23000,13000,Cash
Rahul Deshmukh,+91 97654 11209,Pune (FC Road) ★,CCS,29000,29000,IDFC Main
Sneha Kulkarni,+91 94220 55123,Kolhapur (Tarabai Park) ★,CIC (Freshers),29000,15000,Non IDFC`;

  const handleParse = () => {
    if (!csvText.trim()) { setErrorMsg('Please paste CSV / Tab-separated data'); return; }
    setErrorMsg('');

    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) throw new Error('CSV must contain at least 1 header line and 1 data row.');

      const items = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 3) {
          items.push({
            studentName: cols[0] || 'Imported Student',
            cellNumber: cols[1] || '+91 99999 00000',
            paidBranch: cols[2] || 'Salem ★',
            course: cols[3] || 'AMCT Intermediate',
            courseFee: parseFloat(cols[4]) || 20000,
            amountPayingNow: parseFloat(cols[5]) || 20000,
            account: cols[6] || 'Cash'
          });
        }
      }

      setParsedItems(items);
    } catch (e) {
      setErrorMsg(e.message);
    }
  };

  const handleImportSubmit = async () => {
    if (parsedItems.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/receipts/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: parsedItems })
      });
      if (res.ok) {
        onImportSuccess();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-backdrop animate-fade-in">
      <div className="modal-dialog-container animate-modal-up" style={{ maxWidth: '680px' }}>
        <div className="modal-header-bar">
          <h3 className="modal-title-text">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            Import from Billing Software
          </h3>
          <button onClick={onClose} className="modal-close-btn"><X className="w-5 h-5" /></button>
        </div>

        <div className="modal-body-scroll">
          <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: 0 }}>
            Paste CSV or Excel billing export data below. Duplicate receipt numbers will be automatically checked and assigned legacy IDs.
          </p>

          {errorMsg && (
            <div style={{ padding: '10px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', color: '#fb7185', fontSize: '12px' }}>
              {errorMsg}
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-slate-400)' }}>CSV Data Input</span>
              <button
                type="button"
                onClick={() => setCsvText(sampleCsvData)}
                style={{ background: 'none', border: 'none', color: 'var(--emerald-primary)', fontSize: '11px', cursor: 'pointer' }}
              >
                Insert Sample Template
              </button>
            </div>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Student Name, Cell Number, Paid Branch, Course, Course Fee, Amount Paying, Payment Account"
              style={{ width: '100%', padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={handleParse} className="action-btn" style={{ padding: '8px 16px' }}>
              Validate & Parse Rows
            </button>
          </div>

          {parsedItems.length > 0 && (
            <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', padding: '12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--emerald-primary)', display: 'block', marginBottom: '6px' }}>
                ✓ Successfully parsed {parsedItems.length} records ready for import
              </span>
              <div style={{ maxHeight: '120px', overflowY: 'auto', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-slate-300)' }}>
                {parsedItems.map((item, idx) => (
                  <div key={idx}>{idx + 1}. {item.studentName} — {item.course} (₹{item.courseFee})</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer-bar">
          <button type="button" onClick={onClose} className="action-btn">Cancel</button>
          <button type="button" onClick={handleImportSubmit} disabled={parsedItems.length === 0 || isSubmitting} className="btn-primary-green">
            {isSubmitting ? 'Importing...' : `Import ${parsedItems.length} Records`}
          </button>
        </div>
      </div>
    </div>
  );
}
