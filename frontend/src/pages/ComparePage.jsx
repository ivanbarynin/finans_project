import { useState, useEffect } from 'react';
import { calculationService } from '../services/calculationService';

export const ComparePage = () => {
  const [calculations, setCalculations] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalculations();
  }, []);

  const loadCalculations = async () => {
    try {
      const response = await calculationService.getAll();
      setCalculations(response.data);
    } catch (error) {
      console.error('Error loading calculations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id].slice(-3)
    );
  };

  const selectedCalcs = calculations.filter((c) => selectedIds.includes(c.id));

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ru-RU').format(value);
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8 tracking-tight">Сравнение расчётов</h1>

      {loading ? (
        <div className="text-center text-gray-600 py-12">Загрузка...</div>
      ) : calculations.length === 0 ? (
        <div className="bg-gray-50 p-12 rounded text-center text-gray-600">
          Нет расчётов для сравнения
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-lg font-bold mb-4">Выберите до 3 расчётов</h2>
            <div className="space-y-2">
              {calculations.map((calc) => (
                <label key={calc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(calc.id)}
                    onChange={() => toggleSelect(calc.id)}
                  />
                  <span className="flex-1">
                    {formatCurrency(calc.params.loanAmount)} ₽ @ {calc.params.rate}% на{' '}
                    {calc.params.termYears} лет
                  </span>
                </label>
              ))}
            </div>
          </div>

          {selectedCalcs.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Параметр</th>
                    {selectedCalcs.map((calc, idx) => (
                      <th key={idx} className="px-4 py-3 text-center">
                        Вариант {idx + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-3 font-semibold">Сумма кредита</td>
                    {selectedCalcs.map((calc, idx) => (
                      <td key={idx} className="px-4 py-3 text-center">
                        {formatCurrency(calc.params.loanAmount)} ₽
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t bg-gray-50">
                    <td className="px-4 py-3 font-semibold">Ставка</td>
                    {selectedCalcs.map((calc, idx) => (
                      <td key={idx} className="px-4 py-3 text-center">
                        {calc.params.rate}%
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-3 font-semibold">Срок</td>
                    {selectedCalcs.map((calc, idx) => (
                      <td key={idx} className="px-4 py-3 text-center">
                        {calc.params.termYears} лет
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t bg-blue-50">
                    <td className="px-4 py-3 font-semibold">Ежемесячный платёж</td>
                    {selectedCalcs.map((calc, idx) => (
                      <td key={idx} className="px-4 py-3 text-center font-bold">
                        {formatCurrency(
                          calc.result.monthlyPayment || calc.result.firstPayment
                        )}{' '}
                        ₽
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-3 font-semibold">Всего выплачено</td>
                    {selectedCalcs.map((calc, idx) => (
                      <td key={idx} className="px-4 py-3 text-center">
                        {formatCurrency(calc.result.totalPaid)} ₽
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t bg-red-50">
                    <td className="px-4 py-3 font-semibold">Переплата</td>
                    {selectedCalcs.map((calc, idx) => (
                      <td key={idx} className="px-4 py-3 text-center font-bold text-red-600">
                        {formatCurrency(calc.result.overpayment)} ₽
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
