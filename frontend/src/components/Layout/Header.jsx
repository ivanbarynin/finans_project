import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition">
          <img src="/images/logo.png" alt="Ипотечный калькулятор" className="h-12 w-12 object-contain" />
          <span className="text-2xl font-bold tracking-tight">
            Ипотечный калькулятор
          </span>
        </Link>

        <nav className="flex gap-6 items-center">
          <Link to="/" className="hover:opacity-80">
            Калькулятор
          </Link>
          <Link to="/programs" className="hover:opacity-80">
            Программы
          </Link>
          {user && (
            <>
              <Link to="/compare" className="hover:opacity-80">
                Сравнение
              </Link>
              <Link to="/dashboard" className="hover:opacity-80">
                Кабинет
              </Link>
              {user.is_admin && (
                <Link to="/admin" className="hover:opacity-80 bg-yellow-400 text-red-700 px-3 py-1 rounded font-semibold text-sm">
                  Админ
                </Link>
              )}
            </>
          )}

          {user ? (
            <div className="flex gap-4 items-center">
              <span>{user.name || user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-yellow-400 text-red-700 px-4 py-2 rounded hover:bg-yellow-300 font-semibold"
              >
                Выход
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="bg-white text-red-600 px-4 py-2 rounded hover:bg-gray-100 font-semibold">
                Вход
              </Link>
              <Link to="/register" className="bg-yellow-400 text-red-700 px-4 py-2 rounded hover:bg-yellow-300 font-semibold">
                Регистрация
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
