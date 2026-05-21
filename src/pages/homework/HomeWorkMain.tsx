
import { useState, useMemo, useEffect } from 'react';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetAllClassesWithSections, type ClassWithSections } from '../../api_services/teacher_api/teacherApi';
import {
    useGetAllHomeworkInfinite,
    useCreateHomework,
    useDeleteSubjectFromHomework
} from '../../api_services/homework_api/homeWorkApi';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { Button } from '../../shared/ui/Button';
import { Input, Label } from '../../shared/ui/Input';
import { SideModal } from '../../shared/ui/SideModal';
import { useGetSchoolById } from '../../api_services/schoolConfig_api/schoolapi';
import { getAcademicYears } from '../../utils/utils';
import { useGetAllHomeworkSubmissions } from '../../api_services/homework_api/homeWorksubmissionApi';
import { toast } from '../../shared/ui/ToastContext';



export default function HomeworkMain() {
    const { schoolId } = useAuthData();
    const { data: schoolData } = useGetSchoolById(schoolId!);
    const fetchedAcademicYear = schoolData?.currentAcademicYear || "";

    // --- State: Selections ---
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');
    const [viewDate, setViewDate] = useState(new Date()); // Current month in view

    // Set initial academic year once loaded
    useEffect(() => {
        if (fetchedAcademicYear && !selectedAcademicYear) {
            setSelectedAcademicYear(fetchedAcademicYear);
        }
    }, [fetchedAcademicYear, selectedAcademicYear]);


    // Helper to check if a date is strictly before today
    const isPastDate = (dateToCheck: Date | string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate day comparison
        const d = new Date(dateToCheck);
        d.setHours(0, 0, 0, 0);
        return d < today;
    };



    // --- State: Modals & Detail View ---
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [submissionViewSubject, setSubmissionViewSubject] = useState<any | null>(null);
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [activeDate, setActiveDate] = useState<Date | null>(null);


    // --- State: Form ---
    const [formState, setFormState] = useState({ subjectName: '', description: '' });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // --- Queries ---
    const { data: classesData } = useGetAllClassesWithSections({ schoolId: schoolId! });
    const classes: ClassWithSections[] = classesData || [];
    const selectedClass = classes.find(c => c._id === selectedClassId);



    const { data: homeworkData, isLoading: isLoadingHw } = useGetAllHomeworkInfinite({
        schoolId: schoolId!,
        academicYear: selectedAcademicYear, // Added filter
        classId: selectedClassId,
        sectionId: selectedSectionId || null,
    });




    const allHomework = useMemo(() => homeworkData?.pages.flatMap(page => page.data || []) || [], [homeworkData]);


    const getHomeworkForDate = (date: Date) => {
        const dStr = date.toISOString().split('T')[0];
        return allHomework.find(hw => hw.homeworkDate.split('T')[0] === dStr);
    };


    const activeDayData = activeDate ? getHomeworkForDate(activeDate) : null;
    const academicYearOptions = useMemo(() => getAcademicYears(), []);

    const isPastActiveDate = activeDate ? isPastDate(activeDate) : false;



    // 3. Add this hook to fetch the submissions for the selected day/subject
    const { data: subjectSubmissions = [], isLoading: isLoadingSubmissions } = useGetAllHomeworkSubmissions({
        homeworkId: activeDayData?._id,
        subjectId: submissionViewSubject?._id,
        // Only fetch when a subject is actually clicked
    });



    // --- Mutations ---
    const createMutation = useCreateHomework();
    const deleteMutation = useDeleteSubjectFromHomework();

    // --- Calendar Logic ---
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const offset = firstDayOfMonth(year, month);
        const days = [];

        // Padding for previous month
        for (let i = 0; i < offset; i++) days.push(null);
        // Current month days
        for (let d = 1; d <= totalDays; d++) days.push(new Date(year, month, d));

        return days;
    }, [viewDate]);



    // --- Handlers ---
    const handleDateClick = (date: Date) => {
        setActiveDate(date);
        setIsCreateMode(false);
        setSubmissionViewSubject(null); // <-- Add this
        setIsDetailModalOpen(true);
    };

    const handleCreateSubmit = async () => {
        try {
            if (!activeDate || !formState.subjectName || !formState.description) return;
            const formData = new FormData();
            formData.append('schoolId', schoolId!);
            formData.append('academicYear', selectedAcademicYear); // Use selected year
            formData.append('classId', selectedClassId);
            if (selectedSectionId) formData.append('sectionId', selectedSectionId);
            formData.append('homeworkDate', activeDate.toISOString());
            formData.append('subjectName', formState.subjectName);
            formData.append('description', formState.description);
            selectedFiles.forEach(file => formData.append('files', file));

            await createMutation.mutateAsync(formData);
            setIsCreateMode(false);
            setFormState({ subjectName: '', description: '' });
            setSelectedFiles([]);
            toast.success("Successfully Created");
        }
        catch (error: any) {
            toast.error(error.message || "Failed to Create.");
        }

    };



    const handleDeleteSubject = async ({ homeworkId, subjectId }: { homeworkId: string, subjectId: string }) => {

        
        if (window.confirm("Are you sure you want to delete this? This action cannot be undone.")) {
            try {
                deleteMutation.mutateAsync({ homeworkId: homeworkId, subjectId: subjectId })
                toast.success("Successfully Deleted");

            } catch (error: any) {
                toast.error(error.message || "Failed to Delete.");
                console.error("Failed to delete expense", error);
            }
        }
    };


    return (
        // Changed wrapper to bg-mainBg to provide contrast against the white calendar surface
        <div className="w-full h-full flex flex-col bg-mainBg overflow-hidden">

            {/* RESPONSIVE HEADER */}
            <header className="shrink-0 px-4 md:px-6 py-4 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shadow-sm border border-primary/10">
                        <i className="fas fa-calendar-check text-lg"></i>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground leading-tight">Homework Calendar</h1>
                        <p className="text-[11px] text-muted font-medium uppercase tracking-wider">Manage Assignments</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <div className="w-[130px] md:w-[150px]">
                        <SearchSelect
                            placeholder="Academic Year"
                            options={academicYearOptions}
                            value={selectedAcademicYear}
                            onChange={(opt: any) => setSelectedAcademicYear(opt?.value)}
                        />
                    </div>
                    <div className="w-[130px] md:w-[150px]">
                        <SearchSelect
                            placeholder="Class"
                            options={classes.map(c => ({ label: c.name, value: c._id }))}
                            value={selectedClassId}
                            onChange={(opt: any) => { setSelectedClassId(opt?.value); setSelectedSectionId(''); }}
                        />
                    </div>
                    {selectedClass?.hasSections && (
                        <div className="w-[130px] md:w-[150px] animate-in fade-in">
                            <SearchSelect
                                placeholder="Section"
                                options={selectedClass.sections.map(s => ({ label: s.name, value: s._id }))}
                                value={selectedSectionId}
                                onChange={(opt: any) => setSelectedSectionId(opt?.value)}
                            />
                        </div>
                    )}
                </div>
            </header>

            {/* CALENDAR VIEW */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                {!selectedClassId ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted h-full">
                        <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center mb-4 shadow-sm">
                            <i className="fas fa-chalkboard text-3xl opacity-50"></i>
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Select a Class</h2>
                        <p className="text-sm mt-2 text-center max-w-md">
                            Please select an academic year and class to view or assign homework.
                        </p>
                    </div>
                ) : (
                    <div className="max-w-full mx-auto flex flex-col bg-surface border border-border rounded-2xl shadow-sm overflow-hidden animate-in fade-in">

                        {/* Calendar Month Switcher (Using primary-soft for subtle contrast) */}
                        {/* 1. Calendar Month Switcher */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-header">
                            <h2 className="text-lg md:text-xl font-bold text-foreground">
                                {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h2>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="bg-surface border-border text-foreground hover:bg-header/20" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))}>
                                    <i className="fas fa-chevron-left text-xs"></i>
                                </Button>
                                <Button variant="outline" size="sm" className="bg-surface border-border text-foreground hover::bg-header/20" onClick={() => setViewDate(new Date())}>Today</Button>
                                <Button variant="outline" size="sm" className="bg-surface border-border text-foreground hover::bg-header/20" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))}>
                                    <i className="fas fa-chevron-right text-xs"></i>
                                </Button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="flex-1 grid grid-cols-7 text-center">
                            {/* Days of the week header */}
                            {/* 2. Days of the week header */}
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-widest bg-sub-header text-foreground border-b border-border">
                                    {d}
                                </div>
                            ))}

                            {/* Calendar Cells */}
                            {calendarDays.map((date, idx) => {
                                const hw = date ? getHomeworkForDate(date) : null;
                                const isToday = date?.toDateString() === new Date().toDateString();

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => date && handleDateClick(date)}
                                        // The trick here is using bg-background for empty days, and bg-surface for active days
                                        className={`min-h-[90px] md:min-h-[120px] border-b border-r border-border p-2 transition-all group 
                                            ${!date ? 'bg-primary-soft/40 cursor-default' : 'bg-surface hover:bg-primary-soft/30 cursor-pointer'}
                                            ${isToday ? 'bg-primary/5 ring-1 ring-inset ring-primary/30' : ''}`}
                                    >
                                        {date && (
                                            <div className="flex flex-col h-full relative">
                                                <span className={`text-xs md:text-sm font-bold self-end w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full transition-colors
                                                    ${isToday ? 'bg-primary text-inverse shadow-sm' : 'text-foreground group-hover:text-primary'}`}>
                                                    {date.getDate()}
                                                </span>

                                                {/* Homework Indicators */}
                                                {hw && hw.subjects?.length > 0 && (
                                                    <div className="mt-auto flex flex-col gap-1 md:gap-1.5 items-center md:items-start w-full">
                                                        <div className="flex flex-wrap gap-1 justify-center md:justify-start">
                                                            {hw.subjects.slice(0, 4).map((_s: any, i: number) => (
                                                                <div key={i} className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-primary shadow-sm" />
                                                            ))}
                                                            {hw.subjects.length > 4 && <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-muted shadow-sm" />}
                                                        </div>
                                                        <span className="hidden md:inline-block text-[9px] font-bold text-primary bg-primary-soft px-1.5 py-0.5 rounded border border-primary/10 w-full truncate text-left">
                                                            {hw.subjects.length} Subject{hw.subjects.length > 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                )}
                                                {isLoadingHw && isToday && <i className="fas fa-spinner fa-spin absolute bottom-2 left-2 text-primary/50 text-xs"></i>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>

            {/* SIDE MODAL: VIEW / CREATE */}
            <SideModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title={activeDate ? activeDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) : 'Homework'}
            >
                <div className="flex flex-col h-full">

                    {submissionViewSubject ? (

                        /* ========================================= */
                        /* MODE 3: SUBMISSIONS VIEW FOR A SUBJECT    */
                        /* ========================================= */
                        <div className="flex flex-col h-full space-y-4">
                            <button onClick={() => setSubmissionViewSubject(null)} className="text-xs font-bold text-primary flex items-center gap-2 hover:bg-primary-soft w-fit px-2 py-1 rounded transition-colors -ml-2">
                                <i className="fas fa-arrow-left"></i> Back to Agenda
                            </button>

                            <div className="bg-primary-soft/30 p-3 rounded-lg border border-border">
                                <h3 className="font-bold text-foreground text-sm">{submissionViewSubject.subjectName} Submissions</h3>
                                <p className="text-xs text-muted mt-0.5">Tracking student progress for this assignment.</p>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                                {isLoadingSubmissions ? (
                                    <div className="flex justify-center py-10"><i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i></div>
                                ) : subjectSubmissions.length === 0 ? (
                                    <div className="text-center py-10 text-muted border border-dashed border-border rounded-xl bg-surface">
                                        <i className="fas fa-inbox text-3xl opacity-50 mb-2"></i>
                                        <p className="text-sm">No submissions yet for this subject.</p>
                                    </div>
                                ) : (
                                    subjectSubmissions.map((sub: any) => (
                                        <div key={sub._id} className="bg-surface border border-border rounded-lg p-3 flex flex-col gap-2 shadow-sm">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-sm text-foreground">{sub.studentId?.studentName || 'Unknown Student'}</p>
                                                    <p className="text-[10px] text-muted">ID: {sub.studentId?._id || sub.studentId}</p>
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${sub.status === 'completed' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'
                                                    }`}>
                                                    {sub.status}
                                                </span>
                                            </div>

                                            {sub.remarks && (
                                                <div className="bg-background p-2 rounded text-xs text-muted italic border border-border">
                                                    "{sub.remarks}"
                                                </div>
                                            )}

                                            {sub.studentAttachments?.length > 0 && (
                                                <div className="flex gap-2 mt-1">
                                                    {sub.studentAttachments.map((file: any) => (
                                                        <a key={file._id} href={file.url} target="_blank" rel="noreferrer" className="text-[10px] text-primary bg-primary-soft border border-primary/10 px-2 py-1 rounded hover:bg-primary/20">
                                                            <i className="fas fa-paperclip"></i> {file.originalName}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    ) :
                        !isCreateMode ? (
                            /* VIEW MODE */
                            <div className="flex flex-col h-full space-y-6 flex-1 overflow-y-auto custom-scrollbar pb-6 pr-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-background border border-border p-4 rounded-xl shadow-sm gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Class Agenda</p>
                                        <h3 className="text-base font-bold text-foreground">
                                            {selectedClass?.name} {selectedSectionId ? `- Section ${classes.find(c => c._id === selectedClassId)?.sections.find(s => s._id === selectedSectionId)?.name}` : ''}
                                        </h3>
                                    </div>
                                    {!isPastActiveDate && (<Button variant="primary" size="sm" leftIcon="fas fa-plus" onClick={() => setIsCreateMode(true)} className="whitespace-nowrap">
                                        Add Subject
                                    </Button>
                                    )}
                                </div>

                                {activeDayData && activeDayData.subjects.length > 0 ? (
                                    <div className="space-y-4">
                                        {activeDayData.subjects.map((sub: any) => (
                                            <div key={sub._id} className="bg-surface border border-border rounded-xl p-4 shadow-sm relative group overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-foreground text-sm">{sub.subjectName}</h4>

                                                    <div className="flex gap-2 items-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-xs bg-primary-soft text-primary h-6 px-2"
                                                            onClick={() => setSubmissionViewSubject(sub)}
                                                        >
                                                            View Submissions
                                                        </Button>

                                                        {!isPastActiveDate && (
                                                            <button
                                                                className="w-6 h-6 flex items-center justify-center rounded bg-danger/10 text-danger opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger hover:text-inverse"
                                                                // onClick={() => deleteMutation.mutate({ homeworkId: activeDayData._id, subjectId: sub._id })}
                                                                onClick={() => handleDeleteSubject({ homeworkId: activeDayData._id, subjectId: sub._id })}
                                                                title="Delete Subject"
                                                            >
                                                                <i className="fas fa-trash-alt text-[10px]"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted leading-relaxed mb-3 whitespace-pre-wrap">{sub.description}</p>

                                                {sub.attachments?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 pt-3 border-t border-border mt-3">
                                                        {sub.attachments.map((file: any) => (
                                                            <a key={file._id} href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-2 py-1 bg-background rounded text-[10px] font-medium text-primary border border-border hover:bg-primary-soft transition-colors">
                                                                <i className={`fas ${file.type === 'pdf' ? 'fa-file-pdf text-danger' : 'fa-image'}`}></i>
                                                                <span className="truncate max-w-[120px]">{file.originalName}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center py-20 bg-background rounded-2xl border border-dashed border-border">
                                        <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mb-3 shadow-sm text-muted">
                                            <i className="fas fa-clipboard-check text-xl"></i>
                                        </div>
                                        <p className="text-sm font-bold text-foreground">No Homework Today</p>
                                        <p className="text-xs text-muted mt-1 text-center px-4">Students have no assignments logged for this date.</p>
                                        {!isPastActiveDate && (
                                            <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsCreateMode(true)}>Assign Now</Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* CREATE MODE */
                            <div className="flex flex-col h-full space-y-5">
                                <button onClick={() => setIsCreateMode(false)} className="text-xs font-bold text-primary flex items-center gap-2 hover:bg-primary-soft w-fit px-2 py-1 rounded transition-colors -ml-2">
                                    <i className="fas fa-arrow-left"></i> Back to View
                                </button>

                                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <Input label="Subject Name" placeholder="e.g. Mathematics" value={formState.subjectName} onChange={(e) => setFormState({ ...formState, subjectName: e.target.value })} required />

                                    <div className="space-y-1.5 flex flex-col h-[200px]">
                                        <Label>Description / Instructions</Label>
                                        <textarea
                                            className="w-full flex-1 bg-background border border-border rounded-lg p-3 text-sm focus:border-primary outline-none custom-scrollbar resize-none"
                                            placeholder="Enter homework details here..."
                                            value={formState.description}
                                            onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5 border-t border-border pt-4">
                                        <Label>Upload Attachments (Optional)</Label>
                                        <input type="file" multiple accept="image/*,.pdf" className="block w-full text-xs text-muted file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-primary-soft file:text-primary font-bold cursor-pointer hover:file:bg-primary/20 transition-colors" onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} />

                                        {selectedFiles.length > 0 && (
                                            <div className="mt-2 flex flex-col gap-1.5 bg-background p-2 rounded border border-border">
                                                {selectedFiles.map((f, i) => (
                                                    <div key={i} className="flex items-center text-[10px] text-foreground font-medium">
                                                        <i className="fas fa-paperclip text-muted mr-2"></i> {f.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border flex justify-end gap-3 bg-surface shrink-0">
                                    <Button variant="outline" onClick={() => setIsCreateMode(false)}>Cancel</Button>
                                    <Button variant="primary" leftIcon="fas fa-paper-plane" onClick={handleCreateSubmit} disabled={!formState.subjectName || !formState.description} isLoading={createMutation.isPending}>Assign</Button>
                                </div>
                            </div>
                        )}
                </div>
            </SideModal>
        </div>
    );
}