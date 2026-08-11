import React, { useState } from 'react';
import { X, Download, Upload, FileSpreadsheet, CheckCircle2, FileText, UploadCloud } from 'lucide-react';

export default function BulkPendingUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Student Name,Cell Number,Paid Branch,Course,Total Fee,Previously Paid,Pending Balance\nAnanya Sharma,+91 98451 22301,Pune (FC Road) ★,AMCT Intermediate,23000,13000,10000";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pending_fees_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      onUploadSuccess();
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-backdrop">
      <div className="modal-dialog-container animate-modal-up" style={{ maxWidth: '540px', width: '95%' }}>
        
        {/* Header Bar */}
        <div className="modal-header-bar">
          <h3 className="modal-title-text" style={{ fontSize: '17px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
            Bulk Pending Fee List Importer
          </h3>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="modal-body-scroll" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Drag & Drop Zone Box */}
          <div style={{
            background: 'var(--bg-input)',
            border: '2px dashed var(--tf-teal-primary)',
            borderRadius: '16px',
            padding: '28px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            position: 'relative',
            transition: 'all 0.25s ease'
          }}>
            
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'rgba(13, 148, 136, 0.12)',
              color: 'var(--tf-teal-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(13, 148, 136, 0.3)',
              marginBottom: '4px'
            }}>
              <UploadCloud className="w-7 h-7" />
            </div>

            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-white)' }}>
              Drag & Drop Pending List Excel / CSV
            </h4>
            
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-slate-400)', maxWidth: '340px', lineHeight: '1.45' }}>
              Supports <strong style={{ color: 'var(--text-white)' }}>.csv</strong>, <strong style={{ color: 'var(--text-white)' }}>.xlsx</strong> formatted pending fee rosters
            </p>

            {/* Custom Styled File Selector Button */}
            <label style={{
              marginTop: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-white)',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-card)',
              transition: 'all 0.2s ease'
            }}>
              <FileText className="w-4 h-4 text-teal-500" />
              <span>{file ? file.name : 'Choose Excel / CSV File'}</span>
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </label>

            {file && (
              <span style={{ fontSize: '11px', color: 'var(--emerald-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> File Selected ({Math.round(file.size / 1024)} KB)
              </span>
            )}

          </div>

          {/* Download Template Action Button */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            style={{
              padding: '12px 16px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1.5px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              color: 'var(--emerald-primary)',
              fontWeight: '700',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Download className="w-4 h-4" />
            <span>Download Excel Template (.csv)</span>
          </button>

        </div>

        {/* Footer Bar */}
        <div className="modal-footer-bar" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" onClick={onClose} className="action-btn" style={{ padding: '9px 20px', borderRadius: '10px' }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="btn-primary-green"
            style={{ padding: '9px 24px', borderRadius: '10px', background: 'var(--tf-teal-primary)', opacity: isUploading ? 0.7 : 1 }}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isUploading ? 'Processing...' : 'Process Bulk Roster'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
