import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, Users, Sparkles, Trophy, Landmark, ArrowUpRight, Clock, AlertTriangle } from 'lucide-react';

export default function DashboardView({ selectedBranch }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedBranch) params.append('branch', selectedBranch);

    setLoading(true);
    fetch(`/api/stats?${params.toString()}`)
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [selectedBranch]);

  return (
    <div className="animate-fade-in">
      
      {/* Metrics Bar */}
      <div className="metrics-grid-4">
        
        <div className="metric-card-box">
          <div className="metric-header-flex">
            <span className="metric-title-label">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="metric-value-amount" style={{ color: 'var(--emerald-primary)' }}>
            ₹{stats ? stats.totalCollected.toLocaleString('en-IN') : '0'}
          </div>
          <span className="metric-subtitle-text">Gross Collections</span>
        </div>

        <div className="metric-card-box">
          <div className="metric-header-flex">
            <span className="metric-title-label">Total Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="metric-value-amount" style={{ color: 'var(--rose-primary)' }}>
            ₹{stats ? stats.totalExpenses.toLocaleString('en-IN') : '0'}
          </div>
          <span className="metric-subtitle-text">Operational Expenditure</span>
        </div>

        <div className="metric-card-box">
          <div className="metric-header-flex">
            <span className="metric-title-label">Partnership Profit</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="metric-value-amount" style={{ color: 'var(--amber-primary)' }}>
            ₹{stats ? stats.netProfit.toLocaleString('en-IN') : '0'}
          </div>
          <span className="metric-subtitle-text">Net Distributable Pool</span>
        </div>

        <div className="metric-card-box">
          <div className="metric-header-flex">
            <span className="metric-title-label">Total Leads</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="metric-value-amount" style={{ color: 'var(--blue-primary)' }}>
            {stats ? stats.totalLeads : '0'}
          </div>
          <span className="metric-subtitle-text">Inquiries & Admissions</span>
        </div>

      </div>

      {/* Grid: Franchise Pulse Leaderboard & Treasury Alerts */}
      <div className="dashboard-grid-2">
        
        {/* Franchise Pulse Leaderboard */}
        <div className="dashboard-panel-card">
          <div className="panel-title-bar">
            <h3 className="panel-heading">
              <Trophy className="w-5 h-5 text-amber-400" />
              Franchise Pulse — Monthly Admissions Leaderboard
            </h3>
            <span className="sidebar-badge badge-emerald">Real-Time</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats && stats.leaderboard && stats.leaderboard.map((item, idx) => (
              <div key={item.branch} className="pulse-rank-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className={`rank-badge-number ${idx === 0 ? 'rank-top-1' : idx === 1 ? 'rank-top-2' : idx === 2 ? 'rank-top-3' : ''}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#fff', display: 'block' }}>{item.branch}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-slate-400)' }}>Monthly Target Achieved</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>
                    {item.admissionsCount} admissions
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block' }}>
                    ₹{item.revenue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Treasury Position Alerts */}
        <div className="dashboard-panel-card">
          <div className="panel-title-bar">
            <h3 className="panel-heading">
              <Landmark className="w-5 h-5 text-cyan-400" />
              Treasury Position Alerts
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '14px', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: '12px' }}>
              <span style={{ fontSize: '11px', color: 'var(--cyan-primary)', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>IDFC Main Joint Account</span>
              <span style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: '#fff', margin: '4px 0', display: 'block' }}>₹{stats ? stats.idfcMainBalance.toLocaleString('en-IN') : '0'}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-slate-400)' }}>Joint Management Account Balance</span>
            </div>

            <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px' }}>
              <span style={{ fontSize: '11px', color: 'var(--emerald-primary)', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Partner Counter Cash</span>
              <span style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: '#fff', margin: '4px 0', display: 'block' }}>₹{stats ? stats.partnerCashBalance.toLocaleString('en-IN') : '0'}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-slate-400)' }}>Franchisee Local Cash Pool</span>
            </div>

            <div style={{ padding: '14px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#fb7185' }}>Pending Fees Alert</span>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-slate-300)' }}>₹{stats ? stats.pendingFeesAmount.toLocaleString('en-IN') : '0'} pending across {stats ? stats.pendingFeesCount : 0} active records.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
