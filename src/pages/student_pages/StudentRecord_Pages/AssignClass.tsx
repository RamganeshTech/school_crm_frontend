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
import { useAssignStudentToClass, useRemoveStudentFromClass } from '../../../api_services/student_api/studentRecordApi';
import { toast } from '../../../shared/ui/ToastContext';

interface AssignClassProps {
    isOpen: boolean;
    onClose: () => void;
    record: any;
    schoolId: string;
    refetch: () => void;
}

export default function AssignClass({ isOpen, onClose, record, schoolId, refetch }: AssignClassProps) {
    const [assignData, setAssignData] = useState({
        classId: '',
        className: '', // <-- Added
        sectionId: '',
        sectionName: '', // <-- Added
        academicYear: '2025-2026',
        rollNumber: ''
    });

    // --- Mutations ---
    const assignClassMutation = useAssignStudentToClass(); // Use your actual hook
    const removeClassMutation = useRemoveStudentFromClass(); // Use your actual hook

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
                rollNumber: record?.rollNumber || ''
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
                studentName: record?.studentName || '',
                newOld: record?.newOld || 'New',
                ...assignData
            });
            onClose();
            refetch();
            toast.success("Successfully Assigned!");
        } catch (err: any) {
            console.error("Assignment failed", err);
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

                    <Input id="rollNumber" label="Roll Number (Optional)" value={assignData.rollNumber} onChange={(e) => setAssignData({ ...assignData, rollNumber: e.target.value })} />
                    <Input id="academicYear" label="Academic Year *" value={assignData.academicYear} onChange={(e) => setAssignData({ ...assignData, academicYear: e.target.value })} required />
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