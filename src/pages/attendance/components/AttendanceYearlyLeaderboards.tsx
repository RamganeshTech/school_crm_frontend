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