import { useNavigate } from 'react-router-dom';

export const ProgramCard = ({ program, onSelect }) => {
  const navigate = useNavigate();

  const handleDetails = () => {
    if (onSelect) {
      onSelect(program);
      return;
    }
    // Навигация с ProgramsPage на калькулятор
    const params = new URLSearchParams();
    if (program.conditions.maxRate != null) params.set('rate', program.conditions.maxRate);
    if (program.conditions.maxAmount != null) params.set('propertyPrice', program.conditions.maxAmount);
    if (program.conditions.requiresChildren) params.set('hasChildren', 'true');
    if (program.conditions.requiresIT) params.set('isIT', 'true');
    navigate(`/?${params.toString()}`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
      <h3 className="text-xl font-bold mb-2">{program.name}</h3>
      <p className="text-gray-600 mb-4">{program.description}</p>

      <div className="space-y-2 text-sm">
        {program.conditions.maxRate && (
          <div>
            <span className="font-semibold">Макс. ставка:</span>
            <span className="ml-2">{program.conditions.maxRate}%</span>
          </div>
        )}

        {program.conditions.maxAmount && (
          <div>
            <span className="font-semibold">Макс. сумма:</span>
            <span className="ml-2">
              {new Intl.NumberFormat('ru-RU').format(program.conditions.maxAmount)} ₽
            </span>
          </div>
        )}

        {program.conditions.requiresChildren && (
          <div className="text-blue-600">Для семей с детьми</div>
        )}

        {program.conditions.requiresIT && (
          <div className="text-blue-600">Для IT-специалистов</div>
        )}
      </div>

      <button
        onClick={handleDetails}
        className="w-full mt-4 bg-gradient-to-r from-red-600 to-red-700 text-white py-2 rounded hover:from-red-700 hover:to-red-800 font-semibold"
      >
        Подробнее
      </button>
    </div>
  );
};
