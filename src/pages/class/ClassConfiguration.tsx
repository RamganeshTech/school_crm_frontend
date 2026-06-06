
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
// import type { UserRole } from '../../features/store/store';
import {
    type ClassData,
    useCreateClass,
    useDeleteClass,
    useGetClasses,
    useUpdateClass
} from '../../api_services/schoolConfig_api/classApi';
import { Button } from '../../shared/ui/Button';
import { Input, Label } from '../../shared/ui/Input';
// Adjust these paths if you saved the Table and Modal components elsewhere
// import { TableContainer, THead, Th, TBody, Tr, Td } from '../../shared/ui/Table'; 
import { SideModal } from '../../shared/ui/SideModal';
import { TableContainer, THead, Th, TBody, Tr, Td } from '../../shared/ui/TableLayout';
import type { RootState } from '../../features/store/store';
import { useRoleCheck } from '../../hooks/useRoleCheck';
import { toast } from '../../shared/ui/ToastContext';

export default function ClassConfiguration() {
    // --- Global State ---
    const { schoolId } = useSelector((state: RootState) => state.auth);
    const { isAccountant, isTeacher, isParent, isPrincipal, isVicePrincipal } = useRoleCheck()

    // --- API Hooks ---
    const { data: classes, isLoading, isError } = useGetClasses(schoolId!);
    const createClassMutation = useCreateClass();
    const updateClassMutation = useUpdateClass();
    const deleteClassMutation = useDeleteClass();

    // --- Local State ---
    const [searchQuery, setSearchQuery] = useState(''); // 🛑 ADDED: Search state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        order: 1, // Still keeping order in state so users can sort classes in the backend
        hasSections: true,
    });


    // 🛑 ADDED: Filter logic based on search query
    const filteredClasses = classes?.filter(cls =>
        cls.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    // --- Handlers ---
    const openCreateForm = () => {
        setFormData({ name: '', order: (classes?.length || 0) + 1, hasSections: true });
        setEditingId(null);
        setIsFormOpen(true);
    };

    const openEditForm = (cls: ClassData) => {
        setFormData({ name: cls.name, order: cls.order, hasSections: cls.hasSections });
        setEditingId(cls._id);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
    };



    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'number' ? Number(value) : value
        }));
    };

    const toggleHasSections = () => {
        setFormData(prev => ({ ...prev, hasSections: !prev.hasSections }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingId) {
                await updateClassMutation.mutateAsync({
                    id: editingId,
                    data: formData
                });
            } else {
                await createClassMutation.mutateAsync({
                    schoolId: schoolId!,
                    data: formData
                });
            }
            // refetch()
            toast.success("Class updated successfully")

            closeForm();
        } catch (error: any) {
            toast.error(error.message || "Something went wrong")

        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete class "${name}"?`)) {
            try {
                await deleteClassMutation.mutateAsync(id);
                // refetch()
                toast.success("Class Deleted successfully")

            } catch (error: any) {
                toast.error(error.message || "Something went wrong")

            }
        }
    };


    const canModify = !isAccountant && !isTeacher && !isParent && !isPrincipal && !isVicePrincipal

    // --- Render Guards ---
    if (isLoading) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center">
                <i className="fas fa-circle-notch fa-spin text-primary text-3xl mb-4"></i>
                <p className="text-muted text-sm font-medium">Loading classes...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="w-full p-6 text-center bg-red-50 border border-red-200 rounded-xl">
                <p className="text-danger font-medium">Failed to load classes. Please try again later.</p>
            </div>
        );
    }

    return (
        // <div className="w-full  mx-auto p-4 md:p-6 space-y-6">
        <div className="w-full max-w-full h-full max-full overflow-y-auto mx-auto p-2 space-y-6">


            {/* --- Header Section --- */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-layer-group text-primary"></i>
                        Class Configuration
                    </h1>
                    <p className="text-sm text-muted mt-1">Manage standard classes and section structures for your school.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <Input
                        id="searchClasses"
                        placeholder="Search by class name..."
                        leftIcon="fas fa-search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        wrapperClassName="w-full sm:w-64" // Keeps the input at a nice width
                    />
                    {canModify && <Button onClick={openCreateForm} leftIcon="fas fa-plus" variant="primary" className="w-full sm:w-auto whitespace-nowrap shrink-0">
                        Add New Class
                    </Button>}
                </div>

            </header>

            {/* --- Data List Section (Using Custom Table Components) --- */}
            {classes && classes.length > 0 ? (
                // <TableContainer>
                <TableContainer className="max-h-[calc(100%-80px)] overflow-y-auto">
                    {/* <THead> */}
                    <THead className="sticky top-0 z-10 bg-background after:absolute after:bottom-0 after:left-0 after:right-0">
                        <tr>
                            <Th className="w-20 text-center">S.No</Th>
                            <Th>Class Name</Th>
                            <Th>Structure</Th>
                            {canModify && <Th className="text-right">Actions</Th>}
                        </tr>
                    </THead>
                    <TBody>
                        {/* Sort by backend order, but display sequential S.No based on index */}
                        {[...filteredClasses].sort((a, b) => a.order - b.order).map((cls, index) => (
                            <Tr key={cls._id} className="group">
                                <Td className="text-center font-medium text-muted">
                                    {/* 🛑 Changed to S.No using index + 1 */}
                                    {index + 1}
                                </Td>
                                <Td>
                                    <p className="font-semibold text-foreground">{cls.name}</p>
                                </Td>
                                <Td>
                                    {cls.hasSections ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-primary-soft text-primary border border-primary/20">
                                            <i className="fas fa-sitemap text-[10px]"></i>
                                            Has Sections
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface text-muted border border-border">
                                            <i className="fas fa-minus text-[10px]"></i>
                                            Single Unit
                                        </span>
                                    )}
                                </Td>
                                {canModify && <Td className="text-right">
                                    {/* 🛑 Removed opacity classes so buttons are always visible */}
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditForm(cls)}
                                            title="Edit Class"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hover:text-danger hover:bg-danger/10 text-danger"
                                            onClick={() => handleDelete(cls._id, cls.name)}
                                            isLoading={deleteClassMutation.isPending}
                                            title="Delete Class"
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
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface border border-divider rounded-xl shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4 text-muted text-2xl shadow-sm">
                        <i className="fas fa-folder-open"></i>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No Classes Configured</h3>
                    <p className="text-muted text-sm max-w-md mb-6">
                        You haven't added any classes to this school yet. Set up your academic structure by adding your first class.
                    </p>
                    <Button onClick={openCreateForm} variant="primary" leftIcon="fas fa-plus">
                        Add First Class
                    </Button>
                </div>
            )}

            {/* --- SideModal for Create/Edit Form --- */}
            <SideModal
                isOpen={isFormOpen}
                onClose={closeForm}
                title={editingId ? 'Edit Class' : 'Create New Class'}
            >
                <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">
                    <div className="space-y-5">
                        <Input
                            id="name"
                            label="Class Name"
                            placeholder="e.g., Grade 1, Kindergarten, Standard X"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            disabled={createClassMutation.isPending || updateClassMutation.isPending}
                        />

                        <Input
                            id="order"
                            type="number"
                            label="Display Order (Backend Sorting)"
                            placeholder="1, 2, 3..."
                            value={formData.order}
                            onChange={handleInputChange}
                            required
                            min="1"
                            disabled={createClassMutation.isPending || updateClassMutation.isPending}
                        />

                        {/* Custom Styled Toggle for hasSections */}
                        <div className="flex flex-col gap-1.5 pt-2">
                            <Label>Section Configuration</Label>
                            <button
                                type="button"
                                onClick={toggleHasSections}
                                className={`flex items-center gap-4 p-4 border rounded-xl transition-all text-left ${formData.hasSections ? 'border-primary bg-primary-soft/30' : 'border-border bg-surface hover:bg-background'}`}
                            >
                                <div className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${formData.hasSections ? 'bg-primary' : 'bg-muted'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform ${formData.hasSections ? 'translate-x-6' : 'translate-x-1'}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        {formData.hasSections ? 'Sections Enabled' : 'No Sections'}
                                    </p>
                                    <p className="text-xs text-muted mt-0.5 leading-relaxed">
                                        {formData.hasSections ? 'This class will having multiple sections in future (A, B, C, D)' : 'This class wont have any sectiions.'}
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Footer Buttons pinned to bottom of modal space */}
                    <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-border">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeForm}
                            disabled={createClassMutation.isPending || updateClassMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={createClassMutation.isPending || updateClassMutation.isPending}
                        >
                            {editingId ? 'Update Class' : 'Create Class'}
                        </Button>
                    </div>
                </form>
            </SideModal>

        </div>
    );
}