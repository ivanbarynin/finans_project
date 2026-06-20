import { CalculatorForm } from '../components/Calculator/CalculatorForm';
import { CalculatorResult } from '../components/Calculator/CalculatorResult';
import { AmortizationChart } from '../components/Calculator/AmortizationChart';
import { ProgramCard } from '../components/Programs/ProgramCard';
import { useCalculator } from '../hooks/useCalculator';
import { useAuth } from '../hooks/useAuth';
import { useState, useRef } from 'react';
import { programService } from '../services/programService';

export const HomePage = () => {
  const { result, calculate } = useCalculator();
  const { user } = useAuth();
  const [paymentType, setPaymentType] = useState('annuity');
  const [programs, setPrograms] = useState([]);
  const [formPreset, setFormPreset] = useState(null);
  const [lastParams, setLastParams] = useState(null);
  const formRef = useRef(null);

  const handleCalculate = (propertyPrice, downPayment, termYears, rate, type, hasChildren, isIT, region) => {
    setPaymentType(type);
    const loanAmount = propertyPrice - downPayment;
    setLastParams({ propertyPrice, downPayment, loanAmount, termYears, rate, paymentType: type });
    calculate(propertyPrice, downPayment, termYears, rate, type);
    loadPrograms({ hasChildren, isIT, region, isYoungFamily: false, isSVOParticipant: false, isMultiChild: false, isAPKWorker: false });
  };

  const loadPrograms = async (filterData) => {
    try {
      const response = await programService.getAll(
        filterData.hasChildren || false,
        filterData.isIT || false,
        filterData.region,
        filterData.isYoungFamily || false,
        filterData.isSVOParticipant || false,
        filterData.isMultiChild || false,
        filterData.isAPKWorker || false
      );
      setPrograms(response.data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
      setPrograms([]);
    }
  };

  const handleProgramSelect = (program) => {
    const preset = {};
    if (program.conditions.maxRate != null) preset.rate = program.conditions.maxRate;
    if (program.conditions.maxAmount != null) preset.propertyPrice = program.conditions.maxAmount;
    if (program.conditions.requiresChildren) preset.hasChildren = true;
    if (program.conditions.requiresIT) preset.isIT = true;
    setFormPreset({ ...preset, _ts: Date.now() });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8 tracking-tight">Калькулятор ипотеки</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1" ref={formRef}>
          <CalculatorForm onCalculate={handleCalculate} preset={formPreset} />
        </div>

        <div className="lg:col-span-2">
          {result ? (
            <>
              <CalculatorResult result={result} paymentType={paymentType} params={lastParams} />
              <AmortizationChart schedule={result.schedule} />

              {programs.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">Подходящие льготные программы</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {programs.map((program) => (
                      <ProgramCard key={program.id} program={program} onSelect={handleProgramSelect} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 p-12 rounded text-center text-gray-600">
              Заполните форму и нажмите "Рассчитать"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
