import { useState } from 'react';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetSchoolById } from '../../api_services/schoolConfig_api/schoolapi';
import {
    useGetFinanceStats,
    // useGetFinanceTimeline,
    // useGetOutstandingStats,
    type FinanceStatsParams
} from '../../api_services/financeApi/financeApi'; // Adjust to your actual api hook bundle path
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { getAcademicYears } from '../../utils/utils';
import FinanceKPICards from './FinanceKPICards';
// import FinanceTrendsChart from './FinanceTrendsChart';
// import OutstandingFeesChart from './OutstandingFeesChart';
import CashFlowTimelineWidget from './CashFlowTimelineWidget';
import OutstandingLiabilityWidget from './OutstandingFeeDonut';
import ExpenseReportWidget from './dashboards/ExpenseDashboard';
import CollectedFeesWidget from './CollectedFeesWidget';
import RecentFeeActivityWidget from './RecentFeeActivityWidget';
import ClassFeeDuesAnalytics from './ClassFeeDuesAnalytics';

type RangeValue = FinanceStatsParams["range"]

export default function FinanceDashboardMain() {
    const { schoolId } = useAuthData();

    // Fetch master school context to obtain matching default academic years securely
    const { data: schoolData, isSuccess } = useGetSchoolById(schoolId!);
    const currentAcademicYear = schoolData?.currentAcademicYear;

    // --- State Management ---
    const [range, setRange] = useState<RangeValue>('month');
    const [academicYear, setAcademicYear] = useState<string>(currentAcademicYear!);

    // 🌟 THE STATE HYDRATION ENGINE
    // If the API call succeeds, has data, and your state is still empty, populate it instantly!
    if (isSuccess && schoolData?.currentAcademicYear && !academicYear) {
        setAcademicYear(schoolData.currentAcademicYear);
    }



    const RANGE_OPTIONS = [
        { label: 'Today Summary', value: 'today' },
        { label: 'This Active Month (MTD)', value: 'month' },
        { label: 'This Calendar Year (YTD)', value: 'year' }
    ];

    // --- Core Hooks Invocation ---
    const { data: stats, isLoading: isStatsLoading } = useGetFinanceStats({
        schoolId: schoolId!,
        range
    });

    // const { data: timeline, isLoading: isTimelineLoading } = useGetFinanceTimeline({
    //     schoolId: schoolId!,
    //     range
    // });

    // const { data: outstanding, isLoading: isOutstandingLoading } = useGetOutstandingStats({
    //     schoolId: schoolId!,
    //     academicYear
    // });

    return (
        <div className="w-full h-full flex flex-col space-y-6 overflow-y-auto custom-scrollbar p-2 bg-mainBg animate-in fade-in duration-300">

            {/* Master Header Board */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-chart-pie text-primary"></i>
                        Institutional Finance Matrix
                    </h2>
                    <p className="text-sm text-muted mt-1">Real-time macro financial telemetry, operational expense logs, and fee audits.</p>
                </div>

                {/* Dashboard Global Configuration Selectors */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="w-44">
                        <SearchSelect
                            label=""
                            options={RANGE_OPTIONS}
                            value={range || ""}
                            onChange={(opt) => setRange((opt.value as RangeValue))}
                            placeholder="Data Scope Timeline"
                        />
                    </div>
                    <div className="w-48">
                        <SearchSelect
                            label=""
                            options={getAcademicYears()}
                            value={academicYear}
                            onChange={(opt) => setAcademicYear(String(opt.value))}
                            placeholder="Target Ledger Year"
                        />
                    </div>
                </div>
            </div>

            {/* Matrix Segment 1: KPI Statistics Panels */}
            <FinanceKPICards data={stats} isLoading={isStatsLoading} />

            {/* Matrix Segment 2: Advanced Data Graphs Grid */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <FinanceTrendsChart timelineData={timeline} isLoading={isTimelineLoading} />
                </div>
                <div className="lg:col-span-1">
                    <OutstandingFeesChart outstandingData={outstanding} isLoading={isOutstandingLoading} />
                </div>
            </div> */}


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-3">
                    <CashFlowTimelineWidget />
                </div>



                <div className="lg:col-span-1">
                    <CollectedFeesWidget defaultYear={academicYear!} />
                </div>

                <div className="lg:col-span-1">
                    <OutstandingLiabilityWidget defaultYear={academicYear!} />
                </div>

                 <div className="lg:col-span-1">
                    <RecentFeeActivityWidget />
                </div>

                <div className="lg:col-span-3">
                    <ClassFeeDuesAnalytics schoolId={schoolId!} academicYear={academicYear!} />
                </div>

                <div className="lg:col-span-3">
                    <ExpenseReportWidget />
                </div>

            </div>
        </div>
    );
}