import React, { useState, useEffect } from 'react';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetSchoolById } from '../../api_services/schoolConfig_api/schoolapi';
import { useCreateCalendarEvent, useDeleteCalendarEvent, useGetAllCalendarEvents, useUpdateCalendarEvent } from '../../api_services/academicCalendar_api/academicCalendarApi';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { SideModal } from '../../shared/ui/SideModal';
import { toast } from '../../shared/ui/ToastContext';

interface CalendarFilters {
    schoolId: string;
    academicYear: string;
    month: string;
    type: string;
}

const MONTHS = [
    { label: "January", value: "1" },
    { label: "February", value: "2" },
    { label: "March", value: "3" },
    { label: "April", value: "4" },
    { label: "May", value: "5" },
    { label: "June", value: "6" },
    { label: "July", value: "7" },
    { label: "August", value: "8" },
    { label: "September", value: "9" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" }
];

const EVENT_TYPES = [
    { label: "All Types", value: "" },
    { label: "Holiday", value: "holiday" },
    { label: "Exam", value: "exam" },
    { label: "Event", value: "event" },
    { label: "Special Occasion", value: "special_occasion" }
];

export const AcademicCalendar: React.FC = () => {
    const { schoolId, currentRole } = useAuthData();
    const { data: schoolData } = useGetSchoolById(schoolId!);

    const currentMonthNumber = String(new Date().getMonth() + 1);

    const [filters, setFilters] = useState<CalendarFilters>({
        schoolId: schoolId || '',
        academicYear: '',
        month: currentMonthNumber,
        type: ''
    });

    const [searchQuery, setSearchQuery] = useState('');

    // SideModal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false); // 🌟 Toggles between view/create mode
    const [editingEventId, setEditingEventId] = useState<string | null>(null); // 🌟 Tracks if we are updating

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        type: ''
    });

    // Sync academic year
    useEffect(() => {
        if (schoolData) {
            setFilters((prev) => ({
                ...prev,
                schoolId: schoolId || '',
                academicYear: schoolData?.currentAcademicYear || "2025-2026"
            }));
        }
    }, [schoolData, schoolId]);

    const { data: events = [], isLoading } = useGetAllCalendarEvents({
        schoolId: filters.schoolId,
        academicYear: filters.academicYear,
        month: filters.month,
        type: filters.type
    });


    const createMutation = useCreateCalendarEvent();
    const updateMutation = useUpdateCalendarEvent();
    const deleteMutation = useDeleteCalendarEvent();



    // Helper to check if a date falls within an event's start/end dates
    const isDateInRange = (cellDateStr: string, startStr: string, endStr: string) => {
        const cellDate = new Date(cellDateStr).setHours(0, 0, 0, 0);
        const startDate = new Date(startStr).setHours(0, 0, 0, 0);
        const endDate = new Date(endStr).setHours(0, 0, 0, 0);
        return cellDate >= startDate && cellDate <= endDate;
    };

    const filteredEvents = events.filter((evt: any) =>
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (evt.description && evt.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getDaysInMonthGrid = () => {
        // if (!filters.academicYear || !filters.month) return [];
        if (!filters.academicYear) return [];

        const monthNum = filters.month ? parseInt(filters.month, 10) : (new Date().getMonth() + 1);
        const baseYear = parseInt(filters.academicYear.split('-')[0], 10);
        // const monthNum = parseInt(filters.month, 10);
        const targetYear = monthNum < 6 ? baseYear + 1 : baseYear;

        const firstDayIndex = new Date(targetYear, monthNum - 1, 1).getDay();
        const totalDays = new Date(targetYear, monthNum, 0).getDate();

        const gridCells = [];
        for (let i = 0; i < firstDayIndex; i++) gridCells.push({ day: null, dateStr: null });
        for (let d = 1; d <= totalDays; d++) {
            // Adjust to local date string cleanly
            const date = new Date(targetYear, monthNum - 1, d);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            gridCells.push({ day: d, dateStr });
        }
        return gridCells;
    };

    const calendarGrid = getDaysInMonthGrid();
    const canModify = ["correspondent", "administrator"].includes(currentRole as string);

    // Styling generator for event pills
    const getEventStyle = (type: string) => {
        switch (type) {
            case 'holiday': return 'bg-success/10 text-success border-success/20';
            case 'exam': return 'bg-danger/10 text-danger border-danger/20';
            case 'event': return 'bg-primary/10 text-primary border-primary/20';
            default: return 'bg-warning/10 text-warning border-warning/20';
        }
    };

    // Triggered when clicking a specific calendar grid box
    const handleCellClick = (dateStr: string | null) => {
        if (!dateStr) return;
        setSelectedDateStr(dateStr);
        setIsCreating(false); // Open in view mode first
        setIsModalOpen(true);
    };


    // 🌟 Unified handler to open the create form
    const handleOpenCreateForm = (dateStr: string | null = null) => {
        setSelectedDateStr(dateStr);
        setIsCreating(true);
        setFormData({
            title: '',
            description: '',
            startDate: dateStr || '',
            endDate: dateStr || '',
            type: ''
        });
        setIsModalOpen(true);
    };


    // 🌟 Unified handler for both Creating and Editing
    const handleOpenForm = (dateStr: string | null = null, existingEvent: any = null) => {
        setSelectedDateStr(dateStr || (existingEvent ? existingEvent.startDate.split('T')[0] : null));
        setIsCreating(true);

        if (existingEvent) {
            setEditingEventId(existingEvent._id);
            setFormData({
                title: existingEvent.title,
                description: existingEvent.description || '',
                startDate: existingEvent.startDate.split('T')[0],
                endDate: existingEvent.endDate.split('T')[0],
                type: existingEvent.type
            });
        } else {
            setEditingEventId(null);
            setFormData({
                title: '',
                description: '',
                startDate: dateStr || '',
                endDate: dateStr || '',
                type: ''
            });
        }
        setIsModalOpen(true);
    };

    // 🌟 Handle Submit (Create or Update)
    const handleSubmitEvent = async (e: React.FormEvent) => {
        e.preventDefault();

        // 🌟 Manual validation for the custom SearchSelect
        if (!formData.type) {
            toast.error("Please select an Event Type.");
            return;
        }

        try {
            if (editingEventId) {
                // UPDATE Logic
                await updateMutation.mutateAsync({
                    id: editingEventId,
                    updateData: {
                        ...formData,
                        academicYear: filters.academicYear
                    }
                });
                toast.success("Calendar event updated!");
            } else {
                // CREATE Logic
                await createMutation.mutateAsync({
                    ...formData,
                    schoolId: schoolId!,
                    academicYear: filters.academicYear,
                } as any);
                toast.success("New event added to calendar!");
            }

            // Close form and return to view mode
            setIsCreating(false);
            setEditingEventId(null);
        } catch (err: any) {
            toast.error(err.message || "Failed to save event.");
        }
    };

    // 🌟 Handle Delete
    const handleDeleteEvent = async (eventId: string) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;

        try {
            await deleteMutation.mutateAsync(eventId);
            toast.success("Event removed successfully.");
        } catch (err: any) {
            toast.error(err.message || "Failed to delete event.");
        }
    };

    // Get events specifically for the opened modal date
    const selectedDateEvents = selectedDateStr
        ? filteredEvents.filter((e: any) => isDateInRange(selectedDateStr, e.startDate, e.endDate))
        : [];

    return (
        <div className="h-full flex flex-col p-4 bg-background">

            {/* 🌟 SLEEK HEADER: Title + All Filters aligned to the right */}
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4 pb-4 border-b border-border shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <i className="fas fa-calendar-alt text-primary"></i> Academic Calendar
                    </h1>
                    <p className="text-xs text-muted font-medium mt-1">
                        Active Session: <span className="text-primary">{filters.academicYear || "Syncing..."}</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="w-full sm:w-48">
                        <Input
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 text-sm"
                        />
                    </div>

                    {/* Wrapped SearchSelect to control width without className prop */}
                    <div className="w-full sm:w-36">
                        <SearchSelect
                            options={MONTHS}
                            value={filters.month}
                            onChange={(val) => setFilters(prev => ({ ...prev, month: String(val.value) }))}
                            isClearable={false}
                            placeholder="Month"
                        />
                    </div>

                    <div className="w-full sm:w-40">
                        <SearchSelect
                            options={EVENT_TYPES}
                            value={filters.type}
                            onChange={(val) => setFilters(prev => ({ ...prev, type: String(val.value) }))}
                            placeholder="Filter Type"
                        />
                    </div>

                    {canModify && (
                        <Button variant="primary" size="sm" className="h-9 shrink-0" onClick={() => handleOpenCreateForm(null)}>
                            <i className="fas fa-plus mr-1.5"></i> Add Event
                        </Button>
                    )}
                </div>
            </header>

            {/* 🌟 FLUID CALENDAR GRID (No scrolling required on laptops) */}
            <div className="flex-1 flex flex-col bg-surface rounded-xl border border-border shadow-sm overflow-hidden">

                {/* Days of Week Header */}
                <div className="grid grid-cols-7 border-b border-border bg-background/50 shrink-0">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                        <div key={day} className="py-2 text-center text-[11px] font-bold uppercase tracking-wider text-muted border-r border-border last:border-r-0">
                            {day.substring(0, 3)}
                        </div>
                    ))}
                </div>

                {/* Calendar Body: Auto-stretches to fill remaining space */}
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center text-muted">
                        <i className="fas fa-spinner fa-spin text-2xl"></i>
                    </div>
                ) : (
                        <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-border gap-[1px]">
                            {calendarGrid?.map((cell, idx) => {
                                const dayEvents = cell.dateStr
                                    ? filteredEvents.filter((e: any) => isDateInRange(cell.dateStr!, e.startDate, e.endDate))
                                    : [];

                                const isToday = cell.dateStr === new Date().toISOString().split('T')[0];

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleCellClick(cell.dateStr)}
                                        className={`bg-surface p-1.5 flex flex-col transition-colors overflow-hidden group ${cell.day ? 'cursor-pointer hover:bg-background/80' : 'bg-background/40'
                                            }`}
                                    >
                                        {cell.day && (
                                            <>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground shadow-md' : 'text-foreground group-hover:text-primary'
                                                        }`}>
                                                        {cell.day}
                                                    </span>
                                                </div>

                                                {/* Event Pills */}
                                                <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                                                    {dayEvents.slice(0, 1).map((evt: any) => (
                                                        <div
                                                            key={`${evt._id}-${idx}`}
                                                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border truncate ${getEventStyle(evt.type)}`}
                                                        >
                                                            {evt.title}
                                                        </div>
                                                    ))}
                                                    {dayEvents.length > 1 && (
                                                        <span className="text-[9px] font-medium text-muted pl-1">
                                                            +{dayEvents.length - 1} more
                                                        </span>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                )}
            </div>

            {/* 🌟 ZOHO-STYLE SIDE MODAL with Create/View Toggle */}
            <SideModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setTimeout(() => setIsCreating(false), 300); // Reset after closing animation
                }}
                title={
                    isCreating
                        ? "Create New Event"
                        : selectedDateStr
                            ? `Schedule: ${new Date(selectedDateStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`
                            : "Calendar Event"
                }
                actions={
                    // Show "Back" button if creating from a selected date, else show "Add" if viewing
                    isCreating && selectedDateStr ? (
                        <Button variant="outline" size="sm" onClick={() => setIsCreating(false)}>
                            <i className="fas fa-arrow-left text-[10px] mr-1"></i> Back
                        </Button>
                    ) : !isCreating && canModify && selectedDateStr ? (
                        <Button variant="outline" size="sm" onClick={() => handleOpenCreateForm(selectedDateStr)}>
                            <i className="fas fa-plus text-[10px] mr-1"></i> Add
                        </Button>
                    ) : null
                }
            >
                {isCreating ? (
                    /* --- CREATE FORM UI --- */
                    <form onSubmit={handleSubmitEvent} className="flex flex-col gap-4 h-full">
                        <div>
                            {/* <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Event Title *</label> */}
                            <Input
                                label='Event Title'
                                required
                                placeholder="e.g., Annual Sports Day"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>

                        {/* <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Event Type *</label> */}
                        <div className="w-full">
                            <SearchSelect
                                label='Select Event *'
                                options={EVENT_TYPES}
                                value={formData.type}
                                onChange={(val) => setFormData(prev => ({ ...prev, type: String(val.value) }))}
                                placeholder="Select a classification"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                {/* <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Start Date *</label> */}
                                <Input
                                    label='Start Date'
                                    type="date"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                            </div>
                            <div>
                                {/* <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">End Date *</label> */}
                                <Input
                                    label='End Date'
                                    type="date"
                                    // required
                                    value={formData.endDate}
                                    min={formData.startDate} // Ensure end date isn't before start date
                                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-main mb-1.5 tracking-wider">Description (Optional)</label>
                            <textarea
                                className="w-full p-3 rounded-md border border-border bg-background text-sm text-foreground focus:border-primary outline-none resize-none min-h-[100px]"
                                placeholder="Add more details about this event..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>

                        <div className="mt-auto pt-6 border-t border-border flex justify-end gap-3">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => {
                                    setIsCreating(false);
                                    setEditingEventId(null);
                                }}
                                disabled={createMutation.isPending || updateMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                isLoading={createMutation.isPending || updateMutation.isPending} // 🌟 Utilizing your custom prop
                                disabled={createMutation.isPending || updateMutation.isPending}
                            >
                                {editingEventId ? "Update Event" : "Save Event"}
                            </Button>
                        </div>
                    </form>

                ) : selectedDateStr && selectedDateEvents.length > 0 ? (
                    /* --- VIEW EVENTS LIST UI --- */
                    <div className="space-y-4">
                        {selectedDateEvents.map((evt: any) => (
                            <div key={evt._id} className="p-4 rounded-xl border border-border bg-surface shadow-sm relative group">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-[14px] font-bold capitalize tracking-wider px-2 py-0.5 rounded-full border ${getEventStyle(evt.type)}`}>
                                        {evt.type.replace('_', ' ')}
                                    </span>

                                    {/* 🌟 Inline Edit & Delete actions for admins */}
                                    {canModify && (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7 text-muted hover:text-primary"
                                                onClick={() => handleOpenForm(null, evt)}
                                                title="Edit Event"
                                            >
                                                <i className="fas fa-pen text-xs"></i>
                                            </Button>

                                            {/* Delete Button */}
                                            <Button
                                                variant="danger"
                                                size="icon"
                                                className=""
                                                onClick={() => handleDeleteEvent(evt._id)}
                                                // 🌟 Leverages your custom prop tied specifically to this event's deletion instance
                                                leftIcon='fas fa-trash-alt'
                                                isLoading={deleteMutation.isPending && deleteMutation.variables === evt._id}
                                                disabled={deleteMutation.isPending}
                                                title="Delete Event"
                                            >
                                                {/* The icon only renders if isLoading is false, managed automatically by your component */}
                                                {/* <i className="  text-xs"></i> */}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <h3 className="font-bold text-base text-foreground mb-1">{evt.title}</h3>
                                {evt.description && <p className="text-sm text-muted mb-3">{evt.description}</p>}

                                {/* <div className="text-xs font-medium text-muted bg-background px-3 py-2 rounded-lg border border-border/50 flex items-center gap-2 w-max">
                                    <i className="far fa-clock"></i>
                                    {new Date(evt.startDate).toLocaleDateString()} to {new Date(evt.endDate).toLocaleDateString()}
                                </div> */}

                                <div className="text-xs font-medium text-muted bg-background px-3 py-2 rounded-lg border border-border/50 flex items-center gap-2 w-max">
                                    <i className="far fa-clock"></i>
                                    {new Date(evt?.startDate).toLocaleDateString() === new Date(evt?.endDate).toLocaleDateString() ? (
                                        // 🌟 If dates are identical, show a single date format
                                        new Date(evt?.startDate).toLocaleDateString()
                                    ) : (
                                        // 🌟 If dates are different, show the date range with "to"
                                        `${new Date(evt?.startDate).toLocaleDateString()} to ${new Date(evt?.endDate).toLocaleDateString()}`
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* --- EMPTY STATE UI --- */
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center border border-border mb-4">
                            <i className="far fa-calendar-times text-2xl text-muted"></i>
                        </div>
                        <h3 className="text-foreground font-semibold mb-1">No Events Scheduled</h3>
                        <p className="text-sm text-muted mb-6">There are no holidays or events marked for this date.</p>

                        {canModify && (
                            <Button variant="primary" onClick={() => handleOpenCreateForm(selectedDateStr)}>
                                Create Event for this Date
                            </Button>
                        )}
                    </div>
                )}
            </SideModal>

        </div>
    );
};

export default AcademicCalendar;