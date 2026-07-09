import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardHeader, CardContent } from '../../../../shared/ui/Card';
import { Button } from '../../../../shared/ui/Button';
import { Input } from '../../../../shared/ui/Input';
import { Toggle } from '../../../../shared/ui/Toggle';
import { SideModal } from '../../../../shared/ui/SideModal';
import { toast } from '../../../../shared/ui/ToastContext';
import type { RootState } from '../../../../features/store/store';

import {
    useGetAllAdmissionBooks,
    useCreateAdmissionBook,
    useUpdateAdmissionBook,
    useEditFormSequence,
    useDeleteAdmissionBook // 🌟 New Hook
} from '../../../../api_services/schoolConfig_api/admissionBookApi';
import { useSearchParams } from 'react-router-dom';
import AdmissionRecordMain from './AdmissionRecordMain';

export default function AdmissionBookConfig() {
    const { schoolId } = useSelector((state: RootState) => state.auth);

    // --- API Hooks ---
    const { data: admissionBooks, isLoading } = useGetAllAdmissionBooks(schoolId!);
    const createBookMutation = useCreateAdmissionBook();
    const updateBookMutation = useUpdateAdmissionBook();
    const editSequenceMutation = useEditFormSequence();
    const deleteBookMutation = useDeleteAdmissionBook();

    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedBookForRecords, setSelectedBookForRecords] = useState<any>(null);

    // 🌟 URL tracking to auto-open the book
    useEffect(() => {
        const admissionBookId = searchParams.get('admissionBookId');

        // Wait until admissionBooks (or your equivalent array) are loaded
        if (admissionBookId && admissionBooks && admissionBooks.length > 0) {
            const foundBook = admissionBooks.find((b: any) => b._id === admissionBookId);

            if (foundBook && !selectedBookForRecords) {
                setSelectedBookForRecords(foundBook);
            }
        }
    }, [searchParams, admissionBooks]);

    // --- Local State ---
    const [formData, setFormData] = useState({
        bookName: '',
        startingFormNumber: ''
    });

    // --- Edit Modal State ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        bookName: '',
        formNumber: '',
        isActive: false
    });

    // --- Handlers ---
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schoolId) return;

        try {
            await createBookMutation.mutateAsync({
                schoolId,
                bookName: formData.bookName,
                startingFormNumber: formData.startingFormNumber.trim()
            });
            toast.success("Admission Book created and activated!");
            setFormData({ bookName: '', startingFormNumber: '' });
        } catch (error: any) {
            toast.error(error.message || "Failed to create Admission Book");
        }
    };

    const handleOpenEdit = (book: any) => {
        setEditingBook(book);
        setEditForm({
            bookName: book.bookName,
            formNumber: book.formNumber,
            isActive: book.isActive
        });
        setIsEditModalOpen(true);
    };

    const handleCloseEdit = () => {
        setIsEditModalOpen(false);
        setTimeout(() => setEditingBook(null), 300);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schoolId || !editingBook) return;

        try {
            if (editForm.bookName !== editingBook.bookName || editForm.isActive !== editingBook.isActive) {
                await updateBookMutation.mutateAsync({
                    id: editingBook._id, schoolId, bookName: editForm.bookName, isActive: editForm.isActive
                });
            }

            if (editForm.formNumber !== editingBook.formNumber) {
                await editSequenceMutation.mutateAsync({
                    id: editingBook._id, schoolId, newFormNumber: editForm.formNumber.trim()
                });
            }

            toast.success("Admission Book updated successfully!");
            handleCloseEdit();
        } catch (error: any) {
            toast.error(error.message || "Failed to update Admission Book");
        }
    };

    // 🌟 DELETE HANDLER
    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this admission book? This cannot be undone.")) return;

        try {
            await deleteBookMutation.mutateAsync({ id, schoolId: schoolId! });
            toast.success("Book deleted successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete book");
        }
    };


    // 🌟 NEW: View Switcher Logic
    if (selectedBookForRecords) {
        return (
            <div className="h-full">
                <AdmissionRecordMain
                    admissionBook={selectedBookForRecords}
                    // onBack={() => setSelectedBookForRecords(null)}
                    onBack={() => {
                        setSelectedBookForRecords(null);

                        // 🌟 Clear the URL params so it doesn't get stuck
                        if (searchParams.get('admissionBookId')) {
                            searchParams.delete('admissionBookId');
                            searchParams.delete('type');
                            setSearchParams(searchParams, { replace: true });
                        }
                    }}
                />
            </div>
        );
    }


    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Col: Create New Book */}
            <Card className="md:col-span-1 h-fit">
                <CardHeader title="New Admission Book" subtitle="Create a new active sequence." />
                <CardContent>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <Input
                            id="bookName"
                            label="Book Name"
                            placeholder="e.g., General Wing 2026"
                            value={formData.bookName}
                            onChange={(e) => setFormData({ ...formData, bookName: e.target.value })}
                            required
                        />
                        <Input
                            id="startingFormNumber"
                            type="text"
                            label="Starting Form Number"
                            placeholder="e.g., ADM-2026-001"
                            value={formData.startingFormNumber}
                            onChange={(e) => setFormData({ ...formData, startingFormNumber: e.target.value })}
                            required
                        />
                        <Button type="submit" variant="primary" fullWidth isLoading={createBookMutation.isPending}>
                            Create & Activate
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Right Col: List of Books */}
            <Card className="md:col-span-2">
                <CardHeader title="Admission Book History" subtitle="Manage previously created form sequences." />
                <CardContent>
                    {isLoading ? (
                        <p className="text-sm text-muted">Loading admission books...</p>
                    ) : admissionBooks?.length === 0 ? (
                        <p className="text-sm text-muted">No admission books found for this academic year.</p>
                    ) : (
                        <div className="space-y-3 overflow-y-auto max-h-[350px] md:max-h-[500px] pr-2 custom-scrollbar">
                            {admissionBooks?.map((book: any) => (
                                <div key={book._id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-surface transition-colors hover:border-primary/30 shrink-0">
                                    <div>
                                        <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                                            {book.bookName}
                                            {book.isActive && <span className="px-2 py-0.5 bg-success/10 text-success text-[10px] uppercase rounded font-bold shadow-sm">Active</span>}
                                        </h4>
                                        <p className="text-xs text-muted mt-1">
                                            Next Sequence: <span className="font-bold text-foreground bg-background px-1.5 py-0.5 rounded border border-border">#{book?.formNumber || "N/A"}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" leftIcon="fas fa-edit" onClick={() => handleOpenEdit(book)}>
                                            Edit
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            leftIcon="fas fa-list-alt"
                                            // onClick={() => handleShowRecords(book._id)}
                                            onClick={() => setSelectedBookForRecords(book)}
                                        >
                                            Records
                                        </Button>


                                        {/* 🌟 DELETE BUTTON (Hidden if active) */}
                                        {!book.isActive && (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(book._id)}
                                                isLoading={deleteBookMutation.isPending}
                                                className="px-2"
                                                title="Delete Book"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* --- EDIT MODAL --- */}
            <SideModal isOpen={isEditModalOpen} onClose={handleCloseEdit} title="Edit Admission Book">
                <form onSubmit={handleEditSubmit} className="flex flex-col h-full space-y-6">
                    <div className="space-y-5 overflow-y-auto custom-scrollbar pr-2 pb-4">
                        <Input
                            id="editBookName"
                            label="Book Name"
                            value={editForm.bookName}
                            onChange={(e) => setEditForm({ ...editForm, bookName: e.target.value })}
                            required
                        />
                        <Input
                            id="editFormNumber"
                            type="text"
                            label="Next Form Number"
                            value={editForm.formNumber}
                            onChange={(e) => setEditForm({ ...editForm, formNumber: e.target.value })}
                            required
                        />
                        <div className="bg-background border border-border rounded-xl p-4">
                            <Toggle
                                checked={editForm.isActive}
                                onChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
                                label="Active Status"
                                description={editForm.isActive ? "This is the current active book." : "Activating this will deactivate the current active book."}
                            />
                        </div>
                    </div>
                    <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-border">
                        <Button type="button" variant="outline" onClick={handleCloseEdit}>Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={updateBookMutation.isPending || editSequenceMutation.isPending}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </SideModal>
        </div>
    );
}