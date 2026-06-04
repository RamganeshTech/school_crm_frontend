// pages/AttendanceSchoolWideYearlyAnalytics.tsx
import { useState, useMemo, useEffect } from 'react';
import { useAuthData } from '../../../hooks/useAuthData';
import { getAcademicYears } from '../../../utils/utils';
import { useGetAcademicYearLeaderboards } from '../../../api_services/attendance_api/attendanceApi';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { AttendanceYearlyLeaderboards } from './AttendanceYearlyLeaderboards';

export default function AttendanceSchoolWideYearlyAnalytics() {
    const { schoolId } = useAuthData();
    const academicYearOptions = useMemo(() => getAcademicYears(), []);
    
    // Default to the first available year
    const [selectedYear, setSelectedYear] = useState<string>(academicYearOptions[0]?.value || "");

    // Fetch Analytics Data (Notice classId and sectionId are omitted so the backend scans the whole school)
    const { data: report, isLoading, error } = useGetAcademicYearLeaderboards({
        schoolId: schoolId!,
        academicYear: selectedYear,
    });

    return (
        <div className="w-full h-full flex flex-col bg-mainBg overflow-hidden">
            {/* Header */}
            <header className="shrink-0 px-4 py-4 border-b border-border bg-surface z-20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shadow-sm">
                        <i className="fas fa-university text-lg"></i>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground leading-none">School-Wide Leaderboards</h1>
                        <p className="text-[11px] text-muted font-medium uppercase tracking-wider mt-1">Macro Attendance Analytics</p>
                    </div>
                </div>
                
                {/* Year Filter Only */}
                <div className="w-[160px]">
                    <SearchSelect
                        placeholder="Academic Year"
                        options={academicYearOptions}
                        value={selectedYear}
                        onChange={(opt: any) => setSelectedYear(opt?.value)}
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
                    </div>
                ) : error ? (
                    <div className="text-center text-danger py-10">Failed to load school data.</div>
                ) : (
                    <div className="max-w-7xl mx-auto">
                        <AttendanceYearlyLeaderboards data={report} />
                    </div>
                )}
            </main>
        </div>
    );
}