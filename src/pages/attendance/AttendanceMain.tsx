import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../features/store/store';

// API Hooks
import { useGetClasses } from '../../api_services/schoolConfig_api/classApi';
import { useGetSections } from '../../api_services/schoolConfig_api/sectionApi';
import { type AttendanceRecord, useGetAttendanceSheet, useGetClassAttendanceHistory, useMarkAttendance } from '../../api_services/attendance_api/attendanceApi';
import { useGetAllStudents } from '../../api_services/student_api/studentMainApi';

// UI Components
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { TableContainer } from '../../shared/ui/TableLayout';
import { SideModal } from '../../shared/ui/SideModal';
import { toast } from '../../shared/ui/ToastContext';
import { getAcademicYears } from '../../utils/utils';
import { useGetSchoolById } from '../../api_services/schoolConfig_api/schoolapi';

export default function AttendanceMain() {
    const { schoolId } = useSelector((state: RootState) => state.auth);

    // Get today's date in YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];
    const currentYearMonth = todayStr.substring(0, 7); // "YYYY-MM"

    // --- Top Bar Filters ---
    const [filters, setFilters] = useState({
        academicYear: '',
        classId: '',
        sectionId: '',
        month: currentYearMonth
    });


    const { data: schoolData } = useGetSchoolById(schoolId!)


    useEffect(() => {
        if (schoolData) {
            setFilters((prev) => ({ ...prev, academicYear: schoolData?.currentAcademicYear || "2025-2026" }))
        }
    }, [schoolData])



    // --- Data Fetching: Filters ---
    const { data: classesData } = useGetClasses(schoolId!);
    const { data: sectionsData, isLoading: isSectionsLoading } = useGetSections({
        schoolId: schoolId!, classId: filters.classId
    });

    // --- Data Fetching: Students ---
    const { data: studentsData, isLoading: isStudentsLoading } = useGetAllStudents({
        schoolId: schoolId!, classId: filters.classId, sectionId: filters.sectionId, limit: 300
    });
    // const students = studentsData?.pages?.flat() || [];

    const students = useMemo(() => studentsData?.pages?.flat() || [], [studentsData]);

    // --- Data Fetching: Monthly History for Grid ---
    const year = parseInt(filters.month.split('-')[0]);
    const monthIndex = parseInt(filters.month.split('-')[1]) - 1;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const startDate = `${filters.month}-01`;
    const endDate = `${filters.month}-${daysInMonth.toString().padStart(2, '0')}`;

    const { data: historyData, isLoading: isHistoryLoading, refetch: refetchHistory } = useGetClassAttendanceHistory({
        schoolId: schoolId!, classId: filters.classId, sectionId: filters.sectionId, academicYear: filters.academicYear,
        startDate, endDate
    });

    // Transform History Array into a fast lookup matrix: map[studentId][dayNumber] = 'present' | 'absent'
    const historyMatrix = useMemo(() => {
        const matrix: Record<string, Record<number, string>> = {};
        if (!historyData) return matrix;

        historyData.forEach((sheet: any) => {
            const dateObj = new Date(sheet.date);
            const day = dateObj.getDate();

            sheet.records.forEach((rec: any) => {
                if (!matrix[rec.studentId]) matrix[rec.studentId] = {};
                matrix[rec.studentId][day] = rec.status;
            });
        });
        return matrix;
    }, [historyData]);

    // ==========================================
    // MARKING MODAL STATE & LOGIC
    // ==========================================
    const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
    const [markDate, setMarkDate] = useState(todayStr);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord>>({});

    const { data: singleSheetData, isFetching: isSingleSheetLoading } = useGetAttendanceSheet({
        schoolId: schoolId!, classId: filters.classId, sectionId: filters.sectionId, academicYear: filters.academicYear, date: markDate
    });

    const markAttendanceMutation = useMarkAttendance();

    // Sync Marking Modal with Sheet Data or Defaults
    // useEffect(() => {
    //     console.log("111111111111111")

    //     // Don't do anything if modal is closed or if data is still fetching
    //     if (!isMarkModalOpen || isSingleSheetLoading) return;

    //     const newMap: Record<string, AttendanceRecord> = {};


    //     console.log("atteandance main")
    //     if (singleSheetData && singleSheetData.length > 0) {
    //         console.log("singleSheetData", singleSheetData)

    //         singleSheetData.forEach((rec: any) => {

    //             // We find the matching student just in case the old DB records don't have the name/roll cached yet
    //             const matchedStudent = students.find((s: any) => s._id === rec.studentId);

    //             newMap[rec.studentId] = {
    //                 studentId: rec.studentId,
    //                 studentName: rec?.studentName || matchedStudent?.studentName || 'Unknown',
    //                 rollNumber: rec.rollNumber || matchedStudent?.nonMandatory?.rollNumber || matchedStudent?.rollNumber || '-',
    //                 status: rec.status,
    //                 remark: rec.remark || ''
    //             };
    //         });
    //     } else if (students.length > 0) {

    //         console.log("students", students)
    //         students.forEach((student: any) => {

    //             if (!student._id) {
    //                 console.warn("Student missing ID", student);
    //                 return;
    //             }

    //             newMap[student._id] = {
    //                 studentId: student._id,
    //                 studentName: student?.studentName || 'Unknown',
    //                 rollNumber: student?.nonMandatory?.rollNumber || student.rollNumber || '-',
    //                 status: '' as any,
    //                 remark: ''
    //             };
    //         });
    //     }

    //     setAttendanceMap(newMap);

    // }, [singleSheetData, students, isMarkModalOpen, markDate, isSingleSheetLoading]); // Added isSingleSheetLoading


    // Sync Marking Modal with Sheet Data or Defaults
    useEffect(() => {
        // Don't do anything if modal is closed or if data is still fetching
        if (!isMarkModalOpen || isSingleSheetLoading) return;

        const newMap: Record<string, AttendanceRecord> = {};

        // 🌟 ALWAYS loop over the 'students' array so nobody is left out
        students.forEach((student: any) => {
            if (!student._id) return;

            // Try to find if this student was already saved in the singleSheetData
            const existingRecord = singleSheetData?.find((rec: any) => rec?.studentId === student._id);

            newMap[student._id] = {
                studentId: student?._id,
                studentName: student?.studentName || 'Unknown',
                rollNumber: student?.nonMandatory?.rollNumber || student?.rollNumber || '-',
                // Use the saved status if it exists, otherwise default to empty ""
                status: existingRecord ? existingRecord?.status : ('' as any),
                remark: existingRecord ? (existingRecord.remark || '') : ''
            };
        });

        setAttendanceMap(newMap);

    }, [singleSheetData, students, isMarkModalOpen, markDate, isSingleSheetLoading]);

    const handleSaveAttendance = async (e: React.FormEvent) => {
        e.preventDefault();
        const recordsToSave = Object.values(attendanceMap);
        if (recordsToSave.length === 0) return toast.warning("No students to mark.");

        try {
            await markAttendanceMutation.mutateAsync({
                schoolId: schoolId!, classId: filters.classId, sectionId: filters.sectionId,
                academicYear: filters.academicYear, date: markDate, records: recordsToSave
            });
            toast.success(`Attendance for ${markDate} saved!`);
            setIsMarkModalOpen(false);
            refetchHistory(); // Refresh the grid to show new changes
        } catch (err: any) {
            toast.error(err.message || "Failed to save attendance.");
        }
    };

    // --- Helpers ---
    const handleFilterChange = (key: string, value: string) => setFilters(prev => ({ ...prev, [key]: value }));
    const academicYearOptions = getAcademicYears();
    const isReadyToView = filters.classId && filters.sectionId;

    // --- GRID INTERACTION ---
    // When a user clicks a cell or a date header in the grid, open the modal for that date
    const handleGridDateClick = (day: number) => {
        const formattedDay = day.toString().padStart(2, '0');
        const targetDate = `${filters.month}-${formattedDay}`;


        // 1. Check for Past Dates
        if (targetDate < todayStr) {
            toast.warning("Cannot modify attendance for past dates.");
            return;
        }

        // Prevent marking attendance for future dates
        if (targetDate > todayStr) {
            toast.warning("Cannot mark attendance for future dates.");
            return;
        }

        setMarkDate(targetDate);
        setIsMarkModalOpen(true);
    };

    // Helper to render colored status badge in grid
    const renderStatusCell = (status: string) => {
        switch (status) {
            case 'present': return <span className="text-success font-bold">P</span>;
            case 'absent': return <span className="text-danger font-bold">A</span>;
            case 'late': return <span className="text-warning font-bold">L</span>;
            case 'half-day': return <span className="text-primary font-bold">HD</span>;
            default: return <span className="text-muted/30 font-medium">-</span>;
        }
    };


    return (
        <div className="w-full h-full flex flex-col p-2 space-y-4 overflow-hidden animate-in fade-in duration-300">

            {/* --- TOP BAR: Filters & Actions --- */}
            <div className="bg-surface p-5 rounded-xl border border-border shadow-sm shrink-0 flex flex-col gap-4">

                {/* Title & Action */}
                <div className="flex justify-between items-center border-b border-border pb-3">
                    <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <i className="fas fa-book-open text-primary"></i>
                        Attendance Register
                    </h1>
                    {isReadyToView && (
                        <Button variant="primary" onClick={() => { setMarkDate(todayStr); setIsMarkModalOpen(true); }} leftIcon="fas fa-user-check">
                            Mark Register
                        </Button>
                    )}
                </div>

                {/* Horizontal Filters */}
                <div className="flex flex-wrap items-end gap-4">
                    <div className="w-40">
                        <SearchSelect label="Academic Year" options={academicYearOptions} value={filters.academicYear} onChange={(opt: any) => handleFilterChange('academicYear', String(opt.value))} />
                    </div>
                    <div className="w-48">
                        <SearchSelect label="Class" options={classesData?.map((c: any) => ({ label: c.name, value: c._id })) || []} value={filters.classId} onChange={(opt: any) => { handleFilterChange('classId', String(opt.value)); handleFilterChange('sectionId', ''); }} placeholder="Select Class..." />
                    </div>
                    <div className="w-48 relative">
                        <SearchSelect label="Section" options={sectionsData?.map((s: any) => ({ label: s.name, value: s._id })) || []} value={filters.sectionId} onChange={(opt: any) => handleFilterChange('sectionId', String(opt.value))} placeholder="Select Section..." />
                        {isSectionsLoading && <i className="fas fa-spinner fa-spin absolute right-3 top-[38px] text-muted text-xs"></i>}
                    </div>
                    <div className="w-40 ml-auto">
                        <Input id="month" type="month" label="Select Month" value={filters.month} onChange={(e) => handleFilterChange('month', e.target.value)} />
                    </div>
                </div>
            </div>

            {/* --- MAIN GRID (The Notebook) --- */}
            <div className="flex-1 bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden relative">
                {!isReadyToView ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted">
                        <i className="fas fa-border-all text-4xl mb-3 opacity-30"></i>
                        <h3 className="text-lg font-medium text-foreground">Register Closed</h3>
                        <p className="text-sm">Select a Class and Section above to open the monthly attendance grid.</p>
                    </div>
                ) : (
                    <>
                        {/* Legend */}
                        <div className="flex gap-4 px-4 py-2 border-b border-border bg-background text-xs font-medium shrink-0">
                            <span className="flex items-center gap-1.5 text-muted"><span className="w-2 h-2 rounded-full bg-success"></span> P - Present</span>
                            <span className="flex items-center gap-1.5 text-muted"><span className="w-2 h-2 rounded-full bg-danger"></span> A - Absent</span>
                            <span className="flex items-center gap-1.5 text-muted"><span className="w-2 h-2 rounded-full bg-warning"></span> L - Late</span>
                            <span className="flex items-center gap-1.5 text-muted"><span className="w-2 h-2 rounded-full bg-primary"></span> HD - Half Day</span>
                            <span className="ml-auto italic text-muted">Click any date column to edit attendance</span>
                        </div>

                        <TableContainer className="h-full overflow-auto custom-scrollbar relative">
                            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                                <thead className="bg-background text-muted uppercase text-[10px] tracking-wider sticky top-0 z-30 shadow-sm">
                                    <tr>
                                        {/* FROZEN LEFT COLUMN */}
                                        <th className="px-4 py-3 font-medium sticky left-0 z-40 bg-background border-r border-border border-b shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[220px]">
                                            Student Details
                                        </th>
                                        {/* DATE COLUMNS */}
                                        {/* {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                                            <th
                                                key={day}
                                                onClick={() => handleGridDateClick(day)}
                                                className="px-2 py-3 text-center font-bold border-r border-border/50 border-b w-10 min-w-[40px] cursor-pointer hover:bg-primary-soft/50 hover:text-primary transition-colors"
                                                title={`Mark attendance for ${day} ${filters.month}`}
                                            >
                                                {day}
                                            </th>
                                        ))} */}


                                        {/* DATE COLUMNS */}
                                        {/* DATE COLUMNS */}
                                        {/* DATE COLUMNS */}
                                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {

                                            // 1. Get exact current date numbers
                                            const today = new Date();
                                            const currentDay = today.getDate();
                                            const currentMonth = today.getMonth() + 1; // getMonth is 0-11, so add 1
                                            const currentYear = today.getFullYear();

                                            // 2. Safely extract year and month from your filter (Assuming format "2026-06")
                                            // By converting to String first, we prevent crashes if filters.month is undefined
                                            const filterString = String(filters.month || "");
                                            const [yearStr, monthStr] = filterString.split('-');

                                            const filterYear = parseInt(yearStr, 10);
                                            const filterMonth = parseInt(monthStr, 10);

                                            // 3. Strict comparison
                                            const isToday =
                                                day === currentDay &&
                                                filterMonth === currentMonth &&
                                                filterYear === currentYear;

                                            // Uncomment this line temporarily if it still doesn't work to see what is failing!
                                            // if (day === currentDay) console.log(`Checking Today: Filter(${filterYear}-${filterMonth}) vs Actual(${currentYear}-${currentMonth}) -> isToday: ${isToday}`);

                                            return (
                                                <th
                                                    key={day}
                                                    onClick={() => handleGridDateClick(day)}
                                                    className={`px-2 py-2 text-center font-bold border-r border-border/50 border-b w-10 min-w-[40px] cursor-pointer transition-all relative
                ${isToday
                                                            ? 'bg-primary/10 text-primary border-b-primary shadow-[inset_0_-3px_0_var(--theme-primary)]' // 🌟 Changed to primary/10 so it is unmistakably the "today" highlight
                                                            : 'bg-background hover:bg-primary-soft/50 hover:text-primary text-muted' // Explicitly set standard background
                                                        }
            `}
                                                    title={`Mark attendance for ${day} ${filters.month} ${isToday ? '(Today)' : ''}`}
                                                >
                                                    <div className="flex flex-col items-center justify-center">
                                                        <span className={isToday ? "text-primary" : ""}>{day}</span>

                                                        {/* The Dot Indicator */}
                                                        {isToday ? (
                                                            <div className="w-1 h-1 rounded-full bg-primary mt-0.5"></div>
                                                        ) : (
                                                            <div className="w-1 h-1 mt-0.5 bg-transparent"></div>
                                                        )}
                                                    </div>
                                                </th>
                                            );
                                        })}

                                        {/* DATE COLUMNS */}
                                        {/* {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {

                                            // Simply check if this day is today AND we are viewing the correct month/year
                                            const isToday = isViewingCurrentMonthAndYear && day === currentDay;

                                            return (
                                                <th
                                                    key={day}
                                                    onClick={() => handleGridDateClick(day)}
                                                    className={`px-2 py-3 text-center font-bold border-r border-border/50 border-b w-10 min-w-[40px] cursor-pointer transition-colors
                ${isToday
                                                            ? 'bg-primary text-white shadow-[inset_0_-3px_0_rgba(0,0,0,0.2)]' // 🌟 Highlight styles
                                                            : 'hover:bg-primary-soft/50 hover:text-primary'
                                                        }
            `}
                                                    title={`Mark attendance for ${day} ${filters.month}`}
                                                >
                                                    {day}
                                                </th>
                                            );
                                        })} */}

                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {isStudentsLoading || isHistoryLoading ? (
                                        <tr><td colSpan={daysInMonth + 1} className="py-20 text-center"><i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i></td></tr>
                                    ) : students.length === 0 ? (
                                        <tr><td colSpan={daysInMonth + 1} className="py-20 text-center text-muted">No students found.</td></tr>
                                    ) : (
                                        students.map((student: any) => {
                                            const sId = student._id;
                                            const rollNo = student?.nonMandatory?.rollNumber || student?.rollNumber || '-';
                                            const img = student?.studentImage?.url;

                                            return (
                                                <tr key={sId} className="hover:bg-background/50 transition-colors">
                                                    {/* FROZEN LEFT COLUMN */}
                                                    <td className="px-4 py-2 sticky left-0 z-20 bg-surface border-r border-border shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20 overflow-hidden">
                                                                {img ? <img src={img} alt="profile" className="w-full h-full object-cover" /> : student.studentName?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="truncate max-w-[150px]">
                                                                <p className="font-semibold text-foreground text-xs truncate" title={student.studentName}>{student.studentName}</p>
                                                                <p className="text-[10px] text-muted">Roll: {rollNo}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* DATE CELLS (Clicking these also opens the modal) */}
                                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                                                        <td
                                                            key={day}
                                                            onClick={() => handleGridDateClick(day)}
                                                            className="px-1 py-2 text-center border-r border-border/30 cursor-pointer hover:bg-background transition-colors"
                                                            title={`Edit ${student.studentName}'s attendance on ${day} ${filters.month}`}
                                                        >
                                                            <div className="flex items-center justify-center w-full h-full">
                                                                {renderStatusCell(historyMatrix[sId]?.[day])}
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </TableContainer>
                    </>
                )}
            </div>


            {/* =========================================================
                    MARK ATTENDANCE MODAL
                ========================================================= */}
            <SideModal isOpen={isMarkModalOpen} onClose={() => setIsMarkModalOpen(false)} title="Mark Register">
                <form onSubmit={handleSaveAttendance} className="flex flex-col h-full space-y-4">

                    <div className="shrink-0 space-y-4 border-b border-border pb-4">
                        <Input id="markDate" type="date" label="Date to Mark" value={markDate} onChange={(e) => setMarkDate(e.target.value)} required max={todayStr} />
                        <div className="flex gap-2 text-xs">
                            <span className="flex-1 bg-success/10 text-success border border-success/20 px-2 py-1.5 rounded text-center font-medium">P: Present</span>
                            <span className="flex-1 bg-danger/10 text-danger border border-danger/20 px-2 py-1.5 rounded text-center font-medium">A: Absent</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-3">
                        {isSingleSheetLoading ? (
                            <div className="flex justify-center py-10"><i className="fas fa-spinner fa-spin text-primary text-2xl"></i></div>
                        ) : students.length === 0 ? (
                            <p className="text-center text-muted text-sm py-10">No students available to mark.</p>
                        ) : (
                            <>
                                {/* QUICK ACTION HEADER */}
                                <div className="flex justify-between items-center px-1 pb-1">
                                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">Student List</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updatedMap = { ...attendanceMap };
                                            students.forEach((s: any) => {
                                                if (!updatedMap[s._id]?.status) {
                                                    updatedMap[s._id] = { ...updatedMap[s._id], status: 'present' };
                                                }
                                            });
                                            setAttendanceMap(updatedMap);
                                        }}
                                        className="text-xs font-medium text-primary hover:text-primary-hover hover:underline transition-colors cursor-pointer"
                                    >
                                        Mark Unmarked as Present
                                    </button>
                                </div>

                                {/* STUDENT LIST */}
                                {students.map((student: any) => {
                                    const rec = attendanceMap[student._id];
                                    const status = rec?.status || ''; // Defaults to empty
                                    const img = student?.studentImage?.url;

                                    return (
                                        <div key={student._id} className="bg-background border border-border p-3 rounded-xl flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                                                        {img ? <img src={img} alt="pfp" className="w-full h-full object-cover" /> : student.studentName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-foreground text-sm">{student.studentName}</p>
                                                        <p className="text-[10px] text-muted">Roll: {student?.nonMandatory?.rollNumber || student?.rollNumber || '-'}</p>
                                                    </div>
                                                </div>

                                                {/* Action Toggles with Dot Indicators */}
                                                <div className="flex bg-surface border border-border rounded-lg p-1 gap-1 shadow-sm">

                                                    {/* Present (Toggles on/off) */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setAttendanceMap(p => ({ ...p, [student._id]: { ...p[student._id], status: status === 'present' ? '' : 'present' } }))}
                                                        className={`relative flex flex-col items-center justify-center w-9 h-9 rounded-md text-xs font-bold cursor-pointer transition-all ${status === 'present' ? 'bg-success text-inverse shadow-sm' : 'bg-transparent text-muted hover:bg-background'}`}
                                                    >
                                                        <span className={status !== 'present' ? 'mb-1' : ''}>P</span>
                                                        {status !== 'present' && <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-success"></span>}
                                                    </button>

                                                    {/* Absent (Toggles on/off) */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setAttendanceMap(p => ({ ...p, [student._id]: { ...p[student._id], status: status === 'absent' ? '' : 'absent' } }))}
                                                        className={`relative flex flex-col items-center justify-center w-9 h-9 rounded-md text-xs font-bold cursor-pointer transition-all ${status === 'absent' ? 'bg-danger text-inverse shadow-sm' : 'bg-transparent text-muted hover:bg-background'}`}
                                                    >
                                                        <span className={status !== 'absent' ? 'mb-1' : ''}>A</span>
                                                        {status !== 'absent' && <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-danger"></span>}
                                                    </button>

                                                    {/* Late (Toggles on/off) */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setAttendanceMap(p => ({ ...p, [student._id]: { ...p[student._id], status: status === 'late' ? '' : 'late' } }))}
                                                        className={`relative flex flex-col items-center justify-center w-9 h-9 rounded-md text-xs font-bold cursor-pointer transition-all ${status === 'late' ? 'bg-warning text-inverse shadow-sm' : 'bg-transparent text-muted hover:bg-background'}`}
                                                    >
                                                        <span className={status !== 'late' ? 'mb-1' : ''}>L</span>
                                                        {status !== 'late' && <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-warning"></span>}
                                                    </button>

                                                    {/* Half Day (Toggles on/off) */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setAttendanceMap(p => ({ ...p, [student._id]: { ...p[student._id], status: status === 'half-day' ? '' : 'half-day' } }))}
                                                        className={`relative flex flex-col items-center justify-center w-9 h-9 rounded-md text-xs font-bold cursor-pointer transition-all ${status === 'half-day' ? 'bg-primary text-inverse shadow-sm' : 'bg-transparent text-muted hover:bg-background'}`}
                                                    >
                                                        <span className={status !== 'half-day' ? 'mb-1' : ''}>HD</span>
                                                        {status !== 'half-day' && <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-primary"></span>}
                                                    </button>

                                                </div>
                                            </div>

                                            {/* Show remarks ONLY if they are explicitly marked as something other than present/empty */}
                                            {(status === 'absent' || status === 'late' || status === 'half-day') && (
                                                <input
                                                    type="text" placeholder={`Add reason for being ${status}...`} value={rec?.remark || ''}
                                                    onChange={(e) => setAttendanceMap(p => ({ ...p, [student._id]: { ...p[student._id], remark: e.target.value } }))}
                                                    className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-muted/50 animate-in fade-in duration-200"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>

                    <div className="mt-auto pt-4 flex justify-end gap-3 border-t border-border shrink-0">
                        <Button type="button" variant="outline" onClick={() => setIsMarkModalOpen(false)}>Cancel</Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={markAttendanceMutation.isPending}
                            // disabled={students.length === 0 || Object.values(attendanceMap).some(rec => !rec.status)}
                            disabled={students.length === 0}
                        >
                            Save Attendance
                        </Button>
                    </div>
                </form>
            </SideModal>
        </div>
    );
}