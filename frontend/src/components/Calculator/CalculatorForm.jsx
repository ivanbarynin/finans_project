import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const CalculatorForm = ({ onCalculate, preset }) => {
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState(() => ({
    propertyPrice: Number(searchParams.get('propertyPrice')) || 8000000,
    downPaymentPercent: Number(searchParams.get('downPaymentPercent')) || 20,
    termYears: Number(searchParams.get('termYears')) || 20,
    rate: Number(searchParams.get('rate')) || 6,
    paymentType: searchParams.get('paymentType') || 'annuity',
    hasChildren: searchParams.get('hasChildren') === 'true',
    isIT: searchParams.get('isIT') === 'true',
  }));

  // Применить URL-параметры при навигации с другой страницы
  useEffect(() => {
    const paramsStr = searchParams.toString();
    if (!paramsStr) return;
    const updates = {};
    const rate = searchParams.get('rate');
    const propertyPrice = searchParams.get('propertyPrice');
    const hasChildren = searchParams.get('hasChildren');
    const isIT = searchParams.get('isIT');
    const downPaymentPercent = searchParams.get('downPaymentPercent');
    const termYears = searchParams.get('termYears');
    const paymentType = searchParams.get('paymentType');
    if (rate !== null) updates.rate = Number(rate);
    if (propertyPrice !== null) updates.propertyPrice = Number(propertyPrice);
    if (hasChildren !== null) updates.hasChildren = hasChildren === 'true';
    if (isIT !== null) updates.isIT = isIT === 'true';
    if (downPaymentPercent !== null) updates.downPaymentPercent = Number(downPaymentPercent);
    if (termYears !== null) updates.termYears = Number(termYears);
    if (paymentType !== null) updates.paymentType = paymentType;
    if (Object.keys(updates).length > 0) {
      setFormData((prev) => ({ ...prev, ...updates }));
    }
  }, [searchParams.toString()]);

  // Применить пресет при нажатии "Подробнее" на той же странице
  useEffect(() => {
    if (!preset) return;
    const { _ts, ...values } = preset;
    if (Object.keys(values).length > 0) {
      setFormData((prev) => ({ ...prev, ...values }));
    }
  }, [preset]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : type === 'range' || ['propertyPrice', 'downPaymentPercent', 'termYears', 'rate'].includes(name)
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const downPayment = (formData.propertyPrice * formData.downPaymentPercent) / 100;
    onCalculate(
      formData.propertyPrice,
      downPayment,
      formData.termYears,
      formData.rate,
      formData.paymentType,
      formData.hasChildren,
      formData.isIT,
      'other'
    );
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('ru-RU').format(Math.round(value));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6">Параметры расчёта</h2>

      {/* Стоимость недвижимости */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <label className="block text-sm font-medium">Стоимость недвижимости</label>
          <span className="text-lg font-bold text-blue-600">{formatPrice(formData.propertyPrice)} ₽</span>
        </div>
        <input
          type="range"
          name="propertyPrice"
          value={formData.propertyPrice}
          onChange={handleChange}
          min="5000000"
          max="100000000"
          step="500000"
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>5 млн</span>
          <span>100 млн</span>
        </div>
      </div>

      {/* Первоначальный взнос */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <label className="block text-sm font-medium">Первоначальный взнос</label>
          <span className="text-lg font-bold text-blue-600">{formData.downPaymentPercent}%</span>
        </div>
        <input
          type="range"
          name="downPaymentPercent"
          value={formData.downPaymentPercent}
          onChange={handleChange}
          min="0"
          max="100"
          step="1"
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Срок кредита */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <label className="block text-sm font-medium">Срок кредита</label>
          <span className="text-lg font-bold text-blue-600">{formData.termYears} лет</span>
        </div>
        <input
          type="range"
          name="termYears"
          value={formData.termYears}
          onChange={handleChange}
          min="1"
          max="50"
          step="1"
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 год</span>
          <span>50 лет</span>
        </div>
      </div>

      {/* Процентная ставка */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <label className="block text-sm font-medium">Процентная ставка</label>
          <span className="text-lg font-bold text-blue-600">{Number(formData.rate).toFixed(1)}%</span>
        </div>
        <input
          type="range"
          name="rate"
          value={formData.rate}
          onChange={handleChange}
          min="1"
          max="30"
          step="0.1"
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1%</span>
          <span>30%</span>
        </div>
      </div>

      {/* Схема платежей */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Схема платежей</label>
        <select
          name="paymentType"
          value={formData.paymentType}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded bg-white"
        >
          <option value="annuity">Аннуитетная</option>
          <option value="differentiated">Дифференцированная</option>
        </select>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="hasChildren"
              checked={formData.hasChildren}
              onChange={handleChange}
            />
            <span>Есть дети</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isIT"
              checked={formData.isIT}
              onChange={handleChange}
            />
            <span>Работаю в IT</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg hover:from-red-700 hover:to-red-800 font-bold shadow-lg text-lg"
      >
        Рассчитать
      </button>
    </form>
  );
};
