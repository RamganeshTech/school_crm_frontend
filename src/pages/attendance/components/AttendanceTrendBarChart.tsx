// // components/AttendanceTrendBarChart.tsx
// import { Bar } from 'react-chartjs-2';
// import { chartColors } from './AttendanceDistributionDonut';

// export const AttendanceTrendBarChart = ({ chartData }: { chartData: any[] }) => {
//     // 1. Format labels (e.g., "Jun 01")
//     const labels = chartData?.map(item => {
//         const date = new Date(item.date);
//         return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//     }) || [];

//     // 2. Prepare dataset
//     const data = {
//         labels,
//         datasets: [
//             {
//                 label: 'Present',
//                 data: chartData?.map(item => item.present),
//                 backgroundColor: chartColors.present,
//                 borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 4, bottomRight: 4 }, // Rounded inner bars
//             },
//             {
//                 label: 'Absent',
//                 data: chartData?.map(item => item.absent),
//                 backgroundColor: chartColors.absent,
//                 borderRadius: 4,
//             },
//             {
//                 label: 'Late',
//                 data: chartData?.map(item => item.late),
//                 backgroundColor: chartColors.late,
//                 borderRadius: 4,
//             },
//             {
//                 label: 'Half-Day',
//                 data: chartData?.map(item => item.halfDay),
//                 backgroundColor: chartColors.halfDay,
//                 borderRadius: 4,
//             }
//         ],
//     };

//     const options = {
//         responsive: true,
//         maintainAspectRatio: false,
//         interaction: {
//             mode: 'index' as const,
//             intersect: false,
//         },
//         plugins: {
//             legend: {
//                 position: 'top' as const,
//                 align: 'end' as const,
//                 labels: { boxWidth: 10, usePointStyle: true }
//             },
//             tooltip: {
//                 backgroundColor: 'rgba(0,0,0,0.85)',
//                 titleFont: { size: 13 },
//                 padding: 12,
//                 itemSort: (a: any, b: any) => b.raw - a.raw // Sorts tooltip by highest value
//             }
//         },
//         scales: {
//             x: {
//                 stacked: true, // Crucial for overlapping attendance
//                 grid: { display: false, drawBorder: false }
//             },
//             y: {
//                 stacked: true,
//                 grid: { color: 'rgba(150, 150, 150, 0.1)', drawBorder: false },
//                 beginAtZero: true
//             }
//         }
//     };

//     return (
//         <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm h-[320px] flex flex-col">
//             <h3 className="text-sm font-bold text-foreground mb-1">Daily Attendance Trends</h3>
//             <div className="flex-1 relative mt-2">
//                 <Bar data={data} options={options} />
//             </div>
//         </div>
//     );
// };




// components/AttendanceTrendBarChart.tsx
import { Bar } from 'react-chartjs-2';
import { chartColors } from './AttendanceDistributionDonut';

interface AttendanceTrendProps {
    chartData: any[];
    startDate: string;
    endDate: string;
}

export const AttendanceTrendBarChart = ({ chartData, startDate, endDate }: AttendanceTrendProps) => {

    // 1. GENERATE CONTINUOUS DATE RANGE
    // Creates an array of 'YYYY-MM-DD' strings for every single day in the selected range
    const generateDateRange = (start: string, end: string) => {
        const dates = [];
        let currentDate = new Date(start);
        const targetDate = new Date(end);

        while (currentDate <= targetDate) {
            dates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    };

    const fullDateRange = generateDateRange(startDate, endDate);

    // 2. PAD SPARSE DATA WITH ZEROS
    // Maps over every day in the range. If the DB returned data for it, use it. Otherwise, return all 0s.
   const paddedData = fullDateRange.map(dateStr => {
        const existingData = chartData?.find(d => d.date === dateStr);
        
        // Extract from the nested "data" object if it exists, otherwise default to 0
        return { 
            date: dateStr, 
            present: existingData?.data?.present || 0, 
            absent: existingData?.data?.absent || 0, 
            late: existingData?.data?.late || 0, 
            // Handle both possible naming conventions from the DB aggregation just in case
            halfDay: existingData?.data?.['half-day'] || existingData?.data?.halfDay || 0 
        };
    });

    // 3. FORMAT LABELS FOR THE X-AXIS
    const labels = paddedData.map(item => {
        // Adding 'T00:00:00' prevents timezone shift bugs when parsing strict YYYY-MM-DD strings
        const date = new Date(`${item.date}T00:00:00`);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // 4. BUILD THE DATASETS USING THE PADDED DATA
    const data = {
        labels,
        datasets: [
            {
                label: 'Present',
                data: paddedData.map(item => item.present),
                backgroundColor: chartColors.present,
                borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 4, bottomRight: 4 },
            },
            {
                label: 'Absent',
                data: paddedData.map(item => item.absent),
                backgroundColor: chartColors.absent,
                borderRadius: 4,
            },
            {
                label: 'Late',
                data: paddedData.map(item => item.late),
                backgroundColor: chartColors.late,
                borderRadius: 4,
            },
            {
                label: 'Half-Day',
                data: paddedData.map(item => item.halfDay),
                backgroundColor: chartColors.halfDay,
                borderRadius: 4,
            }
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'end' as const,
                labels: { boxWidth: 10, usePointStyle: true }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.85)',
                titleFont: { size: 13 },
                padding: 12,
                itemSort: (a: any, b: any) => b.raw - a.raw
            }
        },
        scales: {
            x: {
                stacked: true,
                grid: { display: false, drawBorder: false }
            },
            y: {
                stacked: true,
                grid: { color: 'rgba(150, 150, 150, 0.1)' },
                beginAtZero: true,
                ticks: {
                    precision: 0 // Forces Y-axis to use whole numbers (you can't have 1.5 students)
                }
            }
        }
    };

    return (
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm h-[320px] flex flex-col">
            <h3 className="text-sm font-bold text-foreground mb-1">Daily Attendance Trends</h3>
            <div className="flex-1 relative mt-2">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};