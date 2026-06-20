import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { useAuth } from '../hooks/useAuth';

const EMPTY_PROGRAM = {
  name: '',
  description: '',
  conditions: { maxRate: '', maxAmount: '', requiresChildren: false, requiresIT: false, regions: ['all'] },
  is_active: true,
};

export const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [calculations, setCalculations] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [editingProgram, setEditingProgram] = useState(null);
  const [programForm, setProgramForm] = useState(EMPTY_PROGRAM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.is_admin) { navigate('/'); return; }
    loadStats();
  }, [user]);

  useEffect(() => {
    if (tab === 'stats') loadStats();
    if (tab === 'users') loadUsers();
    if (tab === 'calculations') loadCalculations();
    if (tab === 'programs') loadPrograms();
    if (tab === 'support') loadSupportRequests();
  }, [tab]);

  const loadStats = async () => {
    try { const r = await adminService.getStats(); setStats(r.data); } catch {}
  };
  const loadUsers = async () => {
    try { const r = await adminService.getUsers(); setUsers(r.data); } catch {}
  };
  const loadCalculations = async () => {
    try { const r = await adminService.getCalculations(); setCalculations(r.data); } catch {}
  };
  const loadPrograms = async () => {
    try {
      const { programService } = await import('../services/programService');
      const r = await programService.getAll();
      setPrograms(r.data);
    } catch {}
  };

  const loadSupportRequests = async () => {
    try { const r = await adminService.getSupportRequests(); setSupportRequests(r.data); } catch {}
  };

  const handleMarkRead = async (id) => {
    await adminService.markSupportRead(id);
    setSupportRequests(prev => prev.map(r => r.id === id ? { ...r, is_read: true } : r));
    loadStats();
  };

  const handleDeleteSupport = async (id) => {
    if (!confirm('Удалить обращение?')) return;
    await adminService.deleteSupportRequest(id);
    setSupportRequests(prev => prev.filter(r => r.id !== id));
    loadStats();
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Удалить пользователя?')) return;
    await adminService.deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleToggleAdmin = async (id) => {
    const r = await adminService.toggleAdmin(id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_admin: r.data.is_admin } : u));
  };

  const handleDeleteProgram = async (id) => {
    if (!confirm('Удалить программу?')) return;
    await adminService.deleteProgram(id);
    setPrograms(prev => prev.filter(p => p.id !== id));
  };

  const handleProgramSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...programForm,
      conditions: {
        ...programForm.conditions,
        maxRate: programForm.conditions.maxRate ? Number(programForm.conditions.maxRate) : null,
        maxAmount: programForm.conditions.maxAmount ? Number(programForm.conditions.maxAmount) : null,
      },
    };
    try {
      if (editingProgram) {
        const r = await adminService.updateProgram(editingProgram.id, payload);
        setPrograms(prev => prev.map(p => p.id === editingProgram.id ? r.data : p));
      } else {
        const r = await adminService.createProgram(payload);
        setPrograms(prev => [r.data, ...prev]);
      }
      setEditingProgram(null);
      setProgramForm(EMPTY_PROGRAM);
    } catch (err) {
      alert('Ошибка: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (program) => {
    setEditingProgram(program);
    setProgramForm({
      name: program.name,
      description: program.description || '',
      conditions: { ...program.conditions },
      is_active: program.is_active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fmt = (n) => new Intl.NumberFormat('ru-RU').format(n);
  const fmtDate = (d) => new Date(d).toLocaleDateString('ru-RU');

  const unread = stats?.unread_support_requests ?? supportRequests.filter(r => !r.is_read).length ?? 0;

  const tabs = [
    { key: 'stats', label: 'Статистика' },
    { key: 'users', label: 'Пользователи' },
    { key: 'programs', label: 'Программы' },
    { key: 'calculations', label: 'Расчёты' },
    { key: 'support', label: 'Обращения', badge: unread },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-6 tracking-tight">Панель администратора</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 font-semibold text-sm rounded-t transition flex items-center gap-2 ${
              tab === t.key
                ? 'bg-white border border-b-white border-gray-200 -mb-px text-red-600'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
            {t.badge > 0 && (
              <span className="bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Stats */}
      {tab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Пользователей', value: stats.total_users, color: 'blue' },
            { label: 'Расчётов', value: stats.total_calculations, color: 'green' },
            { label: 'Программ', value: stats.total_programs, color: 'red' },
            { label: 'Обращений', value: stats.total_support_requests ?? 0, sub: `${stats.unread_support_requests ?? 0} непрочитанных`, color: 'yellow' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className={`bg-white rounded-xl shadow p-6 border-l-4 border-${color}-500`}>
              <p className="text-gray-500 text-sm font-medium">{label}</p>
              <p className={`text-5xl font-bold text-${color}-600 mt-2`}>{value}</p>
              {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                {['ID', 'Имя', 'Email', 'Роль', 'Дата', 'Действия'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{u.id}</td>
                  <td className="px-4 py-3 font-medium">{u.name || '—'}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.is_admin ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.is_admin ? 'Админ' : 'Пользователь'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.created_at ? fmtDate(u.created_at) : '—'}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleToggleAdmin(u.id)} className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-100">
                      {u.is_admin ? 'Снять права' : 'Сделать админом'}
                    </button>
                    {u.id !== user.id && (
                      <button onClick={() => handleDeleteUser(u.id)} className="text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">
                        Удалить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center text-gray-500 py-8">Нет пользователей</p>}
        </div>
      )}

      {/* Programs */}
      {tab === 'programs' && (
        <div className="space-y-6">
          {/* Form */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-4">{editingProgram ? 'Редактировать программу' : 'Новая программа'}</h2>
            <form onSubmit={handleProgramSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Название</label>
                  <input
                    required
                    value={programForm.name}
                    onChange={e => setProgramForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Макс. ставка %</label>
                    <input
                      type="number" step="0.1"
                      value={programForm.conditions.maxRate}
                      onChange={e => setProgramForm(p => ({ ...p, conditions: { ...p.conditions, maxRate: e.target.value } }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Макс. сумма ₽</label>
                    <input
                      type="number"
                      value={programForm.conditions.maxAmount}
                      onChange={e => setProgramForm(p => ({ ...p, conditions: { ...p.conditions, maxAmount: e.target.value } }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Описание</label>
                <textarea
                  rows={2}
                  value={programForm.description}
                  onChange={e => setProgramForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={programForm.conditions.requiresChildren}
                    onChange={e => setProgramForm(p => ({ ...p, conditions: { ...p.conditions, requiresChildren: e.target.checked } }))} />
                  Для семей с детьми
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={programForm.conditions.requiresIT}
                    onChange={e => setProgramForm(p => ({ ...p, conditions: { ...p.conditions, requiresIT: e.target.checked } }))} />
                  Для IT-специалистов
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={programForm.is_active}
                    onChange={e => setProgramForm(p => ({ ...p, is_active: e.target.checked }))} />
                  Активна
                </label>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading}
                  className="bg-red-600 text-white px-5 py-2 rounded font-semibold hover:bg-red-700 disabled:opacity-60">
                  {editingProgram ? 'Сохранить' : 'Добавить'}
                </button>
                {editingProgram && (
                  <button type="button" onClick={() => { setEditingProgram(null); setProgramForm(EMPTY_PROGRAM); }}
                    className="border px-5 py-2 rounded font-semibold hover:bg-gray-50">
                    Отмена
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  {['Название', 'Ставка', 'Макс. сумма', 'Статус', 'Действия'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {programs.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">{p.conditions.maxRate ? `${p.conditions.maxRate}%` : '—'}</td>
                    <td className="px-4 py-3">{p.conditions.maxAmount ? `${fmt(p.conditions.maxAmount)} ₽` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.is_active ? 'Активна' : 'Скрыта'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => startEdit(p)} className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-100">Изменить</button>
                      <button onClick={() => handleDeleteProgram(p.id)} className="text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Удалить</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {programs.length === 0 && <p className="text-center text-gray-500 py-8">Нет программ</p>}
          </div>
        </div>
      )}

      {/* Support Requests */}
      {tab === 'support' && (
        <div className="space-y-4">
          {supportRequests.length === 0 && (
            <p className="text-center text-gray-500 py-12 bg-white rounded-xl shadow">Обращений нет</p>
          )}
          {supportRequests.map(req => (
            <div key={req.id} className={`bg-white rounded-xl shadow p-5 border-l-4 ${req.is_read ? 'border-gray-200' : 'border-red-500'}`}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-gray-800">{req.email}</span>
                    {!req.is_read && (
                      <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">Новое</span>
                    )}
                    <span className="text-gray-400 text-xs">{fmtDate(req.created_at)}</span>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{req.message}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {!req.is_read && (
                    <button onClick={() => handleMarkRead(req.id)}
                      className="text-xs px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 whitespace-nowrap">
                      Отметить прочитанным
                    </button>
                  )}
                  <button onClick={() => handleDeleteSupport(req.id)}
                    className="text-xs px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700">
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calculations */}
      {tab === 'calculations' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                {['ID', 'Пользователь', 'Сумма кредита', 'Ставка', 'Срок', 'Платёж', 'Дата'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {calculations.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{c.id}</td>
                  <td className="px-4 py-3">{c.user_id}</td>
                  <td className="px-4 py-3 font-medium">{fmt(c.params.loanAmount)} ₽</td>
                  <td className="px-4 py-3">{c.params.rate}%</td>
                  <td className="px-4 py-3">{c.params.termYears} лет</td>
                  <td className="px-4 py-3 text-blue-600 font-semibold">
                    {fmt(c.result.monthlyPayment || c.result.firstPayment)} ₽
                  </td>
                  <td className="px-4 py-3 text-gray-500">{fmtDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {calculations.length === 0 && <p className="text-center text-gray-500 py-8">Нет расчётов</p>}
        </div>
      )}
    </div>
  );
};
