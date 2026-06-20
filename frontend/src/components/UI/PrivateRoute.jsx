import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-center py-12">Загрузка...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};
