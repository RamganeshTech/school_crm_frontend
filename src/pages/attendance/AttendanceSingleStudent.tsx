
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useGetStudentAttendanceHistory } from '../../api_services/attendance_api/attendanceApi'; // Adjust path
import { SearchSelect } from '../../shared/ui/SearchSelect'; // Adjust path
import { formatDate, getAcademicYears } from '../../utils/utils';
import { useSelector } from 'react-redux';
import type { RootState } from '../../features/store/store';
import { useGetSchoolById } from '../../api_services/schoolConfig_api/schoolapi';
import { SideModal } from '../../shared/ui/SideModal';

// --- Register Chart.js Elements ---
ChartJS.register(ArcElement, Tooltip, Legend);

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
     const { schoolId } = useSelector((state: RootState) => state.auth);



     
     const navigate = useNavigate();
     
     // Initial State (Defaulting to current month/year)
     const currentDate = new Date();
     const { data: schoolData } = useGetSchoolById(schoolId!);
     console.log("schoolData", schoolData)
     console.log("schoolId", schoolId)

    const [filters, setFilters] = useState({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        academicYear: schoolData?.currentAcademicYear
    });

    // Local State for Day Click Modal
    const [selectedDayRecord, setSelectedDayRecord] = useState<any>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const academicYearOptions = getAcademicYears();

    // Fetch Real Data
    const { data: attendancePayload, isLoading, isError } = useGetStudentAttendanceHistory({
        studentId: studentId!,
        month: filters.month,
        year: filters.year,
        academicYear: filters.academicYear
    });


    useEffect(() => {
    if (schoolData?.currentAcademicYear) {
        setFilters(prev => ({
            ...prev,
            academicYear: schoolData.currentAcademicYear
        }));
    }
}, [schoolData]);

    const handleFilterChange = (key: keyof typeof filters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleDayClick = (recordForDay: any) => {
        if (recordForDay) {
            setSelectedDayRecord(recordForDay);
            setIsDetailsModalOpen(true);
        }
    };

    const records = attendancePayload?.data || [];
    const summary = attendancePayload?.summary || { present: 0, absent: 0, late: 0, totalDays: 0 };

    // Helper for status colors using semantic variables
    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'present': return 'bg-success/10 text-success border-success/30';
            case 'absent': return 'bg-danger/10 text-danger border-danger/30';
            case 'late': return 'bg-warning/10 text-warning border-warning/30';
            case 'half-day': return 'bg-primary-soft text-primary border-primary/30';
            default: return 'bg-surface text-muted border-border';
        }
    };

    return (
        <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in bg-background p-2 md:p-4 relative overflow-hidden">
            
            {/* --- FLAT HEADER DESIGN --- */}
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 shrink-0 px-1">
                <div className="flex items-center gap-3 sm:gap-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-border text-muted hover:bg-sub-header transition-colors cursor-pointer shrink-0"
                    >
                        <i className="fas fa-arrow-left text-sm"></i>
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                            <i className="fas fa-calendar-check text-primary"></i>
                            Attendance History
                        </h2>
                        <p className="text-sm text-muted mt-1">Track presence, absences, and daily remarks.</p>
                    </div>
                </div>

                {/* Filter Dropdowns */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto z-20">
                    <div className="w-full sm:w-48">
                        <SearchSelect
                            label=""
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

            {/* --- MAIN CONTENT --- */}
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
                <div className="flex-1 flex flex-col lg:flex-row gap-5 lg:gap-6 overflow-hidden">
                    
                    {/* LEFT: Calendar Grid Widget */}
                    <div className="flex-1 bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-border bg-sub-header/50 flex justify-between items-center shrink-0">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Monthly Calendar</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                            <AttendanceCalendar 
                                currentMonth={filters.month - 1} // JS Dates are 0-indexed (Jan=0)
                                currentYear={filters.year} 
                                records={records} 
                                onDayClick={handleDayClick} 
                            />
                        </div>
                    </div>

                    {/* RIGHT: Backend-Driven Analytics Panel */}
                    <div className="w-full lg:w-[320px] shrink-0">
                        <AttendanceAnalytics summary={summary} />
                    </div>

                </div>
            )}

            {/* --- DAY DETAILS SLIDE MODAL --- */}
            {/* --- DAY DETAILS SLIDE MODAL --- */}
            <SideModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Attendance Details"
                width="w-full sm:w-[400px]"
            >
                {selectedDayRecord && (
                    <div className="flex flex-col h-full space-y-6">
                        
                        {/* Date Banner */}
                        <div className={`p-5 rounded-xl border flex flex-col items-start gap-3 ${getStatusStyle(selectedDayRecord.status).replace('border-', 'border-').replace('text-', 'bg-').replace('/10', '/5')}`}>
                            <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${getStatusStyle(selectedDayRecord.status)}`}>
                                {selectedDayRecord.status}
                            </span>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">
                                    {formatDate(selectedDayRecord.date, { variant: 'long' })}
                                </h3>
                                <p className="text-sm font-semibold text-muted mt-0.5">
                                    {formatDate(selectedDayRecord.date, { variant: 'full' }).split(',')[0]}
                                </p>
                            </div>
                        </div>

                        {/* Remarks Section */}
                        <div className="space-y-2 flex-1">
                            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Teacher Remarks</h4>
                            <div className="bg-surface border border-border rounded-lg p-5 min-h-[150px] shadow-sm">
                                {selectedDayRecord.remark ? (
                                    <p className="text-sm text-foreground leading-relaxed">
                                        {selectedDayRecord.remark}
                                    </p>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted opacity-50 py-6">
                                        <i className="fas fa-comment-slash text-3xl mb-3"></i>
                                        <p className="text-sm font-medium">No remarks recorded for this day.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </SideModal>
        </div>
    );
}

// ============================================================================
// SUB-COMPONENT: Attendance Calendar Grid
// ============================================================================
function AttendanceCalendar({ currentMonth, currentYear, records, onDayClick }: { currentMonth: number, currentYear: number, records: any[], onDayClick: (r: any) => void }) {
    
    // Calendar Math
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)

    const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="max-w-full mx-auto w-full">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-[10px] sm:text-xs font-bold text-muted uppercase tracking-wider py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {blankDays.map(blank => (
                    <div key={`blank-${blank}`} className="aspect-square rounded-xl bg-transparent"></div>
                ))}
                
                {monthDays.map(day => {
                    // Match backend record date with calendar day
                    const recordForDay = records.find((r: any) => {
                        const recDate = new Date(r.date);
                        return recDate.getDate() === day && recDate.getMonth() === currentMonth && recDate.getFullYear() === currentYear;
                    });

                    const status = recordForDay?.status?.toLowerCase();
                    const isPresent = status === 'present';
                    const isAbsent = status === 'absent';
                    const isLate = status === 'late';
                    const isHalfDay = status === 'half-day';

                    return (
                        <button 
                            key={day}
                            disabled={!recordForDay}
                            onClick={() => onDayClick(recordForDay)}
                            title={recordForDay ? `Click to view details for ${day}` : 'No data recorded'}
                            className={`aspect-square rounded-xl flex flex-col items-center justify-center border transition-all relative group ${
                                !recordForDay ? 'bg-background border-border/50 opacity-40 cursor-not-allowed' 
                                : isPresent ? 'bg-success/10 border-success/30 hover:bg-success/20 cursor-pointer shadow-sm hover:shadow'
                                : isAbsent ? 'bg-danger/10 border-danger/30 hover:bg-danger/20 cursor-pointer shadow-sm hover:shadow'
                                : isLate ? 'bg-warning/10 border-warning/30 hover:bg-warning/20 cursor-pointer shadow-sm hover:shadow'
                                : isHalfDay ? 'bg-primary-soft border-primary/30 hover:bg-primary/20 cursor-pointer shadow-sm hover:shadow'
                                : 'bg-surface border-border hover:bg-sub-header cursor-pointer'
                            }`}
                        >
                            <span className={`text-base sm:text-xl font-black ${
                                !recordForDay ? 'text-muted' 
                                : isPresent ? 'text-success' 
                                : isAbsent ? 'text-danger' 
                                : isLate ? 'text-warning' 
                                : isHalfDay ? 'text-primary'
                                : 'text-foreground'
                            }`}>
                                {day}
                            </span>
                            
                            {/* Dot indicator if there's a remark */}
                            {recordForDay?.remark && (
                                <div className="absolute bottom-1.5 sm:bottom-2 flex gap-1">
                                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                                        isPresent ? 'bg-success' : isAbsent ? 'bg-danger' : isLate ? 'bg-warning' : 'bg-primary'
                                    }`}></div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================================================
// SUB-COMPONENT: Analytics Panel & Donut Chart
// ============================================================================
function AttendanceAnalytics({ summary }: { summary: any }) {
    
    // Tally Data strictly from Backend Summary Object
    const presentCount = summary.present || 0;
    const absentCount = summary.absent || 0;
    const lateCount = summary.late || 0;
    const halfDayCount = summary.halfDay || 0;
    const totalRecorded = summary.totalDays || 0;

    // Chart Configuration using standard semantic colors
    const donutData = {
        labels: ['Present', 'Absent', 'Late', 'Half-Day'],
        datasets: [{
            data: [presentCount, absentCount, lateCount, halfDayCount],
            backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'], // Success, Danger, Warning, Primary
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const donutOptions = {
        cutout: '75%',
        plugins: {
            legend: { display: false },
            tooltip: { 
                callbacks: { 
                    label: (ctx: any) => ` ${ctx.label}: ${ctx.raw} Days` 
                } 
            }
        },
        maintainAspectRatio: false
    };

    return (
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-5 py-4 border-b border-border bg-sub-header/50">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Analytics Overview</h3>
            </div>
            
            <div className="p-5 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                {totalRecorded === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-50 py-10">
                        <i className="fas fa-chart-pie text-4xl mb-3"></i>
                        <p className="text-sm font-medium">No Data Available</p>
                    </div>
                ) : (
                    <>
                        <div className="h-48 relative flex justify-center mb-6 mt-2 shrink-0">
                            <Doughnut data={donutData} options={donutOptions} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black text-foreground">{totalRecorded}</span>
                                <span className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">Total Days</span>
                            </div>
                        </div>

                        <div className="space-y-3 mt-auto shrink-0">
                            <StatRow color="bg-success" textColor="text-success" label="Present Days" count={presentCount} total={totalRecorded} />
                            <StatRow color="bg-danger" textColor="text-danger" label="Absent Days" count={absentCount} total={totalRecorded} />
                            {lateCount > 0 && (
                                <StatRow color="bg-warning" textColor="text-warning" label="Late Arrivals" count={lateCount} total={totalRecorded} />
                            )}
                            {halfDayCount > 0 && (
                                <StatRow color="bg-primary" textColor="text-primary" label="Half Days" count={halfDayCount} total={totalRecorded} />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// Helper for Analytics Rows
function StatRow({ color, textColor, label, count, total }: { color: string, textColor: string, label: string, count: number, total: number }) {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    
    return (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                <span className="text-sm font-bold text-foreground">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className={`text-base font-black ${textColor}`}>{count}</span>
                <span className="text-[10px] font-bold text-muted bg-surface border border-border px-1.5 py-0.5 rounded">
                    {percentage}%
                </span>
            </div>
        </div>
    );
}