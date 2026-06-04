// chartSetup.ts (or just put this at the top of your dashboard file)
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend, ArcElement
} from 'chart.js';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, ArcElement,
    Title, Tooltip, Legend
);

// Unified Semantic Colors for the entire dashboard
export const chartColors = {
    present: 'rgba(34, 197, 94, 0.85)',   // Success (Green)
    absent: 'rgba(239, 68, 68, 0.85)',    // Danger (Red)
    late: 'rgba(245, 158, 11, 0.85)',     // Warning (Amber)
    halfDay: 'rgba(59, 130, 246, 0.85)',  // Primary/Info (Blue)
    border: {
        present: 'rgb(34, 197, 94)',
        absent: 'rgb(239, 68, 68)',
        late: 'rgb(245, 158, 11)',
        halfDay: 'rgb(59, 130, 246)',
    }
};

// components/AttendanceDistributionDonut.tsx
import { Doughnut } from 'react-chartjs-2';

export const AttendanceDistributionDonut = ({ distribution }: { distribution: any }) => {
    const data = {
        labels: ['Present', 'Absent', 'Late', 'Half-Day'],
        datasets: [
            {
                data: [
                    distribution?.present || 0,
                    distribution?.absent || 0,
                    distribution?.late || 0,
                    distribution?.halfDay || 0
                ],
                backgroundColor: [
                    chartColors.present, chartColors.absent, 
                    chartColors.late, chartColors.halfDay
                ],
                borderColor: [
                    chartColors.border.present, chartColors.border.absent,
                    chartColors.border.late, chartColors.border.halfDay
                ],
                borderWidth: 1,
                hoverOffset: 4
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%', // Makes it a sleek modern donut
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: { boxWidth: 12, usePointStyle: true, padding: 20 }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
            }
        },
    };

    return (
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm h-[320px] flex flex-col">
            <h3 className="text-sm font-bold text-foreground mb-4">Overall Distribution</h3>
            <div className="flex-1 relative">
                <Doughnut data={data} options={options} />
            </div>
        </div>
    );
};