

// pages/AttendanceClassSpecificYearlyAnalytics.tsx
import { useState, useMemo } from 'react';
import { useAuthData } from '../../../hooks/useAuthData';
import { getAcademicYears } from '../../../utils/utils';
import { useGetAcademicYearLeaderboards } from '../../../api_services/attendance_api/attendanceApi';

// 🌟 Import your separate class and section hooks
import { useGetClasses } from '../../../api_services/schoolConfig_api/classApi';
import { useGetSections } from '../../../api_services/schoolConfig_api/sectionApi';

import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { AttendanceYearlyLeaderboards } from './AttendanceYearlyLeaderboards';

export default function AttendanceClassSpecificYearlyAnalytics() {
    const { schoolId } = useAuthData();
    const academicYearOptions = useMemo(() => getAcademicYears(), []);

    const [selectedYear, setSelectedYear] = useState<string>(academicYearOptions[0]?.value || "");
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

    // 🌟 Fetch Classes & Sections using your existing hooks
    const { data: classesData, isLoading: isClassesLoading } = useGetClasses(schoolId!);
    const { data: sectionsData, isLoading: isSectionsLoading } = useGetSections({
        schoolId: schoolId!,
        classId: selectedClassId // This auto-fetches sections whenever the user picks a class
    });

    // Fetch Analytics Data (Only executes if a class is selected)
    const { data: report, isLoading: isReportLoading, error } = useGetAcademicYearLeaderboards({
        schoolId: schoolId!,
        academicYear: selectedYear,
        classId: selectedClassId,
        sectionId: selectedSectionId
    });

    return (
        <div className="w-full h-full flex flex-col bg-mainBg overflow-hidden">
            {/* Header */}
            <header className="shrink-0 px-4 py-2 border-b border-border bg-surface z-20 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shadow-sm">
                        <i className="fas fa-users text-lg"></i>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground leading-none">Class Leaderboards</h1>
                        <p className="text-[11px] text-muted font-medium tracking-wider mt-1">Micro Attendance Analytics</p>
                    </div>
                </div>

                {/* Full Filter Panel */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="w-[160px]">
                        <SearchSelect
                            label='Academic Year'
                            placeholder="Academic Year"
                            options={academicYearOptions}
                            value={selectedYear}
                            onChange={(opt: any) => setSelectedYear(opt?.value)}
                        />
                    </div>

                    {/* 🌟 Updated Class Dropdown */}
                    <div className="w-[160px]">
                        <SearchSelect
                            label='Class'
                            placeholder="Select Class"
                            options={classesData?.map((c: any) => ({ label: c.name, value: c._id })) || []}
                            value={selectedClassId}
                            onChange={(opt: any) => {
                                setSelectedClassId(opt?.value);
                                setSelectedSectionId(null); // Reset section when changing classes
                            }}
                        />
                    </div>

                    {/* 🌟 Updated Section Dropdown (Shows only if a Class is selected) */}
                    {selectedClassId && (
                        <div className="w-[150px] animate-in fade-in relative">
                            <SearchSelect

                                label="Section"
                                placeholder="Section"
                                options={sectionsData?.map((s: any) => ({ label: s.name, value: s._id })) || []}
                                value={selectedSectionId || ''}
                                onChange={(opt: any) => setSelectedSectionId(opt?.value || null)}
                            />
                            {/* Optional spinner inside the section dropdown area while fetching */}
                            {isSectionsLoading && (
                                <i className="fas fa-spinner fa-spin absolute right-8 top-3 text-muted text-xs z-10 pointer-events-none"></i>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                {!selectedClassId ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-muted">
                        <i className="fas fa-chalkboard-teacher text-4xl mb-4 opacity-50"></i>
                        <h2 className="text-lg font-bold text-foreground">Select a Class</h2>
                        <p className="text-sm">Please select a class from the top menu to view its leaderboards.</p>
                    </div>
                ) : isReportLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
                    </div>
                ) : error ? (
                    <div className="text-center text-danger py-10">Failed to load class data.</div>
                ) : (
                    <div className="max-w-7xl mx-auto">
                        <AttendanceYearlyLeaderboards data={report} />
                    </div>
                )}
            </main>
        </div>
    );
}