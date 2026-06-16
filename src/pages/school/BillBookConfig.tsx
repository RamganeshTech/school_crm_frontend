import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardHeader, CardContent } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { toast } from '../../shared/ui/ToastContext';
import type { RootState } from '../../features/store/store';
// Adjust these imports to where your hooks actually live
import {
    useGetAllBillBooks,
    useCreateBillBook,
    useUpdateBillBook,
    useEditBillSequence,
    useDeleteBillBook
} from '../../api_services/schoolConfig_api/billBookApi';
import { Toggle } from '../../shared/ui/Toggle';
import { SideModal } from '../../shared/ui/SideModal';

export default function BillBookConfig() {
    const { schoolId } = useSelector((state: RootState) => state.auth);

    // --- API Hooks ---
    const { data: billBooks, isLoading } = useGetAllBillBooks(schoolId!);
    const createBillBookMutation = useCreateBillBook();
    const updateBillBookMutation = useUpdateBillBook();
    const editSequenceMutation = useEditBillSequence();
    const deleteBillBookMutation = useDeleteBillBook();

    // --- Local State ---
    const [formData, setFormData] = useState({
        bookName: '',
        startingBillNumber: '' // Now treated strictly as a string
    });


    // --- Edit Modal State ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        bookName: '',
        billNumber: '',
        isActive: false
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schoolId) return;

        try {
            await createBillBookMutation.mutateAsync({
                schoolId,
                bookName: formData.bookName,
                // Removed the Number() wrapper to preserve alphanumeric strings (e.g., "REC-001")
                billNumber: formData.startingBillNumber.trim()
            });
            toast.success("Bill Book created and activated!");
            setFormData({ bookName: '', startingBillNumber: '' });
        } catch (error: any) {
            toast.error(error.message || "Failed to create Bill Book");
        }
    };


    // 🌟 DELETE HANDLER
    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this bill book? This cannot be undone.")) return;

        try {
            await deleteBillBookMutation.mutateAsync({ id, schoolId: schoolId! });
            toast.success("Bill book deleted successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete bill book");
        }
    };


    // Open Modal and populate data
    const handleOpenEdit = (book: any) => {
        setEditingBook(book);
        setEditForm({
            bookName: book.bookName,
            billNumber: book.billNumber, // Handle legacy or updated naming
            isActive: book.isActive
        });
        setIsEditModalOpen(true);
    };

    // Close Modal
    const handleCloseEdit = () => {
        setIsEditModalOpen(false);
        setTimeout(() => setEditingBook(null), 300); // Clear after animation
    };

    // Submit Edits
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schoolId || !editingBook) return;

        try {
            // Check if Book Name or Status changed
            if (editForm.bookName !== editingBook.bookName || editForm.isActive !== editingBook.isActive) {
                await updateBillBookMutation.mutateAsync({
                    id: editingBook._id,
                    schoolId,
                    bookName: editForm.bookName,
                    isActive: editForm.isActive
                });
            }

            // Check if Sequence Number changed
            const currentSeq = editingBook.billNumber;
            if (editForm.billNumber !== currentSeq) {
                await editSequenceMutation.mutateAsync({
                    id: editingBook._id,
                    schoolId,
                    newBillNumber: editForm.billNumber.trim()
                });
            }

            toast.success("Bill Book updated successfully!");
            handleCloseEdit();
        } catch (error: any) {
            toast.error(error.message || "Failed to update Bill Book");
        }
    };


    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {/* Left Col: Create New Book */}
            <Card className="md:col-span-1 h-fit">
                <CardHeader title="New Bill Book" subtitle="Create a new active sequence." />
                <CardContent>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <Input
                            id="bookName"
                            label="Bill Book Name"
                            placeholder="e.g., Main Book 1"
                            value={formData.bookName}
                            onChange={(e) => setFormData({ ...formData, bookName: e.target.value })}
                            required
                        />
                        <Input
                            id="startingBillNumber"
                            type="text"
                            label="Starting Receipt Number"
                            placeholder="e.g., REC-001 or 1001"
                            value={formData.startingBillNumber}
                            onChange={(e) => setFormData({ ...formData, startingBillNumber: e.target.value })}
                            required
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            isLoading={createBillBookMutation.isPending}
                        >
                            Create & Activate
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Right Col: List of Books */}
            <Card className="md:col-span-2">
                <CardHeader title="Bill Book History" subtitle="Manage previously created receipt sequences." />
                <CardContent className='h-full'>
                    {isLoading ? (
                        <p className="text-sm text-muted">Loading bill books...</p>
                    ) : billBooks?.length === 0 ? (
                        <p className="text-sm text-muted">No bill books found for this academic year.</p>
                    ) : (
                        // <div className="space-y-3 max-h-full overflow-y-auto">
                        <div className="space-y-3 overflow-y-auto max-h-[350px] md:max-h-[500px] pr-2 custom-scrollbar">
                            {billBooks?.map((book: any) => (
                                <div key={book._id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-surface transition-colors hover:border-primary/30">
                                    <div>
                                        <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                                            {book.bookName}
                                            {book.isActive && <span className="px-2 py-0.5 bg-success/10 text-success text-[10px] uppercase rounded font-bold shadow-sm">Active</span>}
                                        </h4>
                                        <p className="text-xs text-muted mt-1">
                                            Next Sequence: <span className="font-bold text-foreground bg-background px-1.5 py-0.5 rounded border border-border">#{book?.billNumber || "N/A"}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            leftIcon="fas fa-edit"
                                            onClick={() => handleOpenEdit(book)}
                                        >
                                            Edit
                                        </Button>

                                        {/* 🌟 DELETE BUTTON (Hidden if active) */}
                                        {!book.isActive && (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(book._id)}
                                                isLoading={deleteBillBookMutation.isPending}
                                                className="px-2"
                                                title="Delete Bill Book"
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
            <SideModal isOpen={isEditModalOpen} onClose={handleCloseEdit} title="Edit Bill Book">
                <form onSubmit={handleEditSubmit} className="flex flex-col h-full space-y-6">
                    <div className="space-y-5 overflow-y-auto custom-scrollbar pr-2 pb-4">

                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-2 flex items-start gap-3">
                            <i className="fas fa-info-circle text-primary mt-0.5"></i>
                            <p className="text-xs text-muted leading-relaxed">
                                Updating the sequence number will immediately affect the next receipt generated. Deactivating this book requires another book to be active.
                            </p>
                        </div>

                        <Input
                            id="editBookName"
                            label="Bill Book Name"
                            value={editForm.bookName}
                            onChange={(e) => setEditForm({ ...editForm, bookName: e.target.value })}
                            required
                        />

                        <Input
                            id="editBillNumber"
                            type="text"
                            label="Next Receipt Number"
                            value={editForm.billNumber}
                            onChange={(e) => setEditForm({ ...editForm, billNumber: e.target.value })}
                            required
                        />

                        <div className="bg-background border border-border rounded-xl p-4">
                            <Toggle
                                checked={editForm.isActive}
                                onChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
                                label="Active Status"
                                description={editForm.isActive
                                    ? "This is the current active book."
                                    : "Activating this will deactivate the current active book."}
                            />
                        </div>
                    </div>

                    <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-border">
                        <Button type="button" variant="outline" onClick={handleCloseEdit}>Cancel</Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={updateBillBookMutation.isPending || editSequenceMutation.isPending}
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </SideModal>
        </div>
    );
}