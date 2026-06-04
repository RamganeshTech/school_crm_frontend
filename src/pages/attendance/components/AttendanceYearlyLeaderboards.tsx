// // components/AttendanceYearlyLeaderboards.tsx

// export const AttendanceYearlyLeaderboards = ({ data }: { data: any }) => {
//     if (!data) return null;

//     // Helper to render individual student rows cleanly
//     const StudentRow = ({ student, metric, metricLabel, colorClass }: any) => (
//         <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0 hover:bg-background/50 transition-colors px-2 rounded-lg">
//             <div className="flex items-center gap-3">
//                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-${colorClass}/10 text-${colorClass}`}>
//                     {student.studentName?.charAt(0).toUpperCase() || '?'}
//                 </div>
//                 <div className="flex flex-col">
//                     <span className="text-sm font-bold text-foreground leading-tight">{student.studentName || 'Unknown'}</span>
//                     <span className="text-[10px] text-muted font-medium">Roll: {student.rollNumber || 'N/A'}</span>
//                 </div>
//             </div>
//             <div className={`px-2.5 py-1 rounded-md bg-${colorClass}/10 border border-${colorClass}/20 text-${colorClass} text-xs font-bold whitespace-nowrap`}>
//                 {metric} {metricLabel}
//             </div>
//         </div>
//     );

//     return (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
            
//             {/* 1. Top Attendance (Best Performers) */}
//             <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
//                 <div className="bg-success/5 px-4 py-3 border-b border-success/10 flex items-center gap-2.5">
//                     <i className="fas fa-trophy text-success"></i>
//                     <div>
//                         <h3 className="text-sm font-bold text-success leading-none">Hall of Fame</h3>
//                         <p className="text-[10px] text-success/80 font-medium mt-0.5">Top 10 Highest Attendance</p>
//                     </div>
//                 </div>
//                 <div className="p-2">
//                     {data.topAttendance?.length === 0 && <p className="text-xs text-muted p-4 text-center">No records found.</p>}
//                     {data.topAttendance?.map((s: any) => (
//                         <StudentRow key={s._id} student={s} metric={`${s.attendancePercentage}%`} metricLabel="" colorClass="success" />
//                     ))}
//                 </div>
//             </div>

//             {/* 2. Lowest Attendance (Action Required) */}
//             <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
//                 <div className="bg-danger/5 px-4 py-3 border-b border-danger/10 flex items-center gap-2.5">
//                     <i className="fas fa-exclamation-triangle text-danger"></i>
//                     <div>
//                         <h3 className="text-sm font-bold text-danger leading-none">Critical Absentees</h3>
//                         <p className="text-[10px] text-danger/80 font-medium mt-0.5">Top 10 Most Days Missed</p>
//                     </div>
//                 </div>
//                 <div className="p-2">
//                     {data.lowestAttendance?.length === 0 && <p className="text-xs text-muted p-4 text-center">No records found.</p>}
//                     {data.lowestAttendance?.map((s: any) => (
//                         <StudentRow key={s._id} student={s} metric={s.absentCount} metricLabel="Days" colorClass="danger" />
//                     ))}
//                 </div>
//             </div>

//             {/* 3. Most Late Arrivals */}
//             <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
//                 <div className="bg-warning/5 px-4 py-3 border-b border-warning/10 flex items-center gap-2.5">
//                     <i className="fas fa-clock text-warning"></i>
//                     <div>
//                         <h3 className="text-sm font-bold text-warning leading-none">Punctuality Alert</h3>
//                         <p className="text-[10px] text-warning/80 font-medium mt-0.5">Top 10 Most Late Arrivals</p>
//                     </div>
//                 </div>
//                 <div className="p-2">
//                     {data.mostLate?.length === 0 && <p className="text-xs text-muted p-4 text-center">No late records found.</p>}
//                     {data.mostLate?.map((s: any) => (
//                         <StudentRow key={s._id} student={s} metric={s.lateCount} metricLabel="Times" colorClass="warning" />
//                     ))}
//                 </div>
//             </div>

//             {/* 4. Most Half-Days */}
//             <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
//                 <div className="bg-primary/5 px-4 py-3 border-b border-primary/10 flex items-center gap-2.5">
//                     <i className="fas fa-door-open text-primary"></i>
//                     <div>
//                         <h3 className="text-sm font-bold text-primary leading-none">Early Leavers</h3>
//                         <p className="text-[10px] text-primary/80 font-medium mt-0.5">Top 10 Most Half-Days Taken</p>
//                     </div>
//                 </div>
//                 <div className="p-2">
//                     {data.mostHalfDays?.length === 0 && <p className="text-xs text-muted p-4 text-center">No half-day records found.</p>}
//                     {data.mostHalfDays?.map((s: any) => (
//                         <StudentRow key={s._id} student={s} metric={s.halfDayCount} metricLabel="Days" colorClass="primary" />
//                     ))}
//                 </div>
//             </div>

//         </div>
//     );
// };



// components/AttendanceYearlyLeaderboards.tsx
import { TableContainer, TBody, Td, Th, THead, Tr } from '../../../shared/ui/TableLayout'; // Adjust path if necessary

export const AttendanceYearlyLeaderboards = ({ data }: { data: any }) => {
    if (!data) return null;

    // Reusable Table Component to maintain 100% uniformity across all 4 categories
    const LeaderboardTable = ({ title, subTitle, icon, listData, colorClass, metricKey }: any) => (
        <div className="bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden h-[400px]">
            
            {/* --- PROFESSIONAL HEADER --- */}
            <header className="px-4 py-3 border-b border-border bg-surface flex items-center gap-3 shrink-0">
                <div className={`w-8 h-8 rounded-lg bg-${colorClass}/10 border border-${colorClass}/20 flex items-center justify-center shrink-0`}>
                    <i className={`${icon} text-${colorClass} text-sm`}></i>
                </div>
                <div className="flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-foreground leading-tight">{title}</h3>
                    <p className="text-[10px] text-muted font-bold mt-0.5 uppercase tracking-wider">{subTitle}</p>
                </div>
            </header>

            {/* Table Content */}
            <div className="flex-1 overflow-auto custom-scrollbar relative p-0">
                {listData?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted opacity-60">
                        <i className="fas fa-folder-open text-2xl mb-2"></i>
                        <p className="text-xs">No records found</p>
                    </div>
                ) : (
                    // <TableContainer className="h-full border-none rounded-none shadow-none">
                    //     <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
                    //         <thead className="bg-background/90 backdrop-blur-sm text-muted uppercase text-[9px] tracking-wider sticky top-0 z-10 border-b border-border">
                    //             <tr>
                    //                 <th className="px-3 py-2 font-bold text-center w-10">S.No</th>
                    //                 <th className="px-3 py-2 font-bold">Student Name</th>
                    //                 <th className="px-3 py-2 font-bold text-center">Class</th>
                    //                 <th className="px-3 py-2 font-bold text-center">Sec</th>
                    //                 <th className="px-3 py-2 font-bold text-center">Days</th>
                    //                 <th className="px-3 py-2 font-bold text-center">Rate %</th>
                    //             </tr>
                    //         </thead>
                    //         <tbody className="divide-y divide-border/50">
                    //             {listData?.map((s: any, index: number) => (
                    //                 <tr key={s._id} className="hover:bg-background/50 transition-colors">
                    //                     <td className="px-3 py-2.5 text-center font-medium text-muted">{index + 1}</td>
                    //                     <td className="px-3 py-2.5">
                    //                         <div className="flex flex-col">
                    //                             <span className="font-bold text-foreground">{s.studentName || 'Unknown'}</span>
                    //                             <span className="text-[9px] text-muted font-medium">Roll: {s.rollNumber || 'N/A'}</span>
                    //                         </div>
                    //                     </td>
                                        
                    //                     {/* Renders className/sectionName if backend provides them, otherwise '-' */}
                    //                     <td className="px-3 py-2.5 text-center text-muted font-medium">{s.className || '-'}</td>
                    //                     <td className="px-3 py-2.5 text-center text-muted font-medium">{s.sectionName || '-'}</td>
                                        
                    //                     {/* Dynamic Metric Badge (Present, Absent, Late, or Half-Day count) */}
                    //                     <td className="px-3 py-2.5 text-center">
                    //                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-${colorClass}/10 text-${colorClass} border border-${colorClass}/20`}>
                    //                             {s[metricKey]}
                    //                         </span>
                    //                     </td>
                                        
                    //                     {/* Overall Attendance Percentage */}
                    //                     <td className="px-3 py-2.5 text-center font-bold text-foreground">
                    //                         {s.attendancePercentage}%
                    //                     </td>
                    //                 </tr>
                    //             ))}
                    //         </tbody>
                    //     </table>
                    // </TableContainer>



                    <TableContainer className="h-full border-none !rounded-none shadow-none">
                        <THead className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm shadow-sm">
                            <Tr className="hover:bg-transparent">
                                <Th className="text-center w-10 !px-3">S.No</Th>
                                <Th className="!px-3">Student Name</Th>
                                <Th className="text-center !px-3">Class</Th>
                                <Th className="text-center !px-3">Sec</Th>
                                <Th className="text-center !px-3">Days</Th>
                                <Th className="text-center !px-3">Rate %</Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {listData?.map((s: any, index: number) => (
                                <Tr key={s._id}>
                                    <Td className="text-center font-medium text-muted !px-3 !py-2.5">{index + 1}</Td>
                                    <Td className="!px-3 !py-2.5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground leading-tight">{s.studentName || 'Unknown'}</span>
                                            <span className="text-[10px] text-muted font-medium">Roll: {s.rollNumber || 'N/A'}</span>
                                        </div>
                                    </Td>
                                    
                                    <Td className="text-center text-muted font-medium !px-3 !py-2.5">{s.className || '-'}</Td>
                                    <Td className="text-center text-muted font-medium !px-3 !py-2.5">{s.sectionName || '-'}</Td>
                                    
                                    <Td className="text-center !px-3 !py-2.5">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-${colorClass}/10 text-${colorClass} border border-${colorClass}/20`}>
                                            {s[metricKey]}
                                        </span>
                                    </Td>
                                    
                                    <Td className="text-center font-bold text-foreground !px-3 !py-2.5">
                                        {s.attendancePercentage}%
                                    </Td>
                                </Tr>
                            ))}
                        </TBody>
                    </TableContainer>
                )}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
            
            <LeaderboardTable 
                title="Hall of Fame" 
                subTitle="Top 10 Highest Attendance" 
                icon="fas fa-trophy" 
                listData={data.topAttendance} 
                colorClass="success" 
                metricKey="presentCount" 
            />

            <LeaderboardTable 
                title="Critical Absentees" 
                subTitle="Top 10 Most Days Missed" 
                icon="fas fa-exclamation-triangle" 
                listData={data.lowestAttendance} 
                colorClass="danger" 
                metricKey="absentCount" 
            />

            <LeaderboardTable 
                title="Punctuality Alert" 
                subTitle="Top 10 Most Late Arrivals" 
                icon="fas fa-clock" 
                listData={data.mostLate} 
                colorClass="warning" 
                metricKey="lateCount" 
            />

            <LeaderboardTable 
                title="Early Leavers" 
                subTitle="Top 10 Most Half-Days Taken" 
                icon="fas fa-door-open" 
                listData={data.mostHalfDays} 
                colorClass="primary" 
                metricKey="halfDayCount" 
            />
            
        </div>
    );
};