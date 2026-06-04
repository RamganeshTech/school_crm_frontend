

import React, { useState } from 'react';
import { useSelector } from 'react-redux';

// --- API Hooks ---
import { useGetClasses } from '../../api_services/schoolConfig_api/classApi';
import {
    type SectionData,
    useCreateSection,
    useDeleteSection,
    useGetSections,
    useUpdateSection
} from '../../api_services/schoolConfig_api/sectionApi';

// --- UI Components ---
import { Button } from '../../shared/ui/Button';
import { Input, Label } from '../../shared/ui/Input';
import { SideModal } from '../../shared/ui/SideModal';
import { TableContainer, THead, Th, TBody, Tr, Td } from '../../shared/ui/TableLayout';
import { SearchSelect, type SelectOption } from '../../shared/ui/SearchSelect';
import type { RootState } from '../../features/store/store';
import { toast } from '../../shared/ui/ToastContext';
import { useRoleCheck } from '../../hooks/useRoleCheck';

export default function SectionConfiguration() {
    // --- Global State ---
    const { schoolId } = useSelector((state: RootState) => state.auth);
    const { isAccountant, isTeacher, isParent, isPrincipal, isVicePrincipal } = useRoleCheck()


    // --- Local State ---
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        classId: '', // 🛑 Added classId to form data
        name: '',
        roomNumber: '',
        capacity: '',
    });

    // --- API Queries & Mutations ---
    const { data: classes, isLoading: isClassesLoading } = useGetClasses(schoolId!);

    const activeClassId = selectedClassId || classes?.[0]?._id;

    const canModify = !isAccountant && !isTeacher && !isParent && !isPrincipal && !isVicePrincipal


    const {
        data: sections,
        isLoading: isSectionsLoading,
        isError: isSectionsError,
        refetch
    } = useGetSections({ schoolId: schoolId!, classId: activeClassId });

    const createSectionMutation = useCreateSection();
    const updateSectionMutation = useUpdateSection();
    const deleteSectionMutation = useDeleteSection();

    // --- Auto-select first class when classes load ---
    // useEffect(() => {
    //     if (classes && classes.length > 0 && !selectedClassId) {
    //         setSelectedClassId(classes[0]._id);
    //     }
    // }, [classes, selectedClassId]);


    const classOptions: SelectOption[] = classes?.map(cls => ({
        label: cls.name,
        value: cls._id
    })) || [];

    // --- Derived Data (Search Filtering) ---
    const filteredSections = sections?.filter(sec =>
        sec.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    // --- Handlers ---
    const openCreateForm = () => {
        if (!selectedClassId) return alert("Please select a class first.");
        // Pre-fill the form with the currently selected class from the dashboard
        setFormData({ classId: selectedClassId, name: '', roomNumber: '', capacity: '' });
        setEditingId(null);
        setIsFormOpen(true);
    };

    const openEditForm = (sec: SectionData) => {
        setFormData({
            classId: sec.classId?._id || selectedClassId, // Assuming classId might be populated
            name: sec.name,
            roomNumber: sec.roomNumber || '',
            capacity: sec.capacity ? String(sec.capacity) : ''
        });
        setEditingId(sec._id);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.classId) {
            alert("Please select a class for this section.");
            return;
        }

        try {
            const payload = {
                name: formData.name,
                roomNumber: formData.roomNumber || undefined,
                capacity: formData.capacity ? Number(formData.capacity) : undefined,
            };

            if (editingId) {
                await updateSectionMutation.mutateAsync({
                    id: editingId,
                    data: payload
                });
                toast.success("Updated Successfully!");

            } else {
                await createSectionMutation.mutateAsync({
                    schoolId: schoolId!,
                    classId: formData.classId, // 🛑 Uses the classId from the form
                    ...payload
                });
                toast.success("Created Successfully!");

            }
            refetch();
            closeForm();
        } catch (error: any) {
            console.error("Failed to save section", error);
            toast.error(error.message || "Operation Failed");

        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete section "${name}"?`)) {
            try {
                await deleteSectionMutation.mutateAsync(id);
                toast.success("Deleted Successfully!");
                refetch();
            } catch (error: any) {
                console.error("Failed to delete section", error);
                toast.error(error.message || "Failed to delete section");

            }
        }
    };

    // --- Render Guards ---
    if (isClassesLoading) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center">
                <i className="fas fa-circle-notch fa-spin text-primary text-3xl mb-4"></i>
                <p className="text-muted text-sm font-medium">Loading workspace...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full h-full overflow-y-auto mx-auto p-4 md:p-6 space-y-6">

            {/* --- Header Section --- */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-cubes text-primary"></i>
                        Section Configuration
                    </h1>
                    <p className="text-sm text-muted mt-1">Manage divisions, rooms, and capacities for specific classes.</p>
                </div>

                {/* --- Filters & Actions --- */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">

                    <div className="w-full sm:w-64 shrink-0">
                        <SearchSelect
                            options={classOptions}
                            value={selectedClassId}
                            onChange={(option) => setSelectedClassId(String(option.value))}
                            placeholder="Select Class..."
                        />
                    </div>

                    <Input
                        id="searchSections"
                        placeholder="Search sections..."
                        leftIcon="fas fa-search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        wrapperClassName="w-full sm:w-56 shrink-0"
                        disabled={!selectedClassId}
                    />

                    {canModify && <Button
                        onClick={openCreateForm}
                        leftIcon="fas fa-plus"
                        variant="primary"
                        className="w-full sm:w-auto whitespace-nowrap shrink-0"
                        disabled={!selectedClassId}
                    >
                        Add Section
                    </Button>}
                </div>
            </div>

            {/* --- Data List Section --- */}
            {!selectedClassId ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-surface border border-divider rounded-xl shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4 text-muted text-2xl shadow-sm">
                        <i className="fas fa-hand-pointer"></i>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Select a Class</h3>
                    <p className="text-muted text-sm max-w-md">
                        Please select a class from the dropdown menu above to view and manage its sections.
                    </p>
                </div>
            ) : isSectionsLoading ? (
                <div className="w-full py-16 flex justify-center">
                    <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
                </div>
            ) : isSectionsError ? (
                <div className="w-full p-6 text-center bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-danger font-medium">Failed to load sections. Please try again later.</p>
                </div>
            ) : sections && sections.length > 0 ? (
                filteredSections.length > 0 ? (
                    <TableContainer className="max-h-[calc(100vh-240px)] overflow-y-auto">
                        <THead className="sticky top-0 z-10 bg-background after:absolute after:bottom-0 after:left-0 after:right-0">
                            <tr>
                                <Th className="w-20 text-center">S.No</Th>
                                <Th className="text-center">Section Name</Th>
                                <Th className="text-center">Room No.</Th>
                                <Th className="text-center">Capacity</Th>
                                {canModify && <Th className="text-center">Actions</Th>}
                            </tr>
                        </THead>
                        <TBody>
                            {[...filteredSections].sort((a, b) => a.name.localeCompare(b.name)).map((sec, index) => (
                                <Tr key={sec._id} className="group">
                                    <Td className="text-center font-medium text-muted">
                                        {index + 1}
                                    </Td>
                                    <Td className="text-center">
                                        <p className="font-semibold text-foreground">{sec.name}</p>
                                    </Td>
                                    <Td className="text-center">
                                        <span className="text-muted">{sec.roomNumber || 'N/A'}</span>
                                    </Td>
                                    <Td className="text-center">
                                        {sec.capacity ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface border border-border text-foreground">
                                                <i className="fas fa-users text-muted text-[10px]"></i>
                                                {sec.capacity} students
                                            </span>
                                        ) : (
                                            <span className="text-muted">N/A</span>
                                        )}
                                    </Td>
                                    {canModify && <Td className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEditForm(sec)}
                                                title="Edit Section"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="hover:text-danger hover:bg-danger/10 text-danger"
                                                onClick={() => handleDelete(sec._id, sec.name)}
                                                isLoading={deleteSectionMutation.isPending}
                                                title="Delete Section"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </Button>
                                        </div>
                                    </Td>}
                                </Tr>
                            ))}
                        </TBody>
                    </TableContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface border border-divider rounded-xl shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4 text-muted text-2xl shadow-sm">
                            <i className="fas fa-search"></i>
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">No matching sections</h3>
                        <p className="text-muted text-sm max-w-md">
                            We couldn't find any sections matching "{searchQuery}".
                        </p>
                        <Button variant="ghost" className="mt-4" onClick={() => setSearchQuery('')}>
                            Clear Search
                        </Button>
                    </div>
                )
            ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface border border-divider rounded-xl shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4 text-muted text-2xl shadow-sm">
                        <i className="fas fa-layer-group"></i>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No Sections Configured</h3>
                    <p className="text-muted text-sm max-w-md mb-6">
                        This class currently has no sections. Add your first section (e.g., 'A' or 'B') to get started.
                    </p>
                    <Button onClick={openCreateForm} variant="primary" leftIcon="fas fa-plus">
                        Add First Section
                    </Button>
                </div>
            )}

            {/* --- SideModal for Create/Edit Form --- */}
            <SideModal
                isOpen={isFormOpen}
                onClose={closeForm}
                title={editingId ? 'Edit Section' : 'Create New Section'}
            >
                <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">
                    <div className="space-y-5">

                        {/* 🛑 Form Class Selector */}
                        <div className="flex flex-col gap-1.5">
                            <Label isRequired>Assigned Class</Label>
                            {/* If editing, we disable changing the class to prevent accidental data corruption. */}
                            {editingId ? (
                                <div className="p-3 bg-background border border-divider rounded-lg text-content-muted text-sm cursor-not-allowed">
                                    {classes?.find(c => c._id === formData.classId)?.name || 'Loading...'}
                                </div>
                            ) : (
                                <SearchSelect
                                    options={classOptions}
                                    value={formData.classId}
                                    onChange={(option) => setFormData(prev => ({ ...prev, classId: String(option.value) }))}
                                    placeholder="Select Class..."
                                />
                            )}
                        </div>

                        <Input
                            id="name"
                            label="Section Name"
                            placeholder="e.g., A, B, C"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            disabled={createSectionMutation.isPending || updateSectionMutation.isPending}
                        />

                        <Input
                            id="roomNumber"
                            label="Room Number (Optional)"
                            placeholder="e.g., 101, Block B"
                            value={formData.roomNumber}
                            onChange={handleInputChange}
                            disabled={createSectionMutation.isPending || updateSectionMutation.isPending}
                        />

                        <Input
                            id="capacity"
                            type="number"
                            label="Student Capacity (Optional)"
                            placeholder="e.g., 40"
                            min="1"
                            value={formData.capacity}
                            onChange={handleInputChange}
                            disabled={createSectionMutation.isPending || updateSectionMutation.isPending}
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-divider">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeForm}
                            disabled={createSectionMutation.isPending || updateSectionMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={createSectionMutation.isPending || updateSectionMutation.isPending}
                        >
                            {editingId ? 'Update Section' : 'Create Section'}
                        </Button>
                    </div>
                </form>
            </SideModal>

        </div>
    );
}