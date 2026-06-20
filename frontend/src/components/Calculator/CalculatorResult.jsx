import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculationService } from '../../services/calculationService';
import { useAuth } from '../../hooks/useAuth';

export const CalculatorResult = ({ result, paymentType, params }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!result) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ru-RU').format(Math.round(value));
  };

  const handleSave = async () => {
    if (!user) {
      alert('Войдите в аккаунт, чтобы сохранить расчёт');
      return;
    }
    setSaving(true);
    try {
      const { schedule, ...resultWithoutSchedule } = result;
      await calculationService.save(params, resultWithoutSchedule);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      const detail = e.response?.data?.detail || '';
      if (e.response?.status === 404 || detail === 'User not found') {
        logout();
        alert('Сессия устарела. Пожалуйста, войдите снова.');
        navigate('/login');
      } else {
        alert('Ошибка при сохранении: ' + (detail || e.message));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Результаты расчёта</h2>

      {paymentType === 'annuity' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg border-l-4 border-red-600 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-1">Ежемесячный платёж</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(result.monthlyPayment)} ₽</p>
            <p className="text-gray-500 text-xs mt-2">Стабильный платёж</p>
          </div>

          <div className="bg-white p-5 rounded-lg border-l-4 border-green-600 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-1">Всего выплачено</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(result.totalPaid)} ₽</p>
            <p className="text-gray-500 text-xs mt-2">За весь срок</p>
          </div>

          <div className="bg-white p-5 rounded-lg border-l-4 border-red-600 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-1">Переплата</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(result.overpayment)} ₽</p>
            <p className="text-gray-500 text-xs mt-2">Проценты</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg border-l-4 border-red-600 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-1">Первый платёж</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(result.firstPayment)} ₽</p>
          </div>

          <div className="bg-white p-5 rounded-lg border-l-4 border-purple-600 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-1">Средний платёж</p>
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(result.avgPayment)} ₽</p>
          </div>

          <div className="bg-white p-5 rounded-lg border-l-4 border-red-600 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-1">Последний платёж</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(result.lastPayment)} ₽</p>
          </div>

          <div className="bg-white p-5 rounded-lg border-l-4 border-green-600 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-1">Всего выплачено</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(result.totalPaid)} ₽</p>
          </div>

          <div className="bg-white p-5 rounded-lg border-l-4 border-red-600 shadow-sm md:col-span-2">
            <p className="text-gray-600 text-sm font-medium mb-1">Переплата</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(result.overpayment)} ₽</p>
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || saved}
        className="mt-6 w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg hover:from-red-700 hover:to-red-800 font-bold shadow-lg text-lg disabled:opacity-70 transition"
      >
        {saved ? 'Сохранено' : saving ? 'Сохранение...' : 'Сохранить расчёт'}
      </button>
    </div>
  );
};
