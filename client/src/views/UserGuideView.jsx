import React from 'react';
import { 
  BookOpen, LogIn, Wallet, Upload, Clock, PieChart, 
  CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, ShieldCheck 
} from 'lucide-react';

export default function UserGuideView() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Top Banner Header - Thoughtflows Logo Teal Brand Theme */}
      <div style={{ 
        background: 'linear-gradient(135deg, #004d40 0%, #00897b 50%, #0d9488 100%)', 
        padding: '26px 30px', 
        borderRadius: '20px', 
        border: '1.5px solid rgba(20, 184, 166, 0.4)', 
        boxShadow: '0 8px 30px rgba(0, 137, 123, 0.25)',
        color: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
          <div style={{ 
            width: '52px', 
            height: '52px', 
            borderRadius: '16px', 
            background: 'rgba(255, 255, 255, 0.2)', 
            backdropFilter: 'blur(8px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#ffffff', 
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            flexShrink: 0
          }}>
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0, color: '#ffffff', letterSpacing: '-0.3px' }}>
              Welcome to Thoughtflows Finance Portal
            </h1>
            <p style={{ fontSize: '13.5px', color: '#e0f2f1', margin: '4px 0 0 0', lineHeight: '1.55', fontWeight: '500' }}>
              A real-time partnership accounting system that keeps HQ and franchise partners aligned. Every receipt, every pocket, every settlement — visible to both sides, updated live.
            </p>
          </div>
        </div>

        {/* Jump to Section Quick Nav */}
        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#b2dfdb', display: 'block', marginBottom: '10px', letterSpacing: '0.6px' }}>
            JUMP TO SECTION
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              { id: 'g_start', label: '1. Getting started' },
              { id: 'g_pockets', label: '2. Understanding the 6 pockets' },
              { id: 'g_upload', label: '3. Uploading receipts' },
              { id: 'g_pending', label: '4. Pending fees' },
              { id: 'g_pl', label: '5. P&L and settlement' },
              { id: 'g_tasks', label: '6. Common tasks' },
              { id: 'g_troubleshoot', label: '7. Troubleshooting' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                style={{ 
                  padding: '7px 14px', 
                  fontSize: '12px', 
                  background: 'rgba(255, 255, 255, 0.18)', 
                  border: '1px solid rgba(255, 255, 255, 0.3)', 
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 1: Getting started */}
      <div id="g_start" className="dashboard-panel-card">
        <div className="panel-title-bar">
          <h2 className="panel-heading" style={{ color: 'var(--text-white)', fontSize: '16px' }}>
            <LogIn className="w-5 h-5 text-teal-400" />
            1. Getting started
          </h2>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-slate-200)', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ margin: 0 }}>
            <strong>Logging in:</strong> Choose your branch (Pune, Kolhapur, or Global View) from the top header branch selector.
          </p>
          <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            💡 <strong>Pro Tip:</strong> Bookmark the URL. On mobile, use <strong>"Add to Home Screen"</strong> so the portal opens like a standalone app.
          </div>
        </div>
      </div>

      {/* Section 2: Understanding the 6 pockets */}
      <div id="g_pockets" className="dashboard-panel-card">
        <div className="panel-title-bar">
          <h2 className="panel-heading" style={{ color: 'var(--text-white)', fontSize: '16px' }}>
            <Wallet className="w-5 h-5 text-amber-400" />
            2. Understanding the 6 pockets
          </h2>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-slate-200)', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ margin: 0 }}>
            Every rupee that flows through your branch sits in one of 6 pockets. Three belong to the Partner, three belong to Management:
          </p>

          {/* Pockets Table */}
          <div className="portal-table-container">
            <table className="portal-data-table">
              <thead>
                <tr>
                  <th style={{ width: '220px' }}>Pocket</th>
                  <th>What sits here</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong style={{ color: '#10b981' }}>🟢 Partner Cash</strong></td>
                  <td>Physical cash collected by the partner at the branch</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#a855f7' }}>🟣 Partner Non-IDFC</strong></td>
                  <td>Money in partner's own bank account (UPI, HDFC, Aruna A/c, etc.)</td>
                </tr>
                <tr>
                  <td><strong style={{ color: 'var(--text-slate-300)' }}>Partner IDFC</strong></td>
                  <td>Partner-side IDFC if applicable</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#3b82f6' }}>🔵 Management IDFC</strong></td>
                  <td>The joint IDFC Main account — HQ-controlled, both sides see balance</td>
                </tr>
                <tr>
                  <td><strong style={{ color: 'var(--text-slate-300)' }}>Management Cash</strong></td>
                  <td>Cash held by Management</td>
                </tr>
                <tr>
                  <td><strong style={{ color: 'var(--text-slate-300)' }}>Management Non-IDFC</strong></td>
                  <td>Management's other bank accounts (e.g. HDFC for vendor payments)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)', color: 'var(--text-slate-200)' }}>
            <strong>Why this matters:</strong> Pockets show where money sits right now. Profit calculations happen separately — they don't care which pocket the money is in. At month-end, partner and HQ settle so each gets their 50% share of net profit.
          </div>
        </div>
      </div>

      {/* Section 3: Uploading receipts */}
      <div id="g_upload" className="dashboard-panel-card">
        <div className="panel-title-bar">
          <h2 className="panel-heading" style={{ color: 'var(--text-white)', fontSize: '16px' }}>
            <Upload className="w-5 h-5 text-emerald-400" />
            3. Uploading receipts
          </h2>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-slate-200)', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ margin: 0 }}>
            The fastest way to add receipts is to upload the file you already maintain in the Thoughtflows Billing software (or a spreadsheet).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div><strong>Step 1:</strong> Go to <strong>Income & Expense</strong> from the sidebar.</div>
            <div><strong>Step 2:</strong> Click <strong>Import from billing software</strong>. Pick your file (works with <code>.csv</code>, <code>.xls</code>, and <code>.xlsx</code>).</div>
            <div><strong>Step 3:</strong> Click <strong>Parse receipts</strong>. A preview appears showing every row.</div>
            <div>
              <strong>Step 4:</strong> Check the <strong>Pocket</strong> column on each row — that's where the money will land.
            </div>
            <div><strong>Step 5:</strong> Click <strong>Save all</strong>. Database balances update immediately.</div>
          </div>
        </div>
      </div>

      {/* Section 4: Pending fees */}
      <div id="g_pending" className="dashboard-panel-card">
        <div className="panel-title-bar">
          <h2 className="panel-heading" style={{ color: 'var(--text-white)', fontSize: '16px' }}>
            <Clock className="w-5 h-5 text-rose-400" />
            4. Pending fees
          </h2>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-slate-200)', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ margin: 0 }}>
            <strong>"Pending"</strong> means a student has paid some but not all of their course fee. The portal tracks this automatically from receipts you upload — you don't enter it manually.
          </p>
        </div>
      </div>

      {/* Section 5: P&L and monthly settlement */}
      <div id="g_pl" className="dashboard-panel-card">
        <div className="panel-title-bar">
          <h2 className="panel-heading" style={{ color: 'var(--text-white)', fontSize: '16px' }}>
            <PieChart className="w-5 h-5 text-purple-400" />
            5. P&L and monthly settlement
          </h2>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-slate-200)', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <strong>How profit is calculated:</strong>
            <div style={{ margin: '8px 0', padding: '14px', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-color)', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--emerald-primary)' }}>
              Total Revenue − Operational expenses (rent, salary, marketing) = Partnership Profit ÷ 2 → Partner's share & Management's share
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: Common tasks */}
      <div id="g_tasks" className="dashboard-panel-card">
        <div className="panel-title-bar">
          <h2 className="panel-heading" style={{ color: 'var(--text-white)', fontSize: '16px' }}>
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            6. Common tasks
          </h2>
        </div>

        <div className="portal-table-container">
          <table className="portal-data-table">
            <thead>
              <tr>
                <th style={{ width: '240px' }}>Task</th>
                <th>How to do it</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Add a student receipt</strong></td>
                <td>Click "+ New Receipt" in top right → fill form → Save</td>
              </tr>
              <tr>
                <td><strong>Add an expense voucher</strong></td>
                <td>Go to Income & Expense → Expenses tab → "+ New Voucher"</td>
              </tr>
              <tr>
                <td><strong>Run monthly payroll</strong></td>
                <td>Go to Employee Salaries → "Pay salaries for month" → Book expenses</td>
              </tr>
              <tr>
                <td><strong>Track monthly targets</strong></td>
                <td>Go to Daily Business → "Set monthly target"</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
