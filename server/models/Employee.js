import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  branchCode: { type: String, required: true },
  name: { type: String, required: true },
  designation: { type: String, required: true },
  joiningDate: { type: String, required: true },
  status: { type: String, default: 'Active (included in payroll)' },
  
  grossSalary: { type: Number, required: true },
  paidBy: { type: String, default: 'Partner' }, // 'Partner' | 'Management'
  basicSalary: { type: Number, default: 0 },
  hra: { type: Number, default: 0 },
  conveyance: { type: Number, default: 0 },
  specialAllowance: { type: Number, default: 0 },
  pfDeduction: { type: Number, default: 0 },
  
  insuranceType: { type: String, default: 'None' }, // 'None' | 'ESI' | 'Aditya Birla'
  insuranceAmount: { type: Number, default: 0 },
  
  defaultBonus: { type: Number, default: 0 },
  defaultVariable: { type: Number, default: 0 },
  mobileRecharge: { type: Number, default: 0 },
  rechargePaidBy: { type: String, default: 'Employee (we reimburse -> added to net pay)' },
  
  netSalary: { type: Number, required: true }
}, {
  timestamps: true
});

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
