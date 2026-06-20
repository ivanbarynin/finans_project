import { useState, useCallback } from 'react';
import { calculateMortgage } from '../utils/mortgage';

export const useCalculator = () => {
  const [result, setResult] = useState(null);

  const calculate = useCallback((propertyPrice, downPayment, termYears, rate, type) => {
    const calculation = calculateMortgage(propertyPrice, downPayment, termYears, rate, type);
    setResult(calculation);
    return calculation;
  }, []);

  return { result, calculate };
};
