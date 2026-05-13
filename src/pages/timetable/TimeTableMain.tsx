

// SECOND VERSION


import { useState, useMemo } from 'react';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetAllClassesWithSections, type ClassWithSections } from '../../api_services/teacher_api/teacherApi';
import { useGetAllUsers } from '../../api_services/auth_api/authApi';
import { useAddTimeTableDay, useDeletePeriod, useDeleteTimeTableDay, useGetTimeTables, useUpsertPeriod } from '../../api_services/timeTable_api/timeTableApi';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { Button } from '../../shared/ui/Button';
import { SideModal } from '../../shared/ui/SideModal';
import { Input, Label } from '../../shared/ui/Input';

const DAYS_OF_WEEK = [
    { label: 'Monday', value: 'monday' },
    { label: 'Tuesday', value: 'tuesday' },
    { label: 'Wednesday', value: 'wednesday' },
    { label: 'Thursday', value: 'thursday' },
    { label: 'Friday', value: 'friday' },
    { label: 'Saturday', value: 'saturday' }
];

export default function TimeTableMain() {
    const { schoolId } = useAuthData();

    // --- State: Selections ---
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');
    const [dayToAdd, setDayToAdd] = useState<string>('');

    // --- State: Modals ---
    const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState<any>(null);
    const [activeDayForPeriod, setActiveDayForPeriod] = useState<{ day: string, scheduleId: string } | null>(null);

    // --- Queries ---
    const { data: classesData } = useGetAllClassesWithSections({ schoolId: schoolId! });
    const { data: teachersData } = useGetAllUsers({ role: 'teacher', schoolId: schoolId! });
    
    const classes: ClassWithSections[] = classesData || [];
    const selectedClass = classes.find(c => c._id === selectedClassId);

    const canShowTimeTable = selectedClassId && (!selectedClass?.hasSections || (selectedClass?.hasSections && selectedSectionId));

    const { data: timeTablesData, isLoading: isLoadingTimeTable } = useGetTimeTables({
        schoolId: schoolId!,
        classId: selectedClassId,
        sectionId: selectedSectionId || undefined
    });

    const activeTimeTable = timeTablesData?.[0]; 

    // --- Mutations ---
    const addDayMutation = useAddTimeTableDay();
    const deleteDayMutation = useDeleteTimeTableDay();
    const upsertPeriodMutation = useUpsertPeriod();
    const deletePeriodMutation = useDeletePeriod();

    // --- Derived Data for Grid ---
    const sortedSchedule = useMemo(() => {
        if (!activeTimeTable?.weeklySchedule) return [];
        const order = DAYS_OF_WEEK.map(d => d.value);
        const scheduleCopy = [...activeTimeTable.weeklySchedule];
        
        scheduleCopy.sort((a, b) => order.indexOf(a.day) - order.indexOf(b.day));
        scheduleCopy.forEach(day => {
            day.periods.sort((a: any, b: any) => a.periodNumber - b.periodNumber);
        });
        return scheduleCopy;
    }, [activeTimeTable]);

    const maxPeriodsCount = useMemo(() => {
        if (!sortedSchedule.length) return 0;
        return Math.max(...sortedSchedule.map(day => day.periods.length));
    }, [sortedSchedule]);

    const getPeriodTimings = (periodNum: number) => {
        for (const day of sortedSchedule) {
            const period = day.periods.find((p: any) => p.periodNumber === periodNum);
            if (period && period.startTime && period.endTime) {
                return `${period.startTime} - ${period.endTime}`;
            }
        }
        return null;
    };

    // --- Handlers ---
    const handleClassChange = (opt: any) => {
        setSelectedClassId(opt?.value || '');
        setSelectedSectionId('');
    };

    const handleAddDay = async () => {
        if (!dayToAdd || !canShowTimeTable) return;
        try {
            await addDayMutation.mutateAsync({
                schoolId: schoolId!,
                classId: selectedClassId,
                sectionId: selectedSectionId || null,
                day: dayToAdd
            });
            setDayToAdd(''); 
        } catch (error) {
            console.error("Failed to add day", error);
        }
    };

    const handleDeleteDay = async (weeklyScheduleId: string) => {
        if (!window.confirm("Are you sure you want to delete this entire day?")) return;
        try {
            await deleteDayMutation.mutateAsync({
                schoolId: schoolId!,
                classId: selectedClassId,
                sectionId: selectedSectionId || null,
                weeklyScheduleId
            });
        } catch (error) {
            console.error("Failed to delete day", error);
        }
    };

    const openAddPeriodModal = (day: string, scheduleId: string, nextPeriodNum: number) => {
        setActiveDayForPeriod({ day, scheduleId });

        let defaultStartTime = '';
        let defaultEndTime = '';

        for (const daySchedule of sortedSchedule) {
            const existingMatch = daySchedule.periods.find((p: any) => p.periodNumber === nextPeriodNum);
            if (existingMatch && (existingMatch.startTime || existingMatch.endTime)) {
                defaultStartTime = existingMatch.startTime || '';
                defaultEndTime = existingMatch.endTime || '';
                break; 
            }
        }

        setEditingPeriod({
            periodNumber: nextPeriodNum,
            subjectName: '',
            startTime: defaultStartTime, 
            endTime: defaultEndTime,     
            teacherId: '',
            roomNumber: '',
            isBreak: false
        });
        setIsPeriodModalOpen(true);
    };

    const openEditPeriodModal = (day: string, scheduleId: string, period: any) => {
        setActiveDayForPeriod({ day, scheduleId });
        setEditingPeriod({ ...period });
        setIsPeriodModalOpen(true);
    };

    const handleSavePeriod = async () => {
        if (!activeDayForPeriod || !editingPeriod) return;

        const cleanedPeriod = {
            ...editingPeriod,
            teacherId: editingPeriod.teacherId === "" ? null : editingPeriod.teacherId,
            roomNumber: editingPeriod.roomNumber === "" ? null : editingPeriod.roomNumber,
        };

        try {
            await upsertPeriodMutation.mutateAsync({
                schoolId: schoolId!,
                classId: selectedClassId,
                sectionId: selectedSectionId || null,
                weeklyScheduleId: activeDayForPeriod.scheduleId,
                periodData: cleanedPeriod
            });
            setIsPeriodModalOpen(false);
        } catch (error) {
            console.error("Failed to save period", error);
        }
    };

    const handleDeletePeriod = async () => {
        if (!activeDayForPeriod || !editingPeriod?._id) return;
        if (!window.confirm("Are you sure you want to delete this period?")) return;
        try {
            await deletePeriodMutation.mutateAsync({
                schoolId: schoolId!,
                classId: selectedClassId,
                sectionId: selectedSectionId || null,
                weeklyScheduleId: activeDayForPeriod.scheduleId,
                periodId: editingPeriod._id
            });
            setIsPeriodModalOpen(false);
        } catch (error) {
            console.error("Failed to delete period", error);
        }
    };

    const teacherOptions = (teachersData || []).map((t: any) => ({
        label: t.userName || t.name,
        value: t._id
    }));

    return (
        <div className="w-full h-full flex flex-col bg-background">
            
            <header className="shrink-0 px-6 py-5 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-surface/50 z-20">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-calendar-alt text-primary"></i>
                        Class Timetable
                    </h1>
                    <p className="text-sm text-muted mt-1">Select a class to view and manage its weekly schedule.</p>
                </div>

                {/* Selectors */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:w-64">
                        <SearchSelect
                            label="Select Class"
                            placeholder="Choose Class..."
                            options={classes.map(c => ({ label: c.name, value: c._id }))}
                            value={selectedClassId}
                            onChange={handleClassChange}
                        />
                    </div>

                    {selectedClass?.hasSections && (
                        <div className="w-full sm:w-64 animate-in fade-in">
                            <SearchSelect
                                label="Select Section"
                                placeholder="Choose Section..."
                                options={selectedClass.sections.map(s => ({ label: `Section ${s.name}`, value: s._id }))}
                                value={selectedSectionId}
                                onChange={(opt: any) => setSelectedSectionId(opt?.value || '')}
                            />
                        </div>
                    )}

                    {canShowTimeTable && (
                        <>
                            {/* <div className="hidden lg:block w-px h-6 bg-border mx-1"></div> */}

                            <div className="flex items-end gap-2 ml-auto lg:ml-0">
                                <div className="w-[140px]">
                                    <SearchSelect
                                        label="Select Day"
                                        placeholder="Add Day..."
                                        options={DAYS_OF_WEEK.filter(d => !sortedSchedule.some(s => s.day === d.value))}
                                        value={dayToAdd}
                                        onChange={(opt: any) => setDayToAdd(opt?.value || '')}
                                    />
                                </div>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="!py-2"
                                    onClick={handleAddDay}
                                    disabled={!dayToAdd || addDayMutation.isPending}
                                    isLoading={addDayMutation.isPending}
                                    leftIcon="fas fa-plus"
                                >
                                    Add
                                </Button>
                            </div>
                        </>
                    )}

                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {!canShowTimeTable ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted h-full">
                        <i className="fas fa-tasks text-4xl opacity-30 mb-3"></i>
                        <h2 className="text-lg font-bold text-foreground">Select a Class</h2>
                        <p className="text-sm mt-1">Choose a class (and section) from the top menu to view its timetable.</p>
                    </div>
                ) : isLoadingTimeTable ? (
                    <div className="flex justify-center py-20 h-full items-center"><i className="fas fa-circle-notch fa-spin text-3xl text-primary"></i></div>
                ) : sortedSchedule.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted h-full">
                        <div className="w-16 h-16 rounded-full border border-dashed border-border bg-surface flex items-center justify-center mb-3">
                            <i className="far fa-calendar text-2xl opacity-50"></i>
                        </div>
                        <p>No days added yet. Select a day in the top right to start.</p>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-4 duration-300">
                        {/* GRID TABLE REDESIGN */}
                        <div className="overflow-x-auto rounded-xl border border-border shadow-sm bg-surface">
                            <table className="w-full text-left border-collapse min-w-max">
                                <thead>
                                    <tr>
                                        {/* Day Header */}
                                        <th className="px-4 py-3 bg-primary/30 border-r border-b border-border font-bold text-primary uppercase tracking-wider text-xs w-32 sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                                            Day
                                        </th>
                                        
                                        {/* Dynamic Period Headers */}
                                        {Array.from({ length: maxPeriodsCount }).map((_, i) => {
                                            const timings = getPeriodTimings(i + 1);
                                            return (
                                                <th key={i} className="px-4 py-3 bg-primary-soft  border-r border-b border-border text-center w-[200px]">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <span className="font-bold text-foreground text-sm">Period {i + 1}</span>
                                                        {timings && (
                                                            <span className="text-[10px] text-muted font-medium mt-0.5 whitespace-nowrap">
                                                                {timings}
                                                            </span>
                                                        )}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                        
                                        {/* Actions Header */}
                                        <th className="px-4 py-3 bg-primary-soft border-b border-border text-center w-24">
                                            <span className="font-bold text-foreground uppercase tracking-wider text-xs">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedSchedule.map((daySchedule) => (
                                        <tr key={daySchedule._id} className="group">
                                            
                                            {/* Row Header: Day Name (Sticky Left) */}
                                            <td className="px-4 py-4 bg-border/20 text-foreground border-r border-b border-border font-bold  capitalize sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span>{daySchedule.day}</span>
                                                    <button 
                                                        onClick={() => handleDeleteDay(daySchedule._id!)}
                                                        className="text-danger cursor-pointer hover:text-danger hover:bg-danger/10 p-1.5 rounded-full transition-colors shrink-0"
                                                        title="Delete Day"
                                                    >
                                                        <i className="fas fa-trash-alt text-xs"></i>
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Period Matrix Cells */}
                                            {daySchedule.periods.map((period: any) => (
                                                <td 
                                                    key={period._id} 
                                                    onClick={() => openEditPeriodModal(daySchedule.day, daySchedule._id!, period)}
                                                    className={`px-4 py-3 border-r border-b border-border align-top transition-colors cursor-pointer group/cell ${
                                                        period.isBreak ? 'bg-background hover:bg-surface' : 'bg-surface hover:bg-primary/5'
                                                    }`}
                                                >
                                                    <div className="flex flex-col h-full justify-center">
                                                        {period.isBreak ? (
                                                            <div className="font-bold text-muted uppercase tracking-widest text-[11px] text-center w-full">
                                                                {period.subjectName || 'Break'}
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="font-bold text-foreground truncate text-sm flex items-center justify-between">
                                                                    {period.subjectName || 'No Subject'}
                                                                    <i className="fas fa-pen text-[10px] text-muted opacity-0 group-hover/cell:opacity-100 transition-opacity"></i>
                                                                </div>
                                                                {period.teacherId && (
                                                                    <div className="text-xs text-muted mt-1 truncate">
                                                                        {teachersData?.find((t:any) => t._id === period.teacherId)?.userName || 'Teacher Assigned'}
                                                                    </div>
                                                                )}
                                                                {period.roomNumber && (
                                                                    <div className="text-[10px] text-muted/70 mt-0.5 truncate">
                                                                        Room: {period.roomNumber}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            ))}

                                            {/* Empty Matrix Cells */}
                                            {Array.from({ length: maxPeriodsCount - daySchedule.periods.length }).map((_, i) => (
                                                <td key={`empty-${i}`} className="px-4 py-3 border-r border-b border-border bg-background/50">
                                                    {null}
                                                </td>
                                            ))}

                                            {/* Add Period Action Cell */}
                                            <td className="px-4 py-3 border-b border-border text-center align-middle bg-surface">
                                                <button 
                                                    onClick={() => openAddPeriodModal(daySchedule.day, daySchedule._id!, daySchedule.periods.length + 1)}
                                                    className="w-8 h-8 cursor-pointer rounded-full border border-dashed border-primary text-primary hover:bg-primary hover:text-surface transition-colors mx-auto flex items-center justify-center"
                                                    title="Add Period"
                                                >
                                                    <i className="fas fa-plus text-sm"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. UPSERT PERIOD MODAL */}
            {isPeriodModalOpen && editingPeriod && activeDayForPeriod && (
                <SideModal 
                    isOpen={isPeriodModalOpen} 
                    onClose={() => setIsPeriodModalOpen(false)} 
                    title={editingPeriod._id ? `Edit Period ${editingPeriod.periodNumber}` : `Add Period ${editingPeriod.periodNumber}`}
                >
                    <div className="flex flex-col h-full space-y-6">
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-lg">
                                <i className="fas fa-calendar-day"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground capitalize">{activeDayForPeriod.day}</h3>
                                <p className="text-xs text-muted font-medium">Period {editingPeriod.periodNumber}</p>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <label className="flex items-center gap-2 p-3 bg-surface border border-border rounded-lg cursor-pointer hover:bg-background transition-colors">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 accent-primary" 
                                    checked={editingPeriod.isBreak}
                                    onChange={(e) => setEditingPeriod({...editingPeriod, isBreak: e.target.checked})}
                                />
                                <span className="text-sm font-bold text-foreground">This is a Break / Recess</span>
                            </label>

                            <Input 
                                label={editingPeriod.isBreak ? "Break Name" : "Subject Name"}
                                placeholder={editingPeriod.isBreak ? "e.g., Lunch Break" : "e.g., Mathematics"}
                                value={editingPeriod.subjectName}
                                onChange={(e) => setEditingPeriod({...editingPeriod, subjectName: e.target.value})}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    label="Start Time"
                                    type="time"
                                    value={editingPeriod.startTime}
                                    onChange={(e) => setEditingPeriod({...editingPeriod, startTime: e.target.value})}
                                />
                                <Input 
                                    label="End Time"
                                    type="time"
                                    value={editingPeriod.endTime}
                                    onChange={(e) => setEditingPeriod({...editingPeriod, endTime: e.target.value})}
                                />
                            </div>

                            {!editingPeriod.isBreak && (
                                <>
                                    <div className="flex flex-col gap-1.5">
                                        <Label>Assign Teacher</Label>
                                        <SearchSelect 
                                            options={teacherOptions}
                                            value={editingPeriod.teacherId}
                                            onChange={(opt: any) => setEditingPeriod({...editingPeriod, teacherId: opt?.value || ''})}
                                            placeholder="Search Teacher..."
                                        />
                                    </div>
                                    <Input 
                                        label="Room Number"
                                        placeholder="e.g., Room 101"
                                        value={editingPeriod.roomNumber}
                                        onChange={(e) => setEditingPeriod({...editingPeriod, roomNumber: e.target.value})}
                                    />
                                </>
                            )}
                        </div>

                        <div className="shrink-0 pt-4 border-t border-border mt-auto flex justify-between gap-3 bg-surface z-10">
                            {editingPeriod._id ? (
                                <Button variant="danger" onClick={handleDeletePeriod} isLoading={deletePeriodMutation.isPending} leftIcon="fas fa-trash">
                                    Delete
                                </Button>
                            ) : <div></div>}
                            
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setIsPeriodModalOpen(false)}>Cancel</Button>
                                <Button variant="primary" onClick={handleSavePeriod} isLoading={upsertPeriodMutation.isPending} leftIcon="fas fa-save">
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </SideModal>
            )}
        </div>
    );
}

