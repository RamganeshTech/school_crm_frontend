import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
import { Button } from '../../../shared/ui/Button'; // Adjust path
import { Input } from '../../../shared/ui/Input'; // Adjust path
import { SearchSelect } from '../../../shared/ui/SearchSelect'; // Adjust path
import { SideModal } from '../../../shared/ui/SideModal'; // Adjust path

// Adjust your API hook imports based on your file structure
import { useGetClasses } from '../../../api_services/schoolConfig_api/classApi';
import { useGetSections } from '../../../api_services/schoolConfig_api/sectionApi';
// Import your mutations (replace with your actual hook names/paths)
import { useAssignStudentToClassV1, useRemoveStudentFromClassV1 } from '../../../api_services/student_api/studentRecordApi';
import { toast } from '../../../shared/ui/ToastContext';
import { Toggle } from '../../../shared/ui/Toggle';
import { getAcademicYears } from '../../../utils/utils';

interface AssignClassProps {
    isOpen: boolean;
    onClose: () => void;
    record: any;
    schoolId: string;
    refetch: () => void;
    selectedAcademicYear: string
}

export default function AssignClass({ isOpen, onClose, record, schoolId, refetch, selectedAcademicYear }: AssignClassProps) {
    const [assignData, setAssignData] = useState({
        classId: '',
        className: '', // <-- Added
        sectionId: '',
        sectionName: '', // <-- Added
        academicYear: selectedAcademicYear,
        rollNumber: '',
        isBusApplicable: false // 🌟 Added new state property
    });

    // --- Mutations ---
    // const assignClassMutation = useAssignStudentToClass(); // Use your actual hook
    // const removeClassMutation = useRemoveStudentFromClass(); // Use your actual hook

    const assignClassMutation = useAssignStudentToClassV1(); // Use your actual hook
    const removeClassMutation = useRemoveStudentFromClassV1(); // Use your actual hook


    // --- Data Fetching ---
    const { data: classesData } = useGetClasses(schoolId);
    const { data: sectionsData, isLoading: isSectionsLoading } = useGetSections({
        schoolId: schoolId,
        classId: assignData.classId
    });

    // --- Options Mapping ---
    const classOptions = classesData?.map((c: any) => ({ label: c.name, value: c._id })) || [];
    const sectionOptions = sectionsData?.map((s: any) => ({ label: s.name, value: s._id })) || [];

    // --- Check if the selected class has sections ---
    const assignSelectedClassObj = classesData?.find((c: any) => c?._id === assignData?.classId);
    const assignHasSections = assignSelectedClassObj?.hasSections === true;

    // --- Sync Record Data on Open ---
    useEffect(() => {
        if (record && isOpen) {
            setAssignData({
                classId: record?.classId?._id || record?.classId || '',
                className: record?.className || record?.classId?.name || '', // <-- Added
                sectionId: record?.sectionId?._id || record?.sectionId || '',
                sectionName: record?.sectionName || record?.sectionId?.name || '', // <-- Added
                academicYear: record?.academicYear || null,
                rollNumber: record?.rollNumber || '',
                isBusApplicable: record?.isBusApplicable || false // 🌟 Sync from database record
            });
        }
    }, [record, isOpen]);

    // --- Submit Handler ---
    const handleAssignSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await assignClassMutation.mutateAsync({
                schoolId: schoolId,
                studentId: typeof record?.studentId === 'object' ? record?.studentId?._id : record?.studentId,
                studentName: record?.studentName || record?.studentId?.studentName || '',
                newOld: record?.newOld || 'new',
                ...assignData
            });
            onClose();
            refetch();
            toast.success("Successfully Assigned!");
        } catch (err: any) {
            toast.error(err?.message || "Failed to assign class.");
        }
    };

    // --- Remove Handler ---
    const handleRemoveClass = async () => {
        if (window.confirm("Remove student from current class?")) {
            try {
                await removeClassMutation.mutateAsync({
                    schoolId: schoolId,
                    studentId: typeof record?.studentId === 'object' ? record?.studentId?._id : record?.studentId
                });
                onClose();
                refetch();
                toast.success("Removed from class.");
            } catch (err: any) {
                toast.error(err?.message || "Failed to remove from class.");
            }
        }
    };

    return (
        <SideModal isOpen={isOpen} onClose={onClose} title="Assign to Class">
            <form onSubmit={handleAssignSubmit} className="flex flex-col h-full space-y-6">
                <div className="space-y-4 pr-2">

                    {/* 🌟 PREMIUM INFORMATIONAL CALLOUT BANNER */}
                    <div className="flex items-start gap-3 p-3.5 bg-primary-soft/40 border border-primary/20 rounded-xl text-sm">
                        <i className="fas fa-circle-info text-primary mt-0.5 text-base shrink-0"></i>
                        <div className="text-content-muted leading-relaxed">
                            <span className="font-bold text-foreground block mb-0.5">Fee Structure Required</span>
                            Please ensure the fee configuration for the selected class is initialized for this academic year before assigning students.
                        </div>
                    </div>

                    <SearchSelect
                        label="Select Class *"
                        options={classOptions}
                        value={assignData.classId}
                        onChange={(o) => setAssignData({
                            ...assignData,
                            classId: String(o?.value || ''),
                            className: String(o?.label || ''), // <-- Capture the Class Name
                            sectionId: '',   // Automatically reset section ID
                            sectionName: ''  // Automatically reset section Name
                        })}
                    />

                    {assignHasSections && (
                        <div className="relative animate-in fade-in" key={assignData.classId}>
                            <SearchSelect
                                label="Select Section *"
                                options={sectionOptions}
                                value={assignData.sectionId}
                                // onChange={(o) => setAssignData({ ...assignData, sectionId: String(o?.value || '') })}
                                onChange={(o) => setAssignData({
                                    ...assignData,
                                    sectionId: String(o?.value || ''),
                                    sectionName: String(o?.label || '') // <-- Capture the Section Name
                                })}
                            />
                            {isSectionsLoading && <i className="fas fa-spinner fa-spin absolute right-3 top-[38px] text-muted text-xs"></i>}
                        </div>
                    )}


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
                        {/* <Input id="academicYear" label="Academic Year" value={assignData.academicYear} onChange={(e) => setAssignData({ ...assignData, academicYear: e.target.value })} required /> */}

                        <SearchSelect
                            label="Academic Year *" // Removed label to keep the top bar clean like a search input
                            options={getAcademicYears()}
                            value={assignData.academicYear}
                            onChange={(opt) => setAssignData({ ...assignData, academicYear: String(opt.value) })}
                            placeholder="Academic Year..."

                        />
                        {/* Styled Toggle Container matching the Input height */}
                        <div className="flex items-center px-2 bg-surface border border-border rounded-lg transition-colors hover:bg-mainBg">
                            <Toggle
                                checked={assignData.isBusApplicable}
                                onChange={(checked) => setAssignData({ ...assignData, isBusApplicable: checked })}
                                label="Bus Transport Required"
                                // className="border border-border peer-checked:bg-primary"
                                // thumbClassName="border border-border"

                                className="border border-border bg-sub-header peer-checked:bg-primary"

                                // 2. Thumb: Add a border to make the circle pop against the background
                                thumbClassName="border border-border"
                            />
                        </div>
                    </div>

                    <Input id="rollNumber" label="Roll Number (Optional)" value={assignData.rollNumber} onChange={(e) => setAssignData({ ...assignData, rollNumber: e.target.value })} />

                </div>

                <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-border">
                    {record?.classId && (
                        <Button type="button" variant="ghost" className="text-danger mr-auto" onClick={handleRemoveClass}>
                            Remove from Class
                        </Button>
                    )}
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" isLoading={assignClassMutation.isPending} disabled={!assignData.classId}>
                        Assign
                    </Button>
                </div>
            </form>
        </SideModal>
    );
}