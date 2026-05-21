// components/layout/UserAvatar.tsx
import { useNavigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';

export const UserAvatar = () => {
  const { userName } = useAuthData();
  const navigate = useNavigate();
  const initials = userName?.charAt(0).toUpperCase() || 'U';

  return (
    <div 
      className="flex items-center gap-3 cursor-pointer hover:bg-sub-header/50 p-2 rounded-xl transition-colors"
      onClick={() => navigate('/dashboard/profile')}
    >
      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-inverse font-bold text-sm shadow-sm">
        {initials}
      </div>
      <div className="hidden md:block">
        <p className="text-sm font-semibold text-foreground">{userName}</p>
        <p className="text-[10px] text-muted uppercase">View Profile</p>
      </div>
    </div>
  );
};