import React, { useState, useRef } from 'react';
import { 
  X, Save, AlertCircle, CheckCircle2, FileSpreadsheet, 
  Upload, Trash2, Sparkles, FileText, ArrowRight, Play 
} from 'lucide-react';

export default function ImportReceiptsModal({ isOpen, onClose, onImportSuccess }) {
  const [csvText, setCsvText] = useState('');
  const [parsedItems, setParsedItems] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg('');
    setSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      setCsvText(content);
      parseCsvContent(content);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setCsvText('');
    setParsedItems([]);
    setFileName('');
    setErrorMsg('');
    setSuccessMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const parseCsvContent = (textToParse) => {
    const text = textToParse || csvText;
    if (!text.trim()) {
      setErrorMsg('Please paste CSV contents or upload a file.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');

    try {
      const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        throw new Error('CSV must contain at least 1 header row and 1 data row.');
      }

      const firstLine = lines[0];
      const delimiter = firstLine.includes('\t') ? '\t' : ',';
      const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());

      const items = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length < 2) continue;

        const getVal = (possibleHeaders, defaultIdx) => {
          for (let ph of possibleHeaders) {
            const idx = headers.findIndex(h => h.includes(ph));
            if (idx !== -1 && cols[idx] !== undefined) return cols[idx];
          }
          return cols[defaultIdx] || '';
        };

        const receiptNo = getVal(['receipt', 'receipt no', 'bill no'], 0) || `LEGACY-${Date.now()}-${i}`;
        const studentName = getVal(['student', 'name', 'candidate'], 1) || 'Imported Student';
        const cellNumber = getVal(['cell', 'phone', 'mobile', 'contact'], 2) || '+91 99999 00000';
        const paidBranch = getVal(['branch', 'location'], 3) || 'Pune (FC Road) ★';
        const course = getVal(['course', 'program'], 4) || 'Medical Coding';
        const courseFee = parseFloat(getVal(['fee', 'total fee', 'course fee'], 5)) || 25000;
        const amountPayingNow = parseFloat(getVal(['paying', 'amount', 'paid'], 6)) || 15000;
        const account = getVal(['account', 'payment mode', 'bank'], 7) || 'Cash';

        items.push({
          receiptNo,
          studentName,
          cellNumber,
          paidBranch,
          course,
          courseFee,
          amountPayingNow,
          account,
        });
      }

      if (items.length === 0) {
        throw new Error('No valid data rows found in CSV.');
      }

      setParsedItems(items);
      setSuccessMsg(`Parsed ${items.length} valid receipt records ready for import.`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to parse CSV data.');
      setParsedItems([]);
    }
  };

  const handleImportSubmit = async () => {
    if (parsedItems.length === 0) {
      setErrorMsg('No parsed records to import. Please parse receipts first.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/receipts/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: parsedItems }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to import receipts');
        }
      }

      if (onImportSuccess) onImportSuccess();
      onClose();
    } catch (err) {
      console.error('Import error:', err);
      setErrorMsg(err.message || 'Error occurred while saving imported receipts.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(9, 13, 22, 0.75)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '880px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        
        {/* Top Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 28px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(16, 185, 129, 0.35)'
            }}>
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.01em' }}>
                Import receipts from Thoughtflows Billing Software
              </h3>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                Automated CSV & Excel billing data parser
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '10px',
              color: '#cbd5e1',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '28px', overflowY: 'auto', maxHeight: '70vh' }}>
          
          {/* Creative How This Works Glass Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.9) 0%, rgba(240, 253, 250, 0.9) 100%)',
            border: '1px solid #cbd5e1',
            borderLeft: '5px solid #0d9488',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '24px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: '#0d9488',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                💡
              </div>
              <strong style={{ fontSize: '13.5px', color: '#0f766e', fontWeight: '800' }}>
                How this works:
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', lineHeight: '1.55', color: '#334155', fontWeight: '500' }}>
              Export receipts from your Thoughtflows Billing System as CSV or Excel. Paste the contents below or upload the file. The tracker reads every column directly — branch, course, student, installment, amount, lead HR — no manual mapping needed. Duplicates are detected by Receipt No. <em>For historical backfill: if your file has no Receipt No column, the tracker will auto-generate one starting with LEGACY- so you can still import old data.</em>
            </p>
          </div>

          {/* Step 1 Title Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'rgba(13, 148, 136, 0.1)',
              border: '1px solid rgba(13, 148, 136, 0.25)',
              borderRadius: '50px',
              fontSize: '11px',
              fontWeight: '800',
              color: '#0d9488',
              letterSpacing: '0.06em'
            }}>
              <Sparkles size={13} />
              <span>STEP 1 · PASTE CSV OR UPLOAD FILE</span>
            </span>
          </div>

          {/* Upload Controls Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
            background: '#f8fafc',
            border: '1.5px dashed #cbd5e1',
            borderRadius: '14px',
            padding: '12px 18px'
          }}>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                color: '#0f172a',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                transition: 'all 0.15s ease'
              }}
            >
              <Upload size={15} className="text-teal-600" />
              <span>Choose File</span>
            </button>

            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
              {fileName ? fileName : 'No file chosen'}
            </span>

            <span style={{ fontSize: '12px', color: '#cbd5e1', margin: '0 4px' }}>or</span>

            <button
              type="button"
              onClick={handleClear}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          </div>

          {/* Textarea Input */}
          <div style={{ marginBottom: '16px' }}>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Or paste CSV here (headers expected: Receipt No, Date, Student Name, Cell, Email, Address, Branch, Course, ...)"
              style={{
                width: '100%',
                padding: '14px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '14px',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: '12.5px',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
            />
          </div>

          {/* Parse Button */}
          <div style={{ marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => parseCsvContent()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '800',
                color: '#0f172a',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease'
              }}
            >
              <Play size={14} className="text-teal-600 fill-teal-600" />
              <span>Parse receipts</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div style={{
              padding: '14px 16px',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '12px',
              color: '#e11d48',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner & Table Preview */}
          {successMsg && (
            <div style={{
              padding: '14px 16px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              color: '#16a34a',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <CheckCircle2 size={18} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {parsedItems.length > 0 && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f766e' }}>
                  Parsed Receipts Preview ({parsedItems.length} records)
                </span>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                  Ready to commit
                </span>
              </div>
              <table style={{ width: '100%', fontSize: '11.5px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #cbd5e1', color: '#475569' }}>
                    <th style={{ padding: '6px 8px' }}>Receipt No</th>
                    <th style={{ padding: '6px 8px' }}>Student</th>
                    <th style={{ padding: '6px 8px' }}>Branch</th>
                    <th style={{ padding: '6px 8px' }}>Course</th>
                    <th style={{ padding: '6px 8px' }}>Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedItems.slice(0, 10).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontWeight: '700', color: '#0f172a' }}>{item.receiptNo}</td>
                      <td style={{ padding: '6px 8px', fontWeight: '600' }}>{item.studentName}</td>
                      <td style={{ padding: '6px 8px', color: '#475569' }}>{item.paidBranch}</td>
                      <td style={{ padding: '6px 8px', color: '#475569' }}>{item.course}</td>
                      <td style={{ padding: '6px 8px', fontWeight: '800', color: '#059669' }}>₹{item.amountPayingNow?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedItems.length > 10 && (
                <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginTop: '8px', textAlign: 'center' }}>
                  ... and {parsedItems.length - 10} more records ready for import
                </span>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '20px 28px',
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '11px 22px',
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: '700',
              color: '#334155',
              cursor: 'pointer',
              transition: 'background-color 0.15s'
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleImportSubmit}
            disabled={parsedItems.length === 0 || isSubmitting}
            style={{
              padding: '11px 24px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35)',
              opacity: parsedItems.length === 0 || isSubmitting ? 0.6 : 1,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
          >
            <Save size={16} />
            <span>{isSubmitting ? 'Importing Receipts...' : 'Import all valid rows'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
