



// components/dashboard/charts/RecentFeeActivityWidget.tsx
import { useGetRecentFeeActivity } from '../../api_services/financeApi/financeApi';
import { useAuthData } from '../../hooks/useAuthData';

// Helper to format time (e.g., "Today, 2:30 PM" or "Jun 4, 2026")
const formatActivityTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(date);
};

export default function RecentFeeActivityWidget() {
    const { schoolId } = useAuthData();

    const { data: activityData, isLoading } = useGetRecentFeeActivity(schoolId!);
    const activities = activityData || [];

    return (
        <div className="bg-surface p-6 rounded-2xl border border-border flex flex-col h-[400px]">
            
            {/* Header with Live Indicator */}
            {/* 🌟 Added shrink-0 so the header never squishes when scrolling */}
            <div className="mb-6 flex justify-between items-start shrink-0">
                <div>
                    <h3 className="font-bold text-foreground uppercase tracking-wide text-sm flex items-center gap-2">
                        <i className="fas fa-bolt text-warning"></i>
                        Recent Payments
                    </h3>
                    <p className="text-xs text-muted mt-1">Real-time feed of recent fee collections</p>
                </div>
            </div>

            {/* Activity Feed List */}
            {/* 🌟 Added min-h-0 to force Flexbox to scroll internally instead of expanding the card */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <i className="fas fa-circle-notch fa-spin text-2xl text-muted opacity-50"></i>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-mainBg border border-border flex items-center justify-center text-muted">
                            <i className="fas fa-receipt"></i>
                        </div>
                        <span className="text-sm font-bold text-foreground mt-2">No Recent Activity</span>
                        <span className="text-xs text-muted">Awaiting new transactions.</span>
                    </div>
                ) : (
                    <div className="space-y-4 pb-2">
                        {activities.map((item: any, index: number) => (
                            <div key={item.id || index} className="flex items-center justify-between group">
                                
                                {/* Left Side: Icon & Details */}
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center shrink-0 border border-success/20 group-hover:scale-105 transition-transform">
                                        <i className="fas fa-arrow-down text-success text-sm"></i>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-foreground capitalize truncate max-w-[140px] sm:max-w-[180px]">
                                            {item.title}
                                        </span>
                                        <span className="text-[11px] text-muted flex items-center gap-1.5">
                                            <i className="far fa-clock text-[9px]"></i>
                                            {formatActivityTime(item.date)}
                                        </span>
                                    </div>
                                </div>

                                {/* Right Side: Amount */}
                                <div className="text-right flex flex-col shrink-0">
                                    <span className="text-sm font-black text-success">
                                        +{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.amount)}
                                    </span>
                                    <span className="text-[10px] text-muted uppercase tracking-wider truncate max-w-[80px]">
                                        {item.description}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}