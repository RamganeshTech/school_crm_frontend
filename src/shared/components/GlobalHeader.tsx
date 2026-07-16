// components/layout/GlobalHeader.tsx
import { UserAvatar } from '../../pages/profile/UserAvatar';
import { GlobalSearch } from './GlobalSearch';
import GlobalSetupProgress from './GlobalSetupProgress';
// import { UserAvatar } from './UserAvatar';

export const GlobalHeader = ({onMenuClick}: {onMenuClick:any}) => {
    return (
        <header className="h-14 bg-surface border-b border-border-default flex items-center justify-between px-6 sticky top-0 z-[35]">

            <button
                onClick={onMenuClick}
                className="md:hidden p-2 text-muted hover:text-primary transition-colors"
            >
                <i className="fas fa-bars text-xl"></i>
            </button>

            {/* Left side: Global Search (Command Palette) */}
            <div className="flex-1 flex items-center">
                <GlobalSearch />
            </div>

            {/* Right side: User Profile */}
            {/* <div className="flex items-center gap-4"> */}
            <div className="flex  items-center gap-4 pl-6 ml-4 border-l border-border">

                {/* Optional: Add a notification bell here later */}
                {/* <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted hover:bg-mainBg hover:text-primary transition-colors">
          <i className="fa-regular fa-bell text-lg"></i>
        </button> */}

                <GlobalSetupProgress />


                <UserAvatar />
            </div>
        </header>
    );
};