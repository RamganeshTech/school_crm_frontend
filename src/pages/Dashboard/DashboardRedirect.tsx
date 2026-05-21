// components/DashboardHomeRedirect.tsx
import { Navigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';

export const DashboardHomeRedirect = () => {
  const { userId , currentRole } = useAuthData(); // Assuming your hook provides the user object

  if (!userId) return <Navigate to="/login" />;

  // Redirect based on role
  if (currentRole === 'parent') {
    return <Navigate to="/dashboard/profile-selection" replace />;
  }

  // Default for Staff/Admin
  return <Navigate to="/dashboard/dashboard-main" replace />;
};