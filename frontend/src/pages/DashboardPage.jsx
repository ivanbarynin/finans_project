import { useState, useEffect } from 'react';
import { calculationService } from '../services/calculationService';

export const DashboardPage = () => {
  const [calculations, setCalculations] = useState([]);
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

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить расчёт?')) return;

    try {
      await calculationService.delete(id);
      setCalculations((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting calculation:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ru-RU').format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8 tracking-tight">Личный кабинет</h1>

      {loading ? (
        <div className="text-center text-gray-600 py-12">Загрузка...</div>
      ) : calculations.length === 0 ? (
        <div className="bg-gray-50 p-12 rounded text-center text-gray-600">
          У вас нет сохранённых расчётов
        </div>
      ) : (
        <div className="space-y-4">
          {calculations.map((calc) => (
            <div key={calc.id} className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">{formatDate(calc.created_at)}</p>
                <p className="text-xl font-bold">
                  Сумма кредита: {formatCurrency(calc.params.loanAmount)} ₽
                </p>
                <p className="text-gray-600">
                  Ставка: {calc.params.rate}% | Срок: {calc.params.termYears} лет
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(calc.result.monthlyPayment || calc.result.firstPayment)} ₽
                </p>
                <button
                  onClick={() => handleDelete(calc.id)}
                  className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
