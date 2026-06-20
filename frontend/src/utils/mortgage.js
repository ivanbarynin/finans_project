export const calculateAnnuityPayment = (loanAmount, annualRate, months) => {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return loanAmount / months;

  const monthlyPayment =
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return monthlyPayment;
};

export const calculateDifferentiatedPayment = (loanAmount, annualRate, months) => {
  const monthlyRate = annualRate / 12 / 100;
  const principalPayment = loanAmount / months;
  const payments = [];

  let remainingBalance = loanAmount;
  for (let i = 0; i < months; i++) {
    const interestPayment = remainingBalance * monthlyRate;
    const totalPayment = principalPayment + interestPayment;
    payments.push({
      month: i + 1,
      principal: principalPayment,
      interest: interestPayment,
      total: totalPayment,
      remaining: Math.max(0, remainingBalance - principalPayment),
    });
    remainingBalance -= principalPayment;
  }

  return payments;
};

export const generateAnnuitySchedule = (loanAmount, annualRate, months) => {
  const monthlyRate = annualRate / 12 / 100;
  const monthlyPayment = calculateAnnuityPayment(loanAmount, annualRate, months);

  const schedule = [];
  let remainingBalance = loanAmount;

  for (let i = 0; i < months; i++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance = Math.max(0, remainingBalance - principalPayment);

    schedule.push({
      month: i + 1,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      remaining: remainingBalance,
    });
  }

  return schedule;
};

export const calculateMortgage = (propertyPrice, downPayment, termYears, rate, type) => {
  const loanAmount = propertyPrice - downPayment;
  const months = termYears * 12;

  if (type === 'annuity') {
    const monthlyPayment = calculateAnnuityPayment(loanAmount, rate, months);
    const totalPaid = monthlyPayment * months;
    const overpayment = totalPaid - loanAmount;
    const schedule = generateAnnuitySchedule(loanAmount, rate, months);

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalPaid: Math.round(totalPaid),
      overpayment: Math.round(overpayment),
      schedule,
    };
  } else if (type === 'differentiated') {
    const payments = calculateDifferentiatedPayment(loanAmount, rate, months);
    const totalPaid = payments.reduce((sum, p) => sum + p.total, 0);
    const overpayment = totalPaid - loanAmount;
    const firstPayment = payments[0].total;
    const lastPayment = payments[months - 1].total;

    return {
      firstPayment: Math.round(firstPayment),
      lastPayment: Math.round(lastPayment),
      avgPayment: Math.round(totalPaid / months),
      totalPaid: Math.round(totalPaid),
      overpayment: Math.round(overpayment),
      schedule: payments,
    };
  }

  return null;
};
