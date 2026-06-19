import { useState, useRef, useEffect } from 'react';
import { useAuthData } from '../../hooks/useAuthData';
import { useNavigate } from 'react-router-dom';
import { useGetSchoolProgressStatus } from '../../api_services/schoolConfig_api/progress_api/progressApi';

export default function GlobalSetupProgress() {
    const { schoolId, currentRole } = useAuthData();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Only fetch for admins/correspondents who can actually fix these issues
    const { data: progressData, isLoading } = useGetSchoolProgressStatus(schoolId!);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Don't show anything for non-admins or if still loading/fully setup
    if (currentRole !== 'correspondent' && currentRole !== 'administrator') return null;
    if (isLoading || !progressData) return null;

    // If the school is 100% configured, we can hide the warning widget entirely to keep the UI clean
    // if (progressData.isFullySetup) return null;

    // --- SVG Circular Progress Math ---
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressData.overallPercentage / 100) * circumference;

    // Get only classes that need attention (worst ones first)
    const pendingClasses = progressData.classes?.filter((c: any) => c.status !== 'ready') || [];

    return (
        <div className="relative" ref={dropdownRef}>
            {/* 🌟 CIRCULAR PROGRESS BUTTON */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative !cursor-pointer flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface transition-colors group"
                title="School Setup Progress"
            >
                {/* SVG Progress Border */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 40 40">
                    <circle
                        cx="20" cy="20" r={radius}
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="transparent"
                        className="text-border"
                    />
                    <circle
                        cx="20" cy="20" r={radius}
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={`${progressData.overallPercentage > 50 ? 'text-warning' : 'text-danger'} transition-all duration-1000 ease-out`}
                    />
                </svg>

                {/* Center Icon */}
                {/* Center Percentage */}
                <div className="relative flex items-center justify-center group-hover:text-foreground transition-colors">
                    <span className="text-[11px] font-bold text-foreground tracking-tighter">
                        {progressData.overallPercentage}%
                    </span>

                    {/* Optional: Keep the red dot if the percentage is critically low */}
                    {progressData.overallPercentage < 100 && (
                        <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-danger rounded-full border border-mainBg"></span>
                    )}
                </div>


            </button>

            {/* 🌟 DROPDOWN MENU */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-surface border border-border shadow-2xl rounded-xl z-50 animate-in fade-in slide-in-from-top-2">

                    {/* Dropdown Header */}
                    <div className="p-4 border-b border-border bg-background/50 rounded-t-xl flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-bold text-foreground">Setup Required</h3>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-wider mt-0.5">School Readiness</p>
                        </div>
                        <div className="text-xl font-bold text-primary">
                            {progressData.overallPercentage}%
                        </div>
                    </div>

                    {/* Dropdown Body: Scrollable List of Missing Configs */}
                    <div className="max-h-72 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">

                        {/* 1. School Level Config Check */}
                        {!progressData.schoolLevel?.feeConfigExists && (
                            <div
                                onClick={() => { setIsOpen(false); navigate('/dashboard/fee-configuration'); }}
                                className="p-3 rounded-lg hover:bg-background cursor-pointer border border-transparent hover:border-border transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-danger/10 text-danger flex items-center justify-center shrink-0">
                                        <i className="fas fa-sliders text-xs"></i>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Missing Fee Config</p>
                                        <p className="text-[10px] text-muted leading-tight mt-0.5">Create your main fee heads (Tuition, Transport, etc.)</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Class Level Checks */}
                        {pendingClasses.length > 0 ? (
                            pendingClasses.map((cls: any, idx: number) => (
                                <div
                                    key={idx}
                                    onClick={() => { setIsOpen(false); navigate('/dashboard/fee-structure'); }}
                                    className="p-3 rounded-lg hover:bg-background cursor-pointer border border-transparent hover:border-border transition-colors group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 mt-0.5 ${cls.status === 'partial' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
                                            <i className="fas fa-chalkboard text-xs"></i>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Class {cls.className}</p>
                                                <span className="text-[10px] font-bold text-muted">{cls.classPercentage}%</span>
                                            </div>
                                            <ul className="text-[10px] text-muted list-disc pl-3">
                                                {cls.missingSteps?.slice(0, 2).map((step: string, i: number) => (
                                                    <li key={i}>{step}</li>
                                                ))}
                                                {cls.missingSteps?.length > 2 && (
                                                    <li className="list-none text-primary italic mt-0.5">+{cls.missingSteps.length - 2} more issues</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Fallback if classes are fine but something else is wrong
                            <div className="p-4 text-center text-xs text-muted">
                                Please review your configuration settings.
                            </div>
                        )}
                    </div>

                    {/* Dropdown Footer */}
                    <div className="p-3 border-t border-border bg-background/50 rounded-b-xl">
                        <button
                            onClick={() => { setIsOpen(false); navigate('/dashboard/class'); }}
                            className="w-full py-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-bold rounded-lg"
                        >
                            Go to Configurations <i className="fas fa-arrow-right ml-1 text-[10px]"></i>
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
}