import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetStudentAttendanceHistory } from '../../api_services/attendance_api/attendanceApi'; // Adjust path
import { SearchSelect } from '../../shared/ui/SearchSelect'; // Adjust path
import { formatDate, getAcademicYears } from '../../utils/utils';
// import { formatDate } from '../../utils/dateUtils'; // Adjust path to the utility we made earlier


const MONTH_OPTIONS = [
    { label: 'January', value: 1 }, { label: 'February', value: 2 },
    { label: 'March', value: 3 }, { label: 'April', value: 4 },
    { label: 'May', value: 5 }, { label: 'June', value: 6 },
    { label: 'July', value: 7 }, { label: 'August', value: 8 },
    { label: 'September', value: 9 }, { label: 'October', value: 10 },
    { label: 'November', value: 11 }, { label: 'December', value: 12 }
];

const YEAR_OPTIONS = [
    { label: '2024', value: 2024 },
    { label: '2025', value: 2025 },
    { label: '2026', value: 2026 }
];

export default function AttendanceSingleStudent() {
    const { studentId } = useParams<{ studentId: string }>();

    // Initial State (Defaulting to current month/year)
    const currentDate = new Date();
    const [filters, setFilters] = useState({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        academicYear: `${currentDate.getFullYear()}-${currentDate.getFullYear() + 1}`
    });

    const academicYearOptions = getAcademicYears();

    const { data: attendancePayload, isLoading, isError } = useGetStudentAttendanceHistory({
        studentId: studentId!,
        month: filters.month,
        year: filters.year,
        academicYear: filters.academicYear
    });

    const handleFilterChange = (key: keyof typeof filters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const records = attendancePayload?.data || [];
    const summary = attendancePayload?.summary || {};

    // Helper for status colors using semantic variables
    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'present': return 'bg-success/10 text-success border-success/20';
            case 'absent': return 'bg-danger/10 text-danger border-danger/20';
            case 'late': return 'bg-warning/10 text-warning border-warning/20';
            case 'half-day': return 'bg-primary-soft text-primary border-primary/20';
            default: return 'bg-sub-header text-muted border-border';
        }
    };

    return (
        <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in bg-background p-2 md:p-4">
            
            {/* Header & Filters */}
            {/* --- FLAT HEADER DESIGN --- */}
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 shrink-0 px-1">
                <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-calendar-check text-primary"></i>
                        Attendance History
                    </h2>
                    <p className="text-sm text-muted mt-1">Track presence, absences, and daily remarks.</p>
                </div>

                {/* Filter Dropdowns sitting cleanly on the right */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                    <div className="w-full sm:w-48">
                        <SearchSelect
                            label="" // Removed label for a cleaner look
                            options={academicYearOptions}
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

            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <i className="fas fa-circle-notch fa-spin text-primary text-4xl"></i>
                </div>
            ) : isError ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-surface border border-border rounded-2xl">
                    <i className="fas fa-exclamation-triangle text-danger text-4xl mb-3"></i>
                    <h3 className="text-lg font-bold text-foreground">Failed to Load History</h3>
                    <p className="text-sm text-muted">Unable to retrieve attendance records. Please try again.</p>
                </div>
            ) : (
                <div className="flex flex-col flex-1 space-y-6 overflow-hidden">
                    
                    {/* Summary Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                        <MetricCard title="Present Days" count={summary.present || 0} percentage={summary.presentPercentage} icon="fa-user-check" colorClass="text-success" bgClass="bg-success/10" />
                        <MetricCard title="Absent Days" count={summary.absent || 0} percentage={summary.absentPercentage} icon="fa-user-times" colorClass="text-danger" bgClass="bg-danger/10" />
                        <MetricCard title="Late Arrivals" count={summary.late || 0} icon="fa-clock" colorClass="text-warning" bgClass="bg-warning/10" />
                        <MetricCard title="Total Recorded" count={summary.totalDays || 0} icon="fa-calendar-alt" colorClass="text-primary" bgClass="bg-primary-soft" />
                    </div>

                    {/* History List */}
                    <div className="flex-1 bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-border bg-sub-header/50 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Detailed Records</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                            {records.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted p-6">
                                    <i className="fas fa-calendar-times text-4xl mb-3 opacity-40"></i>
                                    <p className="font-semibold text-foreground">No Records Found</p>
                                    <p className="text-sm mt-1 text-center max-w-sm">There are no attendance records for the selected month and year combination.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {records.map((record: any) => (
                                        <div key={record.attendanceId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-background hover:bg-sub-header/30 transition-colors gap-4">
                                            
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-sub-header flex items-center justify-center text-muted shrink-0 border border-border">
                                                    <i className="far fa-calendar text-sm"></i>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">
                                                        {formatDate(record.date, { variant: 'long' })}
                                                    </p>
                                                    <p className="text-xs font-semibold text-muted mt-0.5">
                                                        {formatDate(record.date, { variant: 'full' }).split(',')[0]} {/* Extracts just the Day name */}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 sm:w-1/2 justify-end">
                                                {record.remark && (
                                                    <p className="text-xs text-muted truncate max-w-[150px] md:max-w-[250px]" title={record.remark}>
                                                        <i className="fas fa-comment-dots mr-1.5 opacity-60"></i>
                                                        {record.remark}
                                                    </p>
                                                )}
                                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${getStatusStyle(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Helper Subcomponent for Metrics ---
function MetricCard({ title, count, percentage, icon, colorClass, bgClass }: { title: string, count: number, percentage?: number, icon: string, colorClass: string, bgClass: string }) {
    return (
        <div className="bg-surface border border-border p-4 rounded-2xl shadow-sm flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bgClass} ${colorClass}`}>
                <i className={`fas ${icon} text-lg`}></i>
            </div>
            <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-foreground">{count}</span>
                    {percentage !== undefined && (
                        <span className={`text-xs font-bold ${colorClass}`}>({percentage}%)</span>
                    )}
                </div>
            </div>
        </div>
    );
}