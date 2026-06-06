import React, { useState, useCallback, useMemo } from 'react';
import {
    useGetAllClubsInfinite,
    useCreateClub,
    useUpdateClubText,
    useUpdateClubThumbnail,
    useDeleteClub
} from '../../../api_services/clubs_api/clubApi';
import { useAuthData } from '../../../hooks/useAuthData';
import { Button } from '../../../shared/ui/Button';
import ClubCard from './ClubCard';
import { SideModal } from '../../../shared/ui/SideModal';
import { Input, Label } from '../../../shared/ui/Input';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from '../../../shared/ui/ToastContext';
import { useRoleCheck } from '../../../hooks/useRoleCheck';

export default function ClubMain() {
    const { schoolId } = useAuthData();

    
    const { isCorrespondent, isAdmin } = useRoleCheck()

    const canModify = isAdmin || isCorrespondent

    const navigate = useNavigate(); // <--- Added
    // --- State ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [editingClubId, setEditingClubId] = useState<string | null>(null);

    // Independent Loading States for cards
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [updatingThumbId, setUpdatingThumbId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true,
    });
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

    // --- Queries & Mutations ---
    const {
        data: clubsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useGetAllClubsInfinite({ schoolId: schoolId! });

    const allClubs = useMemo(() => {
        return clubsData?.pages.flatMap(page => page.data || []) || [];
    }, [clubsData]);

    const createMutation = useCreateClub();
    const updateTextMutation = useUpdateClubText();
    const updateThumbnailMutation = useUpdateClubThumbnail();
    const deleteMutation = useDeleteClub();

    // --- Handlers ---
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const openCreateModal = () => {
        setModalMode('create');
        setEditingClubId(null);
        setFormData({ name: '', description: '', isActive: true });
        setThumbnailFile(null);
        setIsModalOpen(true);
    };

    const openEditModal = (club: any) => {
        setModalMode('edit');
        setEditingClubId(club._id);
        setFormData({
            name: club.name,
            description: club.description,
            isActive: club.isActive,
        });
        setThumbnailFile(null);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async () => {
        try {
            if (modalMode === 'create') {
                const payload = new FormData();
                payload.append('schoolId', schoolId!);
                payload.append('name', formData.name);
                payload.append('description', formData.description);
                if (thumbnailFile) payload.append('thumbnail', thumbnailFile);

                await createMutation.mutateAsync(payload);
                toast.success("Successfully Created")

            } else if (modalMode === 'edit' && editingClubId) {
                const originalClub = allClubs.find(c => c._id === editingClubId);
                await updateTextMutation.mutateAsync({
                    id: editingClubId,
                    payload: { ...formData, classId: originalClub?.classId || null }
                });
                toast.success("Successfully Updated")

            }
            setIsModalOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Something went wrong")

        }
    };

    const handleQuickThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>, clubId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUpdatingThumbId(clubId); // Trigger spinner for this specific card
        const payload = new FormData();
        payload.append('thumbnail', file);

        try {
            await updateThumbnailMutation.mutateAsync({ id: clubId, formData: payload });
            toast.success("Successfully Updated")

        } catch (error: any) {
            toast.error(error.message || "Failed to update the cover Image")

        } finally {
            setUpdatingThumbId(null); // Stop spinner
            e.target.value = ''; // Reset input
        }
    };

    const handleDelete = async (clubId: string, clubName: string) => {
        if (window.confirm(`Are you sure you want to delete "${clubName}"? This will permanently remove the club and all its videos.`)) {
            setDeletingId(clubId); // Trigger spinner for this specific card
            try {
                await deleteMutation.mutateAsync(clubId);

                toast.success("Successfully Deleted");

            } catch (error: any) {
                toast.error(error.message || "Failed to Delete.");
            } finally {
                setDeletingId(null); // Stop spinner
            }
        }
    };



    const isChild = location.pathname.includes("single")
    if (isChild) {
        return <Outlet />
    }

    return (
        <div className="w-full h-full flex flex-col gap-3 bg-background overflow-hidden">

            {/* TOP HEADER */}
            <header className="shrink-0 px-6 py-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface z-10 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-layer-group text-primary"></i>
                        Clubs and Activities
                    </h1>
                    <p className="text-sm text-muted mt-1">Discover and manage extracurricular groups.</p>
                </div>
                {canModify && (
                    <Button variant="primary" leftIcon="fas fa-plus" onClick={openCreateModal}>
                        Create Club
                    </Button>
                )}
            </header>

            {/* MAIN GALLERY / GRID */}
            <main
                className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-background"
                onScroll={handleScroll}
            >
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <i className="fas fa-circle-notch fa-spin text-primary text-4xl"></i>
                    </div>
                ) : allClubs.length === 0 ? (
                    <div className="flex flex-col h-full items-center justify-center text-muted border border-dashed border-border rounded-xl bg-surface/50 max-w-2xl mx-auto py-20">
                        <i className="fas fa-users-slash text-5xl opacity-30 mb-4"></i>
                        <h2 className="text-xl font-bold text-foreground">No Clubs Found</h2>
                        <p className="text-sm mt-1">Click "Create Club" to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
                        {allClubs.map((club) => (
                            <ClubCard
                                key={club._id}
                                club={club}
                                canModify={canModify}
                                onView={(id) => navigate(`single/${id}`)} // <--- Added Navigation
                                onEdit={openEditModal}
                                onDelete={handleDelete}
                                onUpdateThumbnail={handleQuickThumbnailChange}
                                isDeleting={deletingId === club._id}
                                isUpdatingThumb={updatingThumbId === club._id}
                            />
                        ))}
                    </div>
                )}

                {/* Infinite Scroll Loader */}
                {isFetchingNextPage && (
                    <div className="flex justify-center py-8">
                        <i className="fas fa-circle-notch fa-spin text-primary text-xl"></i>
                    </div>
                )}
            </main>

            {/* SIDE MODAL: CREATE / EDIT */}
            <SideModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'create' ? "Create New Club" : "Edit Club Details"}
            >
                <div className="flex flex-col h-full pr-2 space-y-6 pt-2">
                    <Input
                        label="Club Name"
                        placeholder="e.g., The Robotics Society"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <div className="flex flex-col gap-1.5">
                        <Label>Detailed Description <span className="text-danger">*</span></Label>
                        <textarea
                            className="w-full bg-background border border-border rounded-xl p-4 text-sm focus:border-primary outline-none transition-colors resize-none custom-scrollbar min-h-[140px]"
                            placeholder="What is this club about? What activities do they do?"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-5 border border-border rounded-xl bg-surface">
                        <div>
                            <Label className="mb-0 text-base">Club Status</Label>
                            <p className="text-[10px] text-muted mt-0.5">Inactive clubs are hidden from students.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success shadow-inner"></div>
                        </label>
                    </div>

                    {/* Image Upload - Only shown on Create */}
                    {modalMode === 'create' && (
                        <div className="flex flex-col gap-1.5">
                            <Label>Cover Image</Label>
                            <label className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary-soft/30 hover:border-primary/50 transition-colors bg-background">
                                {thumbnailFile ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center mb-3">
                                            <i className="fas fa-check"></i>
                                        </div>
                                        <span className="text-sm font-bold text-foreground truncate max-w-[200px]">{thumbnailFile.name}</span>
                                        <span className="text-xs text-muted mt-1 hover:text-primary">Click to replace image</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-14 h-14 rounded-full bg-primary-soft text-primary flex items-center justify-center mb-3">
                                            <i className="fas fa-cloud-upload-alt text-xl"></i>
                                        </div>
                                        <span className="text-sm font-bold text-foreground">Browse files to upload</span>
                                        <span className="text-xs text-muted mt-1">High quality JPG or PNG (Max 5MB)</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                />
                            </label>
                        </div>
                    )}

                    <div className="mt-auto pt-8 pb-4">
                        <Button
                            variant="primary"
                            className="w-full py-4 rounded-xl shadow-md text-sm"
                            onClick={handleFormSubmit}
                            isLoading={createMutation.isPending || updateTextMutation.isPending}
                            disabled={!formData.name || !formData.description}
                        >
                            {modalMode === 'create' ? 'Create Club' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </SideModal>
        </div>
    );
}