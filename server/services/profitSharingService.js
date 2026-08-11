export const BRANCH_EQUITY_CONFIGS = {
  Pune: [
    { stakeholder: 'Pune College', percentage: 50, color: '#3b82f6' },
    { stakeholder: 'Thoughtflows (HQ)', percentage: 25, color: '#10b981' },
    { stakeholder: 'Career Vidhyalaya', percentage: 20, color: '#8b5cf6' },
    { stakeholder: 'Nilanjan', percentage: 5, color: '#f59e0b' }
  ],
  Kolhapur: [
    { stakeholder: 'Genesis College', percentage: 50, color: '#06b6d4' },
    { stakeholder: 'Thoughtflows (HQ)', percentage: 25, color: '#10b981' },
    { stakeholder: 'Career Vidhyalaya', percentage: 25, color: '#8b5cf6' }
  ],
  Standard: [
    { stakeholder: 'Franchise Partner', percentage: 50, color: '#3b82f6' },
    { stakeholder: 'Thoughtflows (HQ)', percentage: 50, color: '#10b981' }
  ]
};

export function calculateProfitDistribution(branchName, netProfit) {
  let key = 'Pune';
  if (branchName && branchName.toLowerCase().includes('kolhapur')) {
    key = 'Kolhapur';
  } else if (branchName && branchName.toLowerCase().includes('pune')) {
    key = 'Pune';
  } else {
    key = 'Pune'; // Default Maharashtra primary branch
  }

  const config = BRANCH_EQUITY_CONFIGS[key] || BRANCH_EQUITY_CONFIGS.Pune;

  const distribution = config.map(item => ({
    stakeholder: item.stakeholder,
    percentage: item.percentage,
    color: item.color,
    distributedAmount: parseFloat(((netProfit * item.percentage) / 100).toFixed(2))
  }));

  return {
    branchKey: key,
    distribution
  };
}
