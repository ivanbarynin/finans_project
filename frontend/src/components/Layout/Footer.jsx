import { useState } from 'react';
import api from '../../services/api';

export const Footer = () => {
  const [supportMessage, setSupportMessage] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/support', { email: supportEmail, message: supportMessage });
      setSubmitted(true);
      setSupportMessage('');
      setSupportEmail('');
      setTimeout(() => setSubmitted(false), 4000);
    } catch {
      alert('Ошибка отправки. Попробуйте позже.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-gradient-to-r from-red-900 to-red-800 text-white p-12 mt-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* О приложении */}
          <div>
            <h3 className="text-lg font-bold mb-4">О приложении</h3>
            <p className="text-gray-400 text-sm">
              Ипотечный калькулятор помогает рассчитать размер ежемесячного платежа и подобрать оптимальную льготную программу.
            </p>
            <p className="text-gray-300 text-sm mt-4 font-semibold">
              Разработчик: Барынин Иван Алексеевич
            </p>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-lg font-bold mb-4">Контакты</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>
                <span className="font-semibold">Email:</span>
                <a href="mailto:support@mortgage-calc.ru" className="ml-2 hover:text-white">
                  support@mortgage-calc.ru
                </a>
              </p>
              <p>
                <span className="font-semibold">Телефон:</span>
                <a href="tel:+79991234567" className="ml-2 hover:text-white">
                  +7 (999) 123-45-67
                </a>
              </p>
              <p>
                <span className="font-semibold">Поддержка:</span>
                <span className="ml-2">Пн-Пт 9:00-18:00</span>
              </p>
            </div>
          </div>

          {/* Форма поддержки */}
          <div>
            <h3 className="text-lg font-bold mb-4">Форма поддержки</h3>
            <form onSubmit={handleSupportSubmit} className="space-y-2">
              <input
                type="email"
                placeholder="Ваш email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm placeholder-gray-500 border border-gray-600 focus:border-blue-500 focus:outline-none"
                required
              />
              <textarea
                placeholder="Ваше сообщение"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm placeholder-gray-500 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 rounded text-sm font-bold transition shadow-md disabled:opacity-60"
              >
                {submitting ? 'Отправка...' : 'Отправить'}
              </button>
              {submitted && (
                <p className="text-green-400 text-xs text-center">Сообщение отправлено! Мы ответим на ваш email.</p>
              )}
            </form>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
            <p>© 2026 Ипотечный калькулятор</p>
            <div className="text-right space-x-4">
              <a href="#" className="hover:text-white">Политика конфиденциальности</a>
              <a href="#" className="hover:text-white">Условия использования</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
