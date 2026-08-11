import React, { useState, useEffect } from 'react';
import { Users, Plus, ShieldCheck, DollarSign, Trash2, Edit, CheckCircle2, Building, Calendar, ArrowLeft } from 'lucide-react';
import AddEmployeeModal from '../components/AddEmployeeModal';
import PaySalariesModal from '../components/PaySalariesModal';

export default function EmployeeSalariesView({ selectedBranch, setSelectedBranch }) {
  const [data, setData] = useState({ employees: [], summary: {} });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);

  useEffect(() => {
    fetchPayroll();
  }, [selectedBranch]);

  const fetchPayroll = () => {
    const params = new URLSearchParams();
    if (selectedBranch) params.append('branch', selectedBranch);

    fetch(`/api/payroll?${params.toString()}`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error(err));
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Delete employee record?')) return;
    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      fetchPayroll();
    } catch (err) {
      console.error(err);
    }
  };

  const { employees = [], summary = {} } = data;
  const branchCode = selectedBranch?.includes('Kolhapur') ? 'KP' : 'PN';
  const branchDisplayName = selectedBranch ? selectedBranch.replace('★', '').trim() : 'Pune (FC Road)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Section Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users className="w-5 h-5 text-indigo-400" />
            Employee Salaries
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: '2px 0 0 0' }}>
            Branch payroll - auto-calculated ESI - books salary, PF and ESI expenses correctly
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsPayModalOpen(true)}
            style={{
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: '800',
              borderRadius: '10px',
              border: 'none',
              background: '#1e3a8a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(30, 58, 138, 0.35)'
            }}
          >
            <span>₹ Pay salaries for month</span>
          </button>

          <button
            onClick={() => { setEditingEmp(null); setIsAddModalOpen(true); }}
            className="btn-primary-green"
            style={{ padding: '9px 18px', fontSize: '13px' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add employee</span>
          </button>
        </div>
      </div>

      {/* Branch Payroll Info Card */}
      <div style={{ background: 'var(--bg-card)', padding: '16px 20px', borderRadius: '16px', border: '1.5px solid var(--border-color)', borderLeft: '4px solid var(--tf-teal-primary)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(13, 148, 136, 0.12)', color: 'var(--tf-teal-primary)', fontWeight: '900', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(13, 148, 136, 0.3)' }}>
          {branchCode}
        </div>
        <div>
          <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', letterSpacing: '0.5px' }}>PAYROLL FOR</span>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '2px 0', color: 'var(--text-white)' }}>{branchDisplayName} · Franchise</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-slate-400)', margin: 0 }}>
            Active employees - ESI auto-calculated for those earning ≤ ₹21,000/month
          </p>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        
        {/* Card 1: MONTHLY NET PAY */}
        <div style={{ background: 'var(--bg-card)', padding: '16px 18px', borderRadius: '16px', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
          <span style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', color: '#60a5fa', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
            MONTHLY NET PAY
          </span>
          <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
            ₹{(summary.netTotal || 0).toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginTop: '4px' }}>
            across {summary.activeEmployees || 0} active employee
          </span>
        </div>

        {/* Card 2: TOTAL CTC (GROSS) */}
        <div style={{ background: 'var(--bg-card)', padding: '16px 18px', borderRadius: '16px', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
          <span style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
            TOTAL CTC (GROSS)
          </span>
          <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
            ₹{(summary.grossTotal || 0).toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginTop: '4px' }}>
            before deductions
          </span>
        </div>

        {/* Card 3: STATUTORY · PF + ESI */}
        <div style={{ background: 'var(--bg-card)', padding: '16px 18px', borderRadius: '16px', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
          <span style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-slate-400)', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
            STATUTORY · PF + ESI
          </span>
          <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
            ₹{(summary.statutoryTotal || 0).toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginTop: '4px' }}>
            PF ₹{(summary.pfTotal || 0).toLocaleString('en-IN')} + ESI ₹0
          </span>
        </div>

        {/* Card 4: TOTAL MONTHLY COST */}
        <div style={{ background: 'var(--bg-card)', padding: '16px 18px', borderRadius: '16px', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
          <span style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--tf-teal-primary)', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
            TOTAL MONTHLY COST
          </span>
          <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
            ₹{(summary.totalMonthlyCost || summary.grossTotal || 0).toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block', marginTop: '4px' }}>
            net pay + statutory + recharge
          </span>
        </div>

      </div>

      {/* Detailed Employee Payroll Table */}
      <div className="portal-table-container">
        <table className="portal-data-table">
          <thead>
            <tr>
              <th style={{ width: '20%' }}>EMPLOYEE · PAID BY</th>
              <th style={{ width: '22%' }}>GROSS PAY</th>
              <th style={{ width: '13%' }}>PF (EMPLOYEE)</th>
              <th style={{ width: '15%' }}>INSURANCE (ESI / ADITYA BIRLA)</th>
              <th style={{ width: '8%', textAlign: 'center' }}>BONUS</th>
              <th style={{ width: '8%', textAlign: 'center' }}>VARIABLE</th>
              <th style={{ width: '8%', textAlign: 'center' }}>RECHARGE</th>
              <th style={{ textAlign: 'right', width: '10%' }}>NET PAY</th>
              <th style={{ textAlign: 'center', width: '6%' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-slate-400)', padding: '36px' }}>
                  No active employees found for {branchDisplayName}. Click "+ Add employee" to add team members.
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const gross = emp.grossSalary || 0;
                const basic = emp.basicSalary || Math.round(gross * 0.5);
                const hra = emp.hra || Math.round(basic * 0.5);
                const conv = emp.conveyance || (gross >= 20000 ? 1600 : Math.round(gross * 0.05));
                const spec = emp.specialAllowance || Math.max(0, gross - (basic + hra + conv));
                const pf = emp.pfDeduction || emp.pfAmount || 0;
                const net = emp.netSalary || gross - pf;

                return (
                  <tr key={emp.id || emp._id}>
                    {/* EMPLOYEE · PAID BY */}
                    <td>
                      <strong style={{ display: 'block', color: '#fff', fontSize: '13.5px', fontWeight: '800' }}>{emp.name}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-slate-400)', display: 'block' }}>{emp.designation} - {branchDisplayName.split(' ')[0]}</span>
                      <span className={`badge-pill ${emp.paidBy === 'Management' ? 'badge-partial' : 'badge-paid'}`} style={{ fontSize: '9px', padding: '2px 6px', marginTop: '4px', display: 'inline-block', fontWeight: 'bold' }}>
                        {emp.paidBy ? emp.paidBy.toUpperCase() : 'PARTNER'}
                      </span>
                    </td>

                    {/* GROSS PAY Breakdown */}
                    <td>
                      <strong style={{ display: 'block', color: 'var(--emerald-primary)', fontSize: '13.5px', fontFamily: 'var(--font-mono)' }}>
                        ₹{gross.toLocaleString('en-IN')}
                      </strong>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)' }}>
                        Basic ₹{basic.toLocaleString('en-IN')} · HRA ₹{hra.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-slate-400)', display: 'block' }}>
                        Conv ₹{conv.toLocaleString('en-IN')} · Sp ₹{spec.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* PF (EMPLOYEE) */}
                    <td>
                      <strong style={{ display: 'block', color: '#fb7185', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                        -₹{pf.toLocaleString('en-IN')}
                      </strong>
                      <span style={{ fontSize: '10px', color: 'var(--text-slate-400)' }}>employer matches</span>
                    </td>

                    {/* INSURANCE */}
                    <td>
                      <strong style={{ display: 'block', color: '#818cf8', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                        ₹{(emp.insuranceAmount || (emp.insuranceType === 'Aditya Birla' ? 1470 : 0)).toLocaleString('en-IN')}
                      </strong>
                      <span style={{ fontSize: '10px', color: 'var(--text-slate-400)' }}>
                        {emp.insuranceType === 'Aditya Birla' ? 'Aditya Birla - employer-paid' : emp.insuranceType === 'ESI' ? 'ESI - employer-paid' : '—'}
                      </span>
                    </td>

                    {/* BONUS */}
                    <td style={{ textAlign: 'center', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)' }}>
                      {emp.defaultBonus ? `₹${emp.defaultBonus}` : '—'}
                    </td>

                    {/* VARIABLE */}
                    <td style={{ textAlign: 'center', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)' }}>
                      {emp.defaultVariable ? `₹${emp.defaultVariable}` : '—'}
                    </td>

                    {/* RECHARGE */}
                    <td style={{ textAlign: 'center', color: 'var(--text-slate-400)', fontFamily: 'var(--font-mono)' }}>
                      {emp.mobileRecharge ? `₹${emp.mobileRecharge}` : '—'}
                    </td>

                    {/* NET PAY Badge Cell */}
                    <td style={{ textAlign: 'right', background: 'rgba(217, 119, 6, 0.08)', borderRadius: '10px', padding: '10px 14px' }}>
                      <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '14.5px', color: '#d97706' }}>
                        ₹{net.toLocaleString('en-IN')}
                      </strong>
                    </td>

                    {/* ACTIONS */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button
                          onClick={() => { setEditingEmp(emp); setIsAddModalOpen(true); }}
                          className="action-btn"
                          style={{ border: '1px solid var(--border-color)', padding: '4px 10px', fontSize: '11px', borderRadius: '6px' }}
                          title="Edit Employee"
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteEmployee(emp.id || emp._id)} className="action-btn" style={{ color: '#fb7185', padding: '4px' }} title="Delete Employee">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingEmp(null); }}
        onSaveSuccess={() => fetchPayroll()}
        initialBranch={selectedBranch}
        initialData={editingEmp}
      />

      {/* Pay Salaries Modal */}
      <PaySalariesModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        onSaveSuccess={() => fetchPayroll()}
        initialBranch={selectedBranch}
        employees={employees}
      />

    </div>
  );
}
