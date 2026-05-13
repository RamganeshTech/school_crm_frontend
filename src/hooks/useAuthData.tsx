import { useSelector } from 'react-redux';
import { type UserRole } from '../features/slices/authSlice';
import { type RootState } from '../features/store/store';

export const useAuthData = () => {
  const auth = useSelector((state: RootState) => state.auth);
  
  return {
    currentRole: auth.role as UserRole,
    schoolId: auth.schoolId,
    userId: auth._id,
    userName: auth.userName,
    isAuthenticated: auth.isAuthenticated
  };
};