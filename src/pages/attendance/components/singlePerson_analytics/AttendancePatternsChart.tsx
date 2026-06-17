import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useGetStudentAttendancePatterns } from '../../../../api_services/attendance_api/attendanceApi'; // Check path

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 🌟 1. DEFINE THE FIXED WEEKDAYS
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AttendancePatternsChart({ studentId, academicYear }: { studentId: string, academicYear: string }) {
    const { data: patterns, isLoading } = useGetStudentAttendancePatterns(studentId, academicYear);

    // 🌟 2. MAP DATA TO THE FIXED WEEKDAYS
    const absenceData = WEEK_DAYS.map(dayName => {
        const match = patterns?.find((p: any) => p.day.substring(0, 3) === dayName);
        return match ? match.absences : 0;
    });

    const lateData = WEEK_DAYS.map(dayName => {
        const match = patterns?.find((p: any) => p.day.substring(0, 3) === dayName);
        return match ? match.lates : 0;
    });

    // 🌟 3. MAP HALF-DAY DATA
    const halfDayData = WEEK_DAYS.map(dayName => {
        const match = patterns?.find((p: any) => p.day.substring(0, 3) === dayName);
        return match ? match.halfDays : 0;
    });

    // Check if there is ANY data across all three metrics
    const hasAnyData = absenceData.some(val => val > 0) || lateData.some(val => val > 0) || halfDayData.some(val => val > 0);

    const chartData = {
        labels: WEEK_DAYS,
        datasets: [
            {
                label: 'Leave Taken', 
                data: absenceData,
                backgroundColor: '#ef4444', // Danger Red
                borderRadius: 4,
                barThickness: 12, // Reduced slightly so 3 bars fit nicely
            },
            {
                label: 'Late Arrivals',
                data: lateData,
                backgroundColor: '#f59e0b', // Warning Yellow
                borderRadius: 4,
                barThickness: 12,
            },
            {
                // 🌟 ADDED HALF-DAY DATASET
                label: 'Half-Day',
                data: halfDayData,
                backgroundColor: '#3b82f6', // Primary Blue
                borderRadius: 4,
                barThickness: 12,
            }
        ]
    };

     const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'end' as const,
                labels: { boxWidth: 10, usePointStyle: true, font: { size: 10 } }
            },
            tooltip: {
                callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw}` }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: { stepSize: 1, font: { size: 10} } // Force whole numbers
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 10, weight: 'bold' as const } }
            }
        }
    };

    return (
        <div className="bg-surface border border-border rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
            {/* Premium, Friendly Header */}
            <div className="px-6 py-4 border-b border-border/50 bg-transparent flex items-center gap-2.5">
                <i className="fas fa-calendar-day text-muted/60 text-sm"></i>
                <h3 className="text-sm font-bold text-foreground tracking-wider">Attendance by Weekday</h3>
            </div>
            
            <div className="p-5 flex-1 relative min-h-[200px] flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center text-muted animate-pulse">
                        <i className="fas fa-spinner fa-spin mr-2"></i> Loading patterns...
                    </div>
                ) : !hasAnyData ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-50">
                        <i className="fas fa-calendar-week text-3xl mb-2"></i>
                        <p className="text-sm">No pattern data available yet.</p>
                    </div>
                ) : (
                    <div className="relative flex-1 w-full h-full mt-2">
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                )}
            </div>
        </div>
    );
}