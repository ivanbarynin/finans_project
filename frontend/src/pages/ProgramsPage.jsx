import { useState, useEffect } from 'react';
import { ProgramCard } from '../components/Programs/ProgramCard';
import { programService } from '../services/programService';

export const ProgramsPage = () => {
  const [programs, setPrograms] = useState([]);
  const [filters, setFilters] = useState({
    hasChildren: false,
    isIT: false,
    region: 'other',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrograms();
  }, [filters]);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const response = await programService.getAll(
        filters.hasChildren,
        filters.isIT,
        filters.region
      );
      setPrograms(response.data);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8 tracking-tight">Льготные программы</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-bold mb-4">Фильтры</h2>
        <div className="flex gap-4 flex-wrap">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.hasChildren}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, hasChildren: e.target.checked }))
              }
            />
            <span>Есть дети</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.isIT}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, isIT: e.target.checked }))
              }
            />
            <span>IT-специалист</span>
          </label>

          <select
            value={filters.region}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, region: e.target.value }))
            }
            className="px-3 py-2 border rounded"
          >
            <option value="other">Прочее</option>
            <option value="far_east">Дальний Восток</option>
            <option value="arctic">Арктика</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-600 py-12">Загрузка...</div>
      ) : programs.length === 0 ? (
        <div className="text-center text-gray-600 py-12">Программы не найдены</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}
    </div>
  );
};
