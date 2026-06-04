import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';
import { Button } from '../../shared/ui/Button';
import { Label } from '../../shared/ui/Input';
import { SideModal } from '../../shared/ui/SideModal';
import { useGetStudentById } from '../../api_services/student_api/studentMainApi';
import { useGetAllHomeworkInfinite } from '../../api_services/homework_api/homeWorkApi';
// import { useGetAllHomeworkSubmissions, useSubmitHomeworkStatus } from '../../api_services/homework_api/homeWorksubmissionApi';
import { useGetSchoolById } from '../../api_services/schoolConfig_api/schoolapi';
import { useGetAllHomeworkSubmissions, useSubmitHomeworkStatus } from '../../api_services/homework_api/homeWorksubmissionApi';
import { toast } from '../../shared/ui/ToastContext';
import { useRoleCheck } from '../../hooks/useRoleCheck';

export default function HomeworkSubmissionMain() {
    const { schoolId } = useAuthData();
    const [searchParams] = useSearchParams();
    const studentId = searchParams.get('studentId');

    const { isCorrespondent, isParent } = useRoleCheck()

    const canModify = isCorrespondent || isParent

    // --- State ---
    const [viewDate, setViewDate] = useState(new Date());
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [activeDate, setActiveDate] = useState<Date | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<any | null>(null);

    // Submission Form State
    const [remarks, setRemarks] = useState('');
    // const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // --- Queries ---
    // 1. Fetch Student Info to get Class and Section
    const { data: studentRecord, isLoading: isStudentLoading } = useGetStudentById(studentId!);

    const { data: schoolData } = useGetSchoolById(schoolId!);
    const currentAcademicYear = schoolData?.currentAcademicYear || "";


    // Safely extract IDs whether they are populated objects or raw strings
    const classId = studentRecord?.currentClassId?._id || studentRecord?.currentClassId;
    const sectionId = studentRecord?.currentSectionId?._id || studentRecord?.currentSectionId;

    // 2. Fetch Assigned Homework for that Class/Section
    const { data: homeworkData } = useGetAllHomeworkInfinite({
        schoolId: schoolId!,
        classId: classId as string,
        sectionId: sectionId as string | null,
        academicYear: currentAcademicYear
    });

    const allHomework = useMemo(() => homeworkData?.pages.flatMap(page => page.data || []) || [], [homeworkData]);

    // 3. Fetch Student's Past Submissions (No Pagination needed for individual student context)
    const { data: submissions = [], } = useGetAllHomeworkSubmissions({
        studentId: studentId!,
    });

    // --- Mutations ---
    const submitStatusMutation = useSubmitHomeworkStatus();

    // --- Calendar Logic ---
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const offset = firstDayOfMonth(year, month);
        const days = [];

        for (let i = 0; i < offset; i++) days.push(null);
        for (let d = 1; d <= totalDays; d++) days.push(new Date(year, month, d));

        return days;
    }, [viewDate]);

    // --- Helpers ---
    const getHomeworkForDate = (date: Date) => {
        const dStr = date.toISOString().split('T')[0];
        return allHomework.find(hw => hw.homeworkDate.split('T')[0] === dStr);
    };

    const getSubmissionForSubject = (homeworkId: string, subjectId: string) => {
        return submissions.find((sub: any) => sub.homeworkId === homeworkId && sub.subjectId === subjectId);
    };

    const isPastDate = (dateToCheck: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const d = new Date(dateToCheck);
        d.setHours(0, 0, 0, 0);
        return d < today;
    };

    // --- Handlers ---
    const handleDateClick = (date: Date) => {
        setActiveDate(date);
        setSelectedSubject(null);
        setIsDetailModalOpen(true);
    };

    const handleOpenSubmitForm = (subject: any) => {
        setSelectedSubject(subject);
        setRemarks('');
        // setSelectedFiles([]);
    };

    const handleSubmitWork = async () => {
        if (!selectedSubject || !activeDayData) return;

        try {
            // Note: If your backend supports file uploads here, you will need to switch this to FormData
            await submitStatusMutation.mutateAsync({
                schoolId: schoolId!,
                homeworkId: activeDayData._id,
                subjectId: selectedSubject._id,
                studentId: studentId!,
                status: 'completed',
                remarks: remarks,
            });

            toast.success("Status Updated Successfully");
            setSelectedSubject(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to update status.");
            console.error("Failed to submit homework", error);
        }
    };

    const activeDayData = activeDate ? getHomeworkForDate(activeDate) : null;
    const isPastActiveDate = activeDate ? isPastDate(activeDate) : false;

    if (isStudentLoading) {
        return <div className="w-full h-full flex justify-center items-center text-primary"><i className="fas fa-circle-notch fa-spin text-3xl"></i></div>;
    }

    if (!studentId || !classId) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted bg-background">
                <i className="fas fa-user-graduate text-4xl mb-3"></i>
                <h2 className="text-xl font-bold text-foreground">Student Not Found</h2>
                <p>Please ensure you accessed this page from a valid student profile.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-background overflow-hidden">

            {/* COMPACT HEADER */}
            <header className="shrink-0 px-6 py-4 border-b border-border flex items-center justify-between gap-4 bg-surface z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shadow-sm">
                        <i className="fas fa-user-graduate text-lg"></i>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground leading-tight">My Homework</h1>
                        <p className="text-[11px] text-muted font-medium uppercase tracking-wider">
                            {studentRecord?.studentName || "Student"} • {studentRecord?.currentClassId?.name} • {studentRecord?.currentSectionId?.name}
                        </p>
                    </div>
                </div>
            </header>

            {/* CALENDAR VIEW */}
            <main className="flex-1 overflow-y-auto p-6 bg-background custom-scrollbar">
                <div className="max-w-5xl mx-auto flex flex-col bg-surface border border-border rounded-2xl shadow-sm overflow-hidden animate-in fade-in">

                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-header">
                        <h2 className="text-xl font-bold text-foreground">
                            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="bg-surface border-border text-foreground hover:bg-header/20" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))}>
                                <i className="fas fa-chevron-left text-xs"></i>
                            </Button>
                            <Button variant="outline" size="sm" className="bg-surface border-border text-foreground hover:bg-header/20" onClick={() => setViewDate(new Date())}>Today</Button>
                            <Button variant="outline" size="sm" className="bg-surface border-border text-foreground hover:bg-header/20" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))}>
                                <i className="fas fa-chevron-right text-xs"></i>
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-7 text-center">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="py-3 text-[10px] font-bold uppercase tracking-widest text-muted border-b border-border bg-sub-header">
                                {d}
                            </div>
                        ))}

                        {calendarDays.map((date, idx) => {
                            const hw = date ? getHomeworkForDate(date) : null;
                            const isToday = date?.toDateString() === new Date().toDateString();

                            return (
                                <div
                                    key={idx}
                                    onClick={() => date && handleDateClick(date)}
                                    className={`min-h-[100px] border-b border-r border-border p-2 transition-all group 
                                        ${!date ? 'bg-primary-soft/40 cursor-default' : 'bg-surface hover:bg-primary-soft/30 cursor-pointer'}
                                        ${isToday ? 'bg-primary/5 ring-1 ring-inset ring-primary/30' : ''}`}
                                >
                                    {date && (
                                        <div className="flex flex-col h-full">
                                            <span className={`text-sm font-bold self-end w-7 h-7 flex items-center justify-center rounded-full transition-colors
                                                ${isToday ? 'bg-primary text-white shadow-md' : 'text-foreground group-hover:text-primary'}`}>
                                                {date.getDate()}
                                            </span>

                                            {hw && hw.subjects?.length > 0 && (
                                                <div className="mt-auto flex flex-col gap-1 items-start w-full">
                                                    <span className="text-[9px] font-bold text-primary bg-primary-soft px-1.5 py-0.5 rounded uppercase w-full truncate text-left">
                                                        {hw.subjects.length} Tasks
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* SIDE MODAL: VIEW & SUBMIT */}
            <SideModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title={activeDate ? activeDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) : 'Homework Details'}
            >
                <div className="flex flex-col h-full pr-2">
                    {!selectedSubject ? (
                        /* SUBJECT LIST VIEW */
                        <div className="flex flex-col h-full space-y-4 flex-1 overflow-y-auto custom-scrollbar pb-6">
                            {activeDayData && activeDayData.subjects.length > 0 ? (
                                activeDayData.subjects.map((sub: any) => {
                                    const submission = getSubmissionForSubject(activeDayData._id, sub._id);

                                    return (
                                        <div key={sub._id} className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-foreground">{sub.subjectName}</h4>

                                                {submission ? (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-success bg-success/10 px-2 py-0.5 rounded flex items-center gap-1 border border-success/20">
                                                        <i className="fas fa-check-circle"></i> Completed
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-warning bg-warning/10 px-2 py-0.5 rounded flex items-center gap-1 border border-warning/20">
                                                        <i className="fas fa-clock"></i> Pending
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-sm text-muted whitespace-pre-wrap">{sub.description}</p>

                                            {/* Action Area */}
                                            <div className="pt-3 border-t border-border mt-1 flex justify-between items-center">
                                                <div className="flex gap-2">
                                                    {sub.attachments?.map((file: any) => (
                                                        <a key={file._id} href={file.url} target="_blank" rel="noreferrer" className="text-[10px] text-primary border border-border px-2 py-1 rounded hover:bg-primary-soft">
                                                            <i className="fas fa-paperclip mr-1"></i> {file.originalName}
                                                        </a>
                                                    ))}
                                                </div>

                                                {(canModify && !submission && !isPastActiveDate) && (
                                                    <Button variant="outline" size="sm" onClick={() => handleOpenSubmitForm(sub)}>
                                                        Submit Work
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-muted bg-surface rounded-xl border border-dashed border-border">
                                    <i className="fas fa-glass-cheers text-4xl mb-3 opacity-50"></i>
                                    <p className="font-medium text-sm">No homework assigned today!</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* SUBMISSION FORM VIEW */
                        <div className="flex flex-col h-full space-y-5">
                            <button onClick={() => setSelectedSubject(null)} className="text-xs font-bold text-primary flex items-center gap-2 hover:underline w-fit">
                                <i className="fas fa-arrow-left"></i> Back to Subjects
                            </button>

                            <div className="bg-primary-soft/30 p-4 rounded-lg border border-border">
                                <h3 className="font-bold text-foreground text-sm">{selectedSubject.subjectName}</h3>
                                <p className="text-xs text-muted mt-1">{selectedSubject.description}</p>
                            </div>

                            <div className="space-y-4 flex-1">
                                <div className="flex flex-col gap-1.5">
                                    <Label>My Notes / Remarks</Label>
                                    <textarea
                                        className="w-full bg-surface border border-border rounded-lg p-3 text-sm focus:border-primary outline-none min-h-[120px] custom-scrollbar"
                                        placeholder="Add any notes for the teacher..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    />
                                </div>

                                {/* <div className="flex flex-col gap-1.5">
                                    <Label>Upload Work (Proof)</Label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf"
                                        className="block w-full text-xs text-muted file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-primary-soft file:text-primary font-bold cursor-pointer"
                                        onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                                    />
                                </div> */}
                            </div>

                            {canModify && <div className="pt-4 border-t border-border flex justify-end gap-3 bg-surface shrink-0">
                                <Button variant="outline" onClick={() => setSelectedSubject(null)}>Cancel</Button>
                                <Button
                                    variant="primary"
                                    leftIcon="fas fa-check"
                                    onClick={handleSubmitWork}
                                    isLoading={submitStatusMutation.isPending}
                                >
                                    Mark as Complete
                                </Button>
                            </div>}
                        </div>
                    )}
                </div>
            </SideModal>
        </div>
    );
}