/**
 * Profit Sharing & Branch Equity Service
 * 
 * Implements the Maharashtra Franchise Agreements:
 * Agreement 1: Entire Maharashtra exclusively given to Career Vidyalaya and Nilanjan (no other outside partners).
 * Agreement 2: Pune Location Equity Share: Thoughtflows (TF) - 50%, Career Vidyalaya - 25%, Nilanjan - 25%.
 * Agreement 3: Kolhapur Location Equity Share: Genesis - 50%, Thoughtflows (TF) - 25%, Career Vidyalaya - 20%, Nilanjan - 5%.
 */

export const BRANCH_AGREEMENTS = {
  Pune: {
    title: 'Agreement 2: Pune Location Equity Split',
    detail: 'Thoughtflows (TF): 50% | Career Vidyalaya: 25% | Nilanjan: 25%',
    note: 'Standard Pune branch franchise distribution model.'
  },
  Kolhapur: {
    title: 'Agreement 3: Kolhapur Location Equity Split',
    detail: 'Genesis College: 50% | Thoughtflows (TF): 25% | Career Vidyalaya: 20% | Nilanjan: 5%',
    note: 'Includes local institutional partner (Genesis College 50%).'
  },
  All: {
    title: 'Agreement 1: Entire MH Territory Exclusive Franchise',
    detail: 'Exclusive to Career Vidyalaya & Nilanjan — TF: 50% | Career Vidyalaya: 25% | Nilanjan: 25%',
    note: 'Maharashtra exclusive partnership: Career Vidyalaya & Nilanjan only.'
  },
  Standard: {
    title: 'Agreement 1: Entire MH Territory Exclusive Franchise',
    detail: 'Exclusive to Career Vidyalaya & Nilanjan — TF: 50% | Career Vidyalaya: 25% | Nilanjan: 25%',
    note: 'Maharashtra exclusive partnership: Career Vidyalaya & Nilanjan only.'
  }
};

export const BRANCH_EQUITY_CONFIGS = {
  Pune: [
    { stakeholder: 'Thoughtflows (TF)', key: 'TF', percentage: 50, color: '#10b981' },
    { stakeholder: 'Career Vidyalaya', key: 'Career Vidyalaya', percentage: 25, color: '#8b5cf6' },
    { stakeholder: 'Nilanjan', key: 'Nilanjan', percentage: 25, color: '#f59e0b' }
  ],
  Kolhapur: [
    { stakeholder: 'Genesis College', key: 'Genesis', percentage: 50, color: '#06b6d4' },
    { stakeholder: 'Thoughtflows (TF)', key: 'TF', percentage: 25, color: '#10b981' },
    { stakeholder: 'Career Vidyalaya', key: 'Career Vidyalaya', percentage: 20, color: '#8b5cf6' },
    { stakeholder: 'Nilanjan', key: 'Nilanjan', percentage: 5, color: '#f59e0b' }
  ],
  All: [
    { stakeholder: 'Thoughtflows (TF)', key: 'TF', percentage: 50, color: '#10b981' },
    { stakeholder: 'Career Vidyalaya', key: 'Career Vidyalaya', percentage: 25, color: '#8b5cf6' },
    { stakeholder: 'Nilanjan', key: 'Nilanjan', percentage: 25, color: '#f59e0b' }
  ],
  Standard: [
    { stakeholder: 'Thoughtflows (TF)', key: 'TF', percentage: 50, color: '#10b981' },
    { stakeholder: 'Career Vidyalaya', key: 'Career Vidyalaya', percentage: 25, color: '#8b5cf6' },
    { stakeholder: 'Nilanjan', key: 'Nilanjan', percentage: 25, color: '#f59e0b' }
  ]
};

export function calculateProfitDistribution(branchName, netProfit) {
  let key = 'Pune';
  const nameLower = (branchName || '').toLowerCase();
  
  if (nameLower.includes('kolhapur')) {
    key = 'Kolhapur';
  } else if (nameLower.includes('pune')) {
    key = 'Pune';
  } else if (nameLower.includes('all')) {
    key = 'All';
  } else {
    key = 'Pune'; // Default Maharashtra primary branch
  }

  const config = BRANCH_EQUITY_CONFIGS[key] || BRANCH_EQUITY_CONFIGS.Pune;
  const agreementInfo = BRANCH_AGREEMENTS[key] || BRANCH_AGREEMENTS.Pune;

  const distribution = config.map(item => ({
    stakeholder: item.stakeholder,
    key: item.key,
    percentage: item.percentage,
    color: item.color,
    distributedAmount: parseFloat(((netProfit * item.percentage) / 100).toFixed(2))
  }));

  return {
    branchKey: key,
    agreement: agreementInfo.title,
    agreementDetail: agreementInfo.detail,
    distribution
  };
}
