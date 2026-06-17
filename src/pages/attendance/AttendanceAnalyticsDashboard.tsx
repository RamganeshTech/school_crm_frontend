//  FOR TEACHERS (class wise)

import { useState, useMemo, useEffect } from 'react';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetAllClassesWithSections, type ClassWithSections } from '../../api_services/teacher_api/teacherApi';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { getAcademicYears } from '../../utils/utils';

// Your Modular Chart Components
import { AttendanceTrendBarChart } from './components/AttendanceTrendBarChart';
import { AttendanceDistributionDonut } from './components/AttendanceDistributionDonut';
import { useGetClassAttendanceReport } from '../../api_services/attendance_api/attendanceApi';
import { useGetSchoolById } from '../../api_services/schoolConfig_api/schoolapi';
import type { RootState } from '../../features/store/store';
import { useSelector } from 'react-redux';

export default function AttendanceAnalyticsDashboard() {
    // 1. Global Auth & Context
    const { schoolId } = useAuthData();
    const { data: schoolData } = useGetSchoolById(schoolId!);

    const { role:currentRole, assignments } = useSelector((state: RootState) => state.auth);

    const currentYear = schoolData?.currentAcademicYear || "";

    // 2. Default Dates (1st of the current month -> Today)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    // Format to YYYY-MM-DD for HTML input[type="date"] and API
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // 3. Dynamic Interactive State
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(currentYear || "");
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [startDate, setStartDate] = useState(formatDate(firstDay));
    const [endDate, setEndDate] = useState(formatDate(today));

    // 4. Fetch Form Options
    const academicYearOptions = useMemo(() => getAcademicYears(), []);
    const { data: classesData,  } = useGetAllClassesWithSections({ schoolId: schoolId! });
    const classes: ClassWithSections[] = classesData || [];
    const selectedClass = classes.find(c => c._id === selectedClassId);

    // Auto-select current academic year if empty
    useEffect(() => {
        if (!selectedAcademicYear && academicYearOptions.length > 0) {
            setSelectedAcademicYear(academicYearOptions[0].value);
        }
    }, [academicYearOptions, selectedAcademicYear]);

    // 🌟 NEW: Auto-select the Teacher's assigned class and section
    useEffect(() => {
        // Only trigger this for teachers who have an assignment array
        if (currentRole === 'teacher' && assignments && assignments.length > 0) {
            // Only auto-fill if the user hasn't already manually selected a class
            if (!selectedClassId) {
                const firstAssignment = assignments[0];
                setSelectedClassId(firstAssignment.classId || "");
                
                // If the section is null in the DB, default to null for the UI state
                setSelectedSectionId(firstAssignment.sectionId || null);
            }
        }
    }, [currentRole, assignments, selectedClassId]);

    // 5. Fetch Analytics Data
    const { data: report, isLoading: isReportLoading, error } = useGetClassAttendanceReport({
        schoolId: schoolId!,
        academicYear: selectedAcademicYear,
        classId: selectedClassId,
        sectionId: selectedSectionId,
        startDate: startDate,
        endDate: endDate
    });

    return (
        <div className="w-full h-full flex flex-col bg-mainBg overflow-hidden animate-in fade-in">

            {/* --- SUPER COMPACT & FULLY RESPONSIVE HEADER --- */}
            <header className="shrink-0 px-4 py-3 border-b border-border bg-surface z-20 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4 xl:gap-3">

                {/* Title (Left) */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center shadow-sm">
                        <i className="fas fa-chart-pie text-base"></i>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-foreground leading-none">Attendance Analytics</h1>
                        <p className="text-[10px] text-muted font-medium mt-0.5">Class Performance</p>
                    </div>
                </div>

                {/* Filters (Right) - Highly Responsive Wrapper */}
                <div className="flex flex-wrap items-center xl:justify-end gap-2 w-full xl:w-auto mt-1 xl:mt-0">

                    {/* Dropdowns: Full width on mobile, 50% on small tablets, Auto width on large screens */}
                    <div className="w-full sm:w-[calc(50%-0.25rem)] md:w-auto md:min-w-[130px] lg:w-[220px] flex-1 ">
                        <SearchSelect
                            placeholder="Academic Year"
                            options={academicYearOptions}
                            value={selectedAcademicYear}
                            onChange={(opt: any) => setSelectedAcademicYear(opt?.value)}
                        />
                    </div>

                    <div className="w-full sm:w-[calc(50%-0.25rem)] md:w-auto md:min-w-[140px] lg:w-[120px] flex-1 ">
                        <SearchSelect
                            placeholder="Select Class"
                            options={classes.map(c => ({ label: c.name, value: c._id }))}
                            value={selectedClassId}
                            onChange={(opt: any) => {
                                setSelectedClassId(opt?.value);
                                setSelectedSectionId(null);
                            }}
                        />
                    </div>

                    {selectedClass?.hasSections && (
                        <div key={selectedClassId} className="w-full sm:w-[calc(50%-0.25rem)] md:w-auto md:min-w-[120px] flex-1 lg:w-[120px] animate-in fade-in">
                            <SearchSelect
                                placeholder="Section"
                                options={selectedClass.sections.map(s => ({ label: s.name, value: s._id }))}
                                value={selectedSectionId || ''}
                                onChange={(opt: any) => setSelectedSectionId(opt?.value || null)}
                            />
                        </div>
                    )}

                    {/* Date Pickers: Stretch nicely on mobile, compress tightly on desktop */}
                    <div className="flex items-center justify-between md:justify-start gap-1.5 bg-background border border-border rounded-md px-2 h-[38px] w-full sm:w-[calc(50%-0.25rem)] md:w-auto flex-1 xl:flex-none">
                        <span className="text-[10px] text-muted font-bold uppercase shrink-0">Start:</span>
                        <input
                            type="date"
                            value={startDate}
                            max={endDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-xs text-foreground outline-none w-full md:w-[105px] cursor-pointer text-right md:text-left"
                        />
                    </div>

                    <div className="flex items-center justify-between md:justify-start gap-1.5 bg-background border border-border rounded-md px-2 h-[38px] w-full sm:w-[calc(50%-0.25rem)] md:w-auto flex-1 xl:flex-none">
                        <span className="text-[10px] text-muted font-bold uppercase shrink-0">End:</span>
                        <input
                            type="date"
                            value={endDate}
                            min={startDate}
                            max={formatDate(today)}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-xs text-foreground outline-none w-full md:w-[105px] cursor-pointer text-right md:text-left"
                        />
                    </div>

                </div>
            </header>

            {/* --- MAIN DASHBOARD CONTENT --- */}
            <main className="flex-1 overflow-y-auto p-3 md:p-4 custom-scrollbar">

                {!selectedClassId ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted h-full">
                        <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-3 shadow-sm">
                            <i className="fas fa-filter text-2xl opacity-50"></i>
                        </div>
                        <h2 className="text-lg font-bold text-foreground">Awaiting Parameters</h2>
                        <p className="text-xs mt-1 text-center">Select a Class to generate analytics.</p>
                    </div>
                ) : isReportLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 h-full">
                        <i className="fas fa-circle-notch fa-spin text-primary text-3xl mb-3"></i>
                        <p className="text-xs font-bold text-muted animate-pulse">Crunching data...</p>
                    </div>
                ) : error ? (
                    <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-center max-w-sm mx-auto mt-10">
                        <i className="fas fa-exclamation-circle text-danger text-2xl mb-1"></i>
                        <h3 className="font-bold text-danger text-sm">Generation Failed</h3>
                        <p className="text-[11px] text-danger/80 mt-1">{(error as Error).message}</p>
                    </div>
                ) : report ? (
                    <div className="space-y-4 max-w-[1400px] mx-auto">

                        {/* 1. TOP KPI WIDGETS */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="bg-surface border border-border rounded-xl p-3.5 shadow-sm">
                                <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">Effective Rate</p>
                                <h2 className="text-2xl font-black text-primary leading-none">{report.overview.effectiveAttendanceRate}</h2>
                            </div>
                            <div className="bg-surface border border-border rounded-xl p-3.5 shadow-sm relative overflow-hidden">
                                <div className="absolute -right-3 -bottom-3 opacity-5 text-success">
                                    <i className="fas fa-check-circle text-6xl"></i>
                                </div>
                                <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">Total Present</p>
                                <h2 className="text-2xl font-black text-success leading-none">{report.overview.percentages.present}</h2>
                            </div>
                            <div className="bg-surface border border-border rounded-xl p-3.5 shadow-sm relative overflow-hidden">
                                <div className="absolute -right-3 -bottom-3 opacity-5 text-danger">
                                    <i className="fas fa-times-circle text-6xl"></i>
                                </div>
                                <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">Total Absent</p>
                                <h2 className="text-2xl font-black text-danger leading-none">{report.overview.percentages.absent}</h2>
                            </div>
                            <div className="bg-surface border border-border rounded-xl p-3.5 shadow-sm">
                                <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">Working Days</p>
                                <h2 className="text-2xl font-black text-foreground leading-none">{report.overview.totalWorkingDays}</h2>
                            </div>
                        </div>

                        {/* 2. CHARTS GRID */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                          

                            <div className="xl:col-span-2">
                                <AttendanceTrendBarChart
                                    chartData={report.chartData}
                                    startDate={startDate}
                                    endDate={endDate}
                                />
                            </div>
                            <div className="xl:col-span-1">
                                <AttendanceDistributionDonut distribution={report.overview.distribution} />
                            </div>
                        </div>

                        {/* 3. AT-RISK ACTION LIST */}
                        {report.atRiskStudents?.length > 0 && (
                            <div className="bg-surface border border-danger/30 rounded-xl shadow-sm overflow-hidden">
                                <div className="bg-danger/5 px-4 py-3 border-b border-danger/10 flex items-center gap-2.5">
                                    <div className="w-6 h-6 rounded-full bg-danger/20 flex items-center justify-center text-danger shrink-0 text-xs">
                                        <i className="fas fa-exclamation-triangle"></i>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-danger leading-none">Action Required: Chronic Absentees</h3>
                                        <p className="text-[10px] text-danger/80 font-medium mt-0.5">Highest absentee rate in this {report.overview.totalWorkingDays}-day period.</p>
                                    </div>
                                </div>

                                <div className="divide-y divide-border">
                                    {report.atRiskStudents.map((student: any) => (
                                        <div key={student._id} className="px-4 py-2 flex items-center justify-between hover:bg-background/50 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground leading-tight">{student.studentName}</span>
                                                <span className="text-[10px] text-muted font-medium">Roll No: {student.rollNumber || 'N/A'}</span>
                                            </div>
                                            <span className="px-2 py-1 bg-danger/10 text-danger border border-danger/20 rounded text-[10px] font-bold whitespace-nowrap">
                                                {student.totalAbsences} Days Absent
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </main>
        </div>
    );
}