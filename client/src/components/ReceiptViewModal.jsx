import React from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';

export default function ReceiptViewModal({ isOpen, onClose, receipt }) {
  if (!isOpen || !receipt) return null;

  return (
    <div className="modal-overlay-backdrop animate-fade-in">
      <div className="modal-dialog-container animate-modal-up" style={{ maxWidth: '620px' }}>
        <div className="modal-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="modal-title-text">Official Tax Receipt Invoice</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => window.print()} className="btn-primary-green" style={{ padding: '6px 12px', fontSize: '11px' }}>
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button onClick={onClose} className="modal-close-btn"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="modal-body-scroll" style={{ background: '#fff', color: '#000', padding: '32px' }} id="printable-receipt">
          <div style={{ display: 'flex', justifyBetween: 'space-between', borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0, textTransform: 'uppercase' }}>Thoughtflows</h2>
              <p style={{ fontSize: '11px', color: '#555', margin: '2px 0 0 0' }}>Franchise Operations & Training Services</p>
              <p style={{ fontSize: '10px', color: '#777', margin: '2px 0 0 0' }}>GSTIN: 33AAAAA0000A1Z5</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'monospace' }}>{receipt.receiptNo}</span>
              <p style={{ fontSize: '11px', color: '#555', margin: '2px 0 0 0' }}>Date: {receipt.dateOfReceipt}</p>
              <p style={{ fontSize: '10px', color: '#555', margin: '2px 0 0 0' }}>Pocket: <strong>{receipt.party}</strong> ({receipt.account})</p>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '12px' }}>
            <p style={{ margin: 0 }}><strong>Billed To:</strong> {receipt.studentName}</p>
            <p style={{ margin: '4px 0 0 0' }}><strong>Phone:</strong> {receipt.cellNumber}</p>
            <p style={{ margin: '4px 0 0 0' }}><strong>Branch:</strong> {receipt.paidBranch} ({receipt.modeOfTraining})</p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: '#fff', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Description</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Taxable</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>GST 18%</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px' }}>{receipt.course}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{receipt.taxableValue?.toLocaleString('en-IN')}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{receipt.gstAmount?.toLocaleString('en-IN')}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold' }}>₹{receipt.courseFee?.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyEnd: 'flex-end' }}>
            <div style={{ width: '220px', fontSize: '12px', lineHeight: '1.6' }}>
              <div style={{ display: 'flex', justifyBetween: 'space-between' }}>
                <span>Paid Now:</span>
                <strong>₹{receipt.amountPayingNow?.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyBetween: 'space-between', color: '#dc2626' }}>
                <span>Pending Balance:</span>
                <strong>₹{receipt.pendingBalance?.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
