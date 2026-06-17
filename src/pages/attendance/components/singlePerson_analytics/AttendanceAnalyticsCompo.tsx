import  { useState } from 'react';
// import { useGetStudentAttendanceHistory } from '../../../api_services/attendance_api/attendanceApi'; // Adjust path
// import { SearchSelect } from '../../../shared/ui/SearchSelect'; // Adjust path

// Import your sub-components
// import AttendanceCalendar from './AttendanceCalendar'; // Adjust path
import AttendanceAnalytics from './AttendanceAnalytics'; // Adjust path
import AttendanceTrendsChart from './AttendanceTrendsChart'; // Adjust path
import AttendancePatternsChart from './AttendancePatternsChart'; // Adjust path
import { useGetStudentAttendanceHistory } from '../../../../api_services/attendance_api/attendanceApi';
import { SearchSelect } from '../../../../shared/ui/SearchSelect';

// Filter Options
const ACADEMIC_YEAR_OPTIONS = [
    { label: "2025-2026", value: "2025-2026" },
    { label: "2026-2027", value: "2026-2027" }
];
const MONTH_OPTIONS = [
    { label: "January", value: 1 }, { label: "February", value: 2 }, { label: "March", value: 3 },
    { label: "April", value: 4 }, { label: "May", value: 5 }, { label: "June", value: 6 },
    { label: "July", value: 7 }, { label: "August", value: 8 }, { label: "September", value: 9 },
    { label: "October", value: 10 }, { label: "November", value: 11 }, { label: "December", value: 12 }
];
const YEAR_OPTIONS = [
    { label: "2025", value: 2025 }, { label: "2026", value: 2026 }, { label: "2027", value: 2027 }
];

interface AttendanceAnalyticsCompoProps {
    studentId: string;
}

export default function AttendanceAnalyticsCompo({ studentId }: AttendanceAnalyticsCompoProps) {
    // --- Local Filter State ---
    const currentDate = new Date();
    const [filters, setFilters] = useState({
        academicYear: "2025-2026", // Default
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
    });

    const handleFilterChange = (key: string, value: string | number) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // --- Fetch Core Data (For Calendar & Donut) ---
    const { data: attendancePayload, isLoading, isError } = useGetStudentAttendanceHistory({
        studentId,
        academicYear: filters.academicYear,
        month: filters.month,
        year: filters.year
    });

    // const records = attendancePayload?.data || [];
    const summary = attendancePayload?.summary || { present: 0, absent: 0, late: 0, halfDay: 0, totalDays: 0 };


    return (
        <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in bg-background relative overflow-hidden">
            
            {/* --- FLAT HEADER DESIGN WITH FILTERS --- */}
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 shrink-0 px-1 pt-2">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                            <i className="fas fa-calendar-check text-primary"></i>
                            Attendance Analytics
                        </h2>
                        <p className="text-sm text-muted mt-1">Track presence, trends, and weekday patterns.</p>
                    </div>
                </div>

                {/* Filter Dropdowns */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto z-20">
                    <div className="w-full sm:w-48">
                        <SearchSelect
                            label=""
                            options={ACADEMIC_YEAR_OPTIONS}
                            value={filters.academicYear}
                            onChange={(opt) => handleFilterChange('academicYear', String(opt.value))}
                            placeholder="Academic Year..."
                        />
                    </div>
                    <div className="w-full sm:w-40">
                        <SearchSelect
                            label=""
                            options={MONTH_OPTIONS}
                            value={filters.month}
                            onChange={(opt) => handleFilterChange('month', Number(opt.value))}
                            placeholder="Select Month..."
                        />
                    </div>
                    <div className="w-full sm:w-40">
                        <SearchSelect
                            label=""
                            options={YEAR_OPTIONS}
                            value={filters.year}
                            onChange={(opt) => handleFilterChange('year', Number(opt.value))}
                            placeholder="Select Year..."
                        />
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT (Scrolling Dashboard) --- */}
            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <i className="fas fa-circle-notch fa-spin text-primary text-4xl"></i>
                </div>
            ) : isError ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-surface border border-border rounded-2xl shadow-sm">
                    <i className="fas fa-exclamation-triangle text-danger text-4xl mb-3"></i>
                    <h3 className="text-lg font-bold text-foreground">Failed to Load History</h3>
                    <p className="text-sm text-muted">Unable to retrieve attendance records. Please try again.</p>
                </div>
            ) : (
                /* 🌟 min-h-0 is crucial here so it scrolls independently without breaking the page height */
                <div className="flex-1 min-h-0 flex flex-col gap-6 overflow-y-auto custom-scrollbar pb-8 pr-1">

                    {/* ROW 2: Overview Donut (1/3) & Trend Line Chart (2/3) */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 shrink-0">
                        <div className="xl:col-span-1 h-[420px]">
                            <AttendanceAnalytics summary={summary} academicYear={filters.academicYear} />
                        </div>
                        <div className="xl:col-span-2 h-[420px]">
                            <AttendanceTrendsChart 
                                studentId={studentId} 
                                academicYear={filters.academicYear} 
                            />
                        </div>
                    </div>

                    {/* ROW 3: Weekday Pattern Bar Chart (Full Width) */}
                    <div className="w-full h-[350px] shrink-0">
                        <AttendancePatternsChart 
                            studentId={studentId} 
                            academicYear={filters.academicYear} 
                        />
                    </div>

                </div>
            )}
        </div>
    );
}