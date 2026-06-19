// IMPORT THIS AT THE TOP: 
// import { useGetSchoolProgressStatus } from '../../api_services/schoolConfig_api/progressApi';

import { useNavigate } from "react-router-dom";
import { useGetSchoolProgressStatus } from "../../api_services/schoolConfig_api/progress_api/progressApi";
import { Card, CardContent } from "../../shared/ui/Card";


export default function SystemReadinessCard({ schoolId }: { schoolId: string }) {
    const navigate = useNavigate();
    const { data: progressData, isLoading } = useGetSchoolProgressStatus(schoolId);

    if (isLoading) {
        return (
            <Card className="shadow-sm border-border/60 animate-pulse">
                <CardContent className="p-8 flex flex-col items-center justify-center min-h-[200px]">
                    <i className="fas fa-circle-notch fa-spin text-muted text-2xl mb-3"></i>
                    <p className="text-sm text-muted font-medium">Scanning system configurations...</p>
                </CardContent>
            </Card>
        );
    }

    if (!progressData) return null;

    const percentage = progressData.overallPercentage || 0;
    const isPerfect = progressData.isFullySetup;

    // --- Derived Module States from API Data ---
    const hasClasses = progressData.totalClasses > 0;
    const allSectionsDone = hasClasses && progressData.classes.every((c: any) => c.sectionsConfigured);
    const hasFeeConfig = progressData.schoolLevel?.feeConfigExists;
    const allFeeStructuresDone = hasClasses && progressData.classes.every((c: any) => c.feeStructureConfigured);

    const modules = [

        {
            title: 'Class Creation',
            description: 'Establish the core academic structure of your institution.',
            isComplete: hasClasses,
            path: '/dashboard/class',
            icon: 'fas fa-chalkboard'
        },
        {
            title: 'Section Mapping',
            description: 'Ensure all created classes have at least one active section assigned.',
            isComplete: allSectionsDone,
            path: '/dashboard/section',
            icon: 'fas fa-box'
        },

        {
            title: 'Fee Configuration',
            description: 'Define your main fee heads (e.g., Tuition, Transport) before assigning them.',
            isComplete: hasFeeConfig,
            path: '/dashboard/fee-configuration',
            icon: 'fas fa-sliders'
        },

        {
            title: 'Fee Structure Values',
            description: 'Assign exact monetary amounts to your classes for the current academic year.',
            isComplete: allFeeStructuresDone,
            path: '/dashboard/fee-structure',
            icon: 'fas fa-coins'
        }
    ];

    return (
        <Card className={`shadow-sm border-border/40 overflow-hidden ${isPerfect ? '' : 'border-t-4 !border-border'}`}>
            <CardContent className="p-6">

                {/* Header & Global Progress */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                    <div className="max-w-xl">
                        <h3 className="text-lg font-bold text-foreground">Platform Onboarding Tracker</h3>
                        <p className="text-sm text-muted mt-1 leading-relaxed">
                            {isPerfect
                                ? 'Excellent! All foundational modules are configured. Your institution is ready for production.'
                                : 'Complete the following core modules to unlock full functionality across the platform, including fee collection.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Overall Progress</p>
                            <div className={`text-3xl font-black leading-none ${isPerfect ? 'text-success' : 'text-foreground'}`}>
                                {percentage}%
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full h-2 bg-border/40 rounded-full overflow-hidden mb-8">
                    <div
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${isPerfect ? 'bg-success' : 'bg-primary'}`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>

                {/* Grid of Actionable Modules (2 per row on md+) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modules.map((mod, idx) => (
                        <div
                            key={idx}
                            className={`flex flex-col justify-between p-5 rounded-xl border transition-all duration-200 ${mod.isComplete
                                    ? 'bg-mainBg border-border'
                                    : 'bg-surface border-border shadow-sm hover:border-primary/40 hover:shadow-md'
                                }`}
                        >
                            <div className="flex items-start gap-4 mb-5">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${mod.isComplete ? 'bg-success/10 text-success' : 'bg-background border border-border text-muted'
                                    }`}>
                                    <i className={`${mod.icon} text-lg`}></i>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className={`text-sm font-bold ${mod.isComplete ? 'text-success' : 'text-foreground'}`}>
                                            {mod.title}
                                        </h4>
                                        {mod.isComplete && <i className="fas fa-check-circle text-success text-xs"></i>}
                                    </div>
                                    <p className="text-xs text-muted leading-relaxed">
                                        {mod.description}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-border/50 pt-3 flex justify-end">
                                <button
                                    onClick={() => navigate(mod.path)}
                                    className={`cursor-pointer text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${mod.isComplete
                                            ? 'text-success hover:bg-success/10'
                                            : 'border-2 border-primary text-primary text-primary-foreground hover:bg-header shadow-sm'
                                        }`}
                                >
                                    {mod.isComplete ? 'Review Settings' : 'Configure Module'}
                                    <i className={`fas ${mod.isComplete ? 'fa-arrow-right' : 'fa-chevron-right'} text-[10px]`}></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </CardContent>
        </Card>
    );
}