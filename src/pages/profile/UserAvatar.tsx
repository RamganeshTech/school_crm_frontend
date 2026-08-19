// components/layout/UserAvatar.tsx
import { useNavigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';

export const UserAvatar = () => {
  const { userName, currentRole, profileImageUrl } = useAuthData();
  const navigate = useNavigate();
  const initials = userName?.charAt(0).toUpperCase() || 'U';



  const handleClick = () => {

    if(currentRole === "parent"){
      return navigate('/dashboard/profile')
    }
    else {
      return navigate('/dashboard/profile')
    }

  }
  return (
    // <div
    //   className="flex items-center gap-3 cursor-pointer hover:bg-sub-header/50 p-1 sm:p-2 rounded-xl transition-colors"
    //   onClick={handleClick}
    // >
    //   <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-primary flex items-center justify-center text-inverse font-bold text-sm shadow-sm">
    //     {initials}
    //   </div>
    //   <div className="hidden md:block">
    //     <p className="text-[12px] sm:text-sm font-normal sm:font-semibold text-foreground">{userName}</p>
    //     <p className="text-[10px] text-muted uppercase">View Profile</p>
    //   </div>
    // </div>


    <div
      className="flex items-center gap-3 cursor-pointer hover:bg-sub-header/50 p-1 sm:p-2 rounded-xl transition-colors"
      onClick={handleClick}
    >
      {/* 🌟 Added overflow-hidden to keep the image perfectly round */}
      <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-primary flex items-center justify-center text-inverse font-bold text-sm shadow-sm overflow-hidden">
        
        {/* 🌟 Conditional rendering for Image vs Initials */}
        {profileImageUrl ? (
          <img 
            src={profileImageUrl} 
            alt={userName || 'Profile'} 
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
        
      </div>
      <div className="hidden md:block">
        <p className="text-[12px] sm:text-sm font-normal sm:font-semibold text-foreground">{userName}</p>
        <p className="text-[10px] text-muted uppercase">View Profile</p>
      </div>
    </div>
  );
};