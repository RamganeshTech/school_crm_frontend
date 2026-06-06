
//  SECOND VERSION
import { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
// import { useAuthData } from '../../hooks/useAuthData';

// --- API Hooks ---
import {
    useGetClubById,
    useAddStudentToClub,
    useRemoveStudentFromClub,
    useToggleClassStudentsToClub
} from '../../../api_services/clubs_api/clubApi';

import {
    useGetAllClubVideosInfinite,
    useCreateClubVideo,
    useDeleteClubVideo,
    useUpdateClubVideoDetails,
    useUpdateClubVideoFile,
    useUploadClubVideoPDF,
    useDeleteClubVideoFile // Added delete PDF hook
} from '../../../api_services/clubs_api/clubVideoApi';


// --- UI Components ---
import { Button } from '../../../shared/ui/Button';
import { SideModal } from '../../../shared/ui/SideModal';
import { Input, Label } from '../../../shared/ui/Input';
import { useAuthData } from '../../../hooks/useAuthData';
import { useGetAllClassesWithSections } from '../../../api_services/teacher_api/teacherApi';
import { useGetAllStudents } from '../../../api_services/student_api/studentMainApi';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { useRoleCheck } from '../../../hooks/useRoleCheck';
import { toast } from '../../../shared/ui/ToastContext';


export default function ClubSingle() {
    const { id: clubId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();



    const { isCorrespondent, isAdmin, isTeacher } = useRoleCheck()

    const canModify = isAdmin || isCorrespondent
    const canUploadPdf = isAdmin || isCorrespondent || isTeacher

    const isChild = location.pathname.includes('/quiz');

    const { schoolId } = useAuthData();

    // ==========================================
    // 1. DATA QUERIES
    // ==========================================
    const { data: clubData, isLoading: isClubLoading } = useGetClubById(clubId);

    const {
        data: videosData,
        fetchNextPage: fetchNextVideos,
        hasNextPage: hasNextVideos,
        isFetchingNextPage: isFetchingNextVideos,
        isLoading: isVideosLoading
    } = useGetAllClubVideosInfinite({ clubId: clubId! });

    const allVideos = useMemo(() => videosData?.pages.flatMap(page => page.data || []) || [], [videosData]);

    // ==========================================
    // 2. VIDEO MUTATIONS & STATE
    // ==========================================
    const uploadVideoMutation = useCreateClubVideo();
    const deleteVideoMutation = useDeleteClubVideo();
    const updateDetailsMutation = useUpdateClubVideoDetails();
    const updateVideoFileMutation = useUpdateClubVideoFile();
    const uploadPdfMutation = useUploadClubVideoPDF();
    const deletePdfMutation = useDeleteClubVideoFile(); // Initialized delete PDF hook

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadData, setUploadData] = useState({ title: '', topic: '', level: 'general' });
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [pdfFiles, setPdfFiles] = useState<File[]>([]);

    const [editingVideo, setEditingVideo] = useState<any | null>(null);
    const [editData, setEditData] = useState({ title: '', topic: '', level: 'general' });
    const [editVideoFile, setEditVideoFile] = useState<File | null>(null);
    const [editPdfFiles, setEditPdfFiles] = useState<File[]>([]);

    // ==========================================
    // 3. STUDENT MANAGEMENT MUTATIONS & STATE
    // ==========================================
    const addStudentMutation = useAddStudentToClub();
    const removeStudentMutation = useRemoveStudentFromClub();
    const toggleClassMutation = useToggleClassStudentsToClub();

    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');

    // Fetch Classes
    const { data: classesData, } = useGetAllClassesWithSections({ schoolId: schoolId! });

    // Class/Section Logic
    const classOptions = useMemo(() => {
        return (classesData || []).map((c: any) => ({ label: c.name, value: c._id }));
    }, [classesData]);

    const selectedClassObj = useMemo(() => {
        return (classesData || []).find((c: any) => c._id === selectedClassId);
    }, [classesData, selectedClassId]);

    const hasSections = selectedClassObj?.sections && selectedClassObj.sections.length > 0;

    const sectionOptions = useMemo(() => {
        if (!hasSections) return [];
        return selectedClassObj.sections.map((s: any) => ({ label: s.name, value: s._id }));
    }, [selectedClassObj, hasSections]);

    // Only fetch students if a class is selected, AND (if it has sections, a section must be selected)
    const canFetchStudents = !!selectedClassId && (!hasSections || !!selectedSectionId);

    const {
        data: studentsData,
        isLoading: isStudentsLoading,
        fetchNextPage: fetchNextStudents,
        hasNextPage: hasNextStudents,
        isFetchingNextPage: isFetchingNextStudents
    } = useGetAllStudents({
        schoolId: schoolId!,
        classId: selectedClassId,
        sectionId: selectedSectionId,
        limit: 50
    });

    const allStudents = useMemo(() => {
        if (!canFetchStudents) return [];
        return studentsData?.pages.flat() || [];
    }, [studentsData, canFetchStudents]);

    // Populate array of enrolled student IDs for quick lookup
    const enrolledStudentIds = useMemo(() => {
        if (!clubData?.studentId) return [];
        // Extract _id safely since backend populates the array with full student objects
        return clubData.studentId.map((s: any) => s._id || s);
    }, [clubData]);


    if (isChild) {
        return <Outlet />;
    }

    // ==========================================
    // HANDLERS
    // ==========================================
    const handleUploadSubmit = async () => {
        if (!videoFile || !clubId) return;
        try {
            const videoFormData = new FormData();
            videoFormData.append('schoolId', schoolId!);
            videoFormData.append('clubId', clubId);
            videoFormData.append('title', uploadData.title);
            videoFormData.append('topic', uploadData.topic);
            videoFormData.append('level', uploadData.level);
            videoFormData.append('video', videoFile);

            const response = await uploadVideoMutation.mutateAsync(videoFormData);
            const newVideoId = response?.data?._id;

            if (pdfFiles.length > 0 && newVideoId) {
                const pdfFormData = new FormData();
                pdfFiles.forEach(pdf => pdfFormData.append('files', pdf));
                await uploadPdfMutation.mutateAsync({ id: newVideoId, formData: pdfFormData });
            }

            setIsUploadModalOpen(false);
            setUploadData({ title: '', topic: '', level: 'general' });
            setVideoFile(null);
            setPdfFiles([]);
        } catch (error: any) {
            toast.error(error.message || "Failed to upload.");
        }
    };

    const openEditModal = (video: any) => {
        setEditingVideo(video);
        setEditData({ title: video.title || '', topic: video.topic || '', level: video.level || 'general' });
        setEditVideoFile(null);
        setEditPdfFiles([]);
    };

    const handleEditSubmit = async () => {
        if (!editingVideo) return;
        try {
            await updateDetailsMutation.mutateAsync({
                id: editingVideo._id,
                payload: { title: editData.title, topic: editData.topic, level: editData.level }
            });

            if (editVideoFile) {
                const vData = new FormData();
                vData.append('video', editVideoFile);
                await updateVideoFileMutation.mutateAsync({ id: editingVideo._id, formData: vData });
            }

            if (editPdfFiles.length > 0) {
                const pData = new FormData();
                editPdfFiles.forEach(pdf => pData.append('files', pdf));
                await uploadPdfMutation.mutateAsync({ id: editingVideo._id, formData: pData });
            }
            setEditingVideo(null);
        } catch (error: any) {
            toast.error(error.message || "Operation Failed");
        }
    };

    const handleStudentToggle = async (studentId: string, isEnrolled: boolean) => {
        if (!clubId) return;
        const payload = { studentId, clubId };
        try {
            if (isEnrolled) {
                await removeStudentMutation.mutateAsync(payload);
            } else {
                await addStudentMutation.mutateAsync(payload);
            }
        } catch (error: any) {
            toast.error(error.message || "Operation Failed");
        }
    };

    const handleClassToggle = async () => {
        if (!clubId || !selectedClassId) return;
        try {
            await toggleClassMutation.mutateAsync({ clubId, classId: selectedClassId });
        } catch (error: any) {
            toast.error(error.message || "Operation Failed");
        }
    };


    const handleDeleteVideo = async (videoId: string) => {
        try {
            if (window.confirm("Permanently delete this video?")) {
                await deleteVideoMutation.mutateAsync(videoId);
            }
        } catch (error: any) {
            toast.error(error.message || "Operation Failed");
        }
    }

    if (isClubLoading) return <div className="flex h-full items-center justify-center"><i className="fas fa-circle-notch fa-spin text-primary text-4xl"></i></div>;

    const isAnyVideoMutationPending = uploadVideoMutation.isPending || uploadPdfMutation.isPending || updateDetailsMutation.isPending || updateVideoFileMutation.isPending;
    const isAnyStudentMutationPending = addStudentMutation.isPending || removeStudentMutation.isPending || toggleClassMutation.isPending;

    return (
        <div className="w-full h-full flex flex-col bg-background overflow-hidden">

            {/* Header */}
            <header className="shrink-0 px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-white z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
                        <i className="fas fa-arrow-left text-sm"></i>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">{clubData?.name}</h1>
                        <p className="text-xs font-semibold text-gray-500 mt-0.5 tracking-wide uppercase">
                            <i className="fas fa-user-friends mr-1.5"></i>
                            {clubData?.studentId?.length || 0} Members Enrolled
                        </p>
                    </div>
                </div>

                <div className='flex gap-3 items-center'>
                    {/* <Button variant="outline" leftIcon="fas fa-brain" onClick={() => navigate('quiz')} className="cursor-pointer">
                        Quiz
                    </Button> */}

                    <div className="flex items-center gap-3">
                        {canModify && <Button variant="outline" leftIcon="fas fa-users-cog" onClick={() => setIsStudentModalOpen(true)} className="cursor-pointer">
                            Manage Members
                        </Button>}
                        {canUploadPdf && <Button variant="primary" leftIcon="fas fa-cloud-upload-alt" onClick={() => setIsUploadModalOpen(true)} className="cursor-pointer">
                            Upload Lesson
                        </Button>}
                    </div>
                </div>

            </header>

            {/* Video Library */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Video Library & Resources</h2>

                        {isVideosLoading ? (
                            <div className="flex justify-center py-10"><i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i></div>
                        ) : allVideos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
                                <i className="fas fa-photo-video text-4xl text-gray-300 mb-3"></i>
                                <p className="text-gray-500 font-medium">No videos uploaded yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {allVideos.map((vid: any) => (
                                    <div key={vid._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col group">

                                        {/* HTML5 Video Player (Aspect Ratio Fixed) */}
                                        <div className="relative w-full bg-black aspect-video border-b border-gray-100 overflow-hidden">
                                            {vid.video?.url ? (
                                                <video
                                                    src={vid.video.url}
                                                    controls
                                                    controlsList="nodownload"
                                                    className="absolute inset-0 w-full h-full object-contain outline-none bg-black cursor-pointer"
                                                    poster={clubData?.thumbnail?.url}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">Video Processing...</div>
                                            )}
                                        </div>

                                        {/* Video Info */}
                                        <div className="p-4 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                <h3 className="text-[15px] font-bold text-gray-800 line-clamp-2">{vid.title || "Untitled Lesson"}</h3>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {vid.topic && <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">{vid.topic}</span>}
                                                {vid.level && <span className="bg-gray-50 text-gray-600 border border-gray-200 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Level: {vid.level}</span>}
                                            </div>

                                            {/* Linked PDFs */}
                                            {vid.pdfs && vid.pdfs.length > 0 && (
                                                <div className="mt-auto pt-3 border-t border-gray-100">
                                                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-2">Attached Resources ({vid.pdfs.length})</p>
                                                    <div className="flex flex-col gap-1.5">
                                                        {vid.pdfs.map((pdf: any) => (
                                                            <div key={pdf._id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md p-1.5 pl-2.5">
                                                                <div className="flex items-center gap-2 overflow-hidden flex-1 pr-2">
                                                                    <i className="fas fa-file-pdf text-rose-500 text-[13px]"></i>
                                                                    <span className="truncate text-[11px] font-medium text-gray-700" title={pdf.originalName}>{pdf.originalName}</span>
                                                                </div>

                                                                <div className="flex items-center gap-1 shrink-0">
                                                                    <a
                                                                        href={pdf.url}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="w-6 h-6 flex items-center justify-center text-blue-500 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                                                                        title="View File"
                                                                    >
                                                                        <i className="fas fa-external-link-alt text-[10px]"></i>
                                                                    </a>
                                                                    {canModify && (
                                                                        <button
                                                                            onClick={() => {
                                                                                if (window.confirm("Permanently delete this PDF?")) {
                                                                                    deletePdfMutation.mutateAsync({ id: vid._id, fileId: pdf._id });
                                                                                }
                                                                            }}
                                                                            disabled={deletePdfMutation.isPending}
                                                                            className="w-6 h-6 flex items-center justify-center text-rose-500 hover:bg-rose-100 rounded transition-colors cursor-pointer"
                                                                            title="Delete File"
                                                                        >
                                                                            <i className="fas fa-trash-alt text-[10px]"></i>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* <div className="bg-gray-50 border-t border-gray-100 flex items-center justify-between p-2 px-3 "> */}

                                        {/* Student / General Access Button */}


                                        {/* Admin Action Bar */}
                                        <div className="bg-sub-header border-t border-gray-100 flex items-center justify-between p-1.5 px-3">

                                            <Button
                                                onClick={() => navigate(`quiz/${vid._id}`)}
                                                leftIcon='fas fa-brain'
                                                // className="bg-primary text-white text-xs font-bold py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                                className=" text-[10px] font-bold"

                                            >
                                                Quiz Settings
                                            </Button>

                                            {canModify && <Button
                                                variant='outline'
                                                onClick={() => openEditModal(vid)}
                                                className="text-[10px] font-bold"
                                                leftIcon='fas fa-pen'
                                            >
                                                Edit Settings
                                            </Button>
                                            }


                                            {canModify && <Button
                                                onClick={() => handleDeleteVideo(vid._id)}
                                                // className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors py-1.5 cursor-pointer"
                                                variant='danger'
                                                isLoading={deleteVideoMutation.isPending}
                                                leftIcon='fas fa-trash-alt'
                                                className="text-[10px] font-bold"

                                            >
                                                Delete
                                            </Button>}
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {hasNextVideos && (
                    <div className="flex justify-center mt-8">
                        <Button variant="outline" size="sm" onClick={() => fetchNextVideos()} isLoading={isFetchingNextVideos} className="cursor-pointer">
                            Load More Videos
                        </Button>
                    </div>
                )}
            </main>

            {/* --- 1. UPLOAD MODAL --- */}
            <SideModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload New Lesson">
                <div className="flex flex-col space-y-5 pr-2">
                    <Input label="Video Title *" value={uploadData.title} onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })} placeholder="e.g., Intro to Robotics" />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Topic" value={uploadData.topic} onChange={(e) => setUploadData({ ...uploadData, topic: e.target.value })} placeholder="e.g., Engineering" />
                        <Input label="Level" value={uploadData.level} onChange={(e) => setUploadData({ ...uploadData, level: e.target.value })} placeholder="e.g., Beginner" />
                    </div>

                    <div className="flex flex-col gap-1.5 p-4 border border-blue-100 bg-blue-50/50 rounded-xl">
                        <Label className="text-blue-800">1. Select Video File <span className="text-rose-500">*</span></Label>
                        <input type="file" accept="video/mp4,video/mkv" className="text-sm bg-white p-1 rounded border border-blue-200 cursor-pointer" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
                    </div>

                    <div className="flex flex-col gap-1.5 p-4 border border-gray-200 bg-gray-50 rounded-xl">
                        <Label>2. Attach Resource PDFs (Optional)</Label>
                        <input type="file" accept="application/pdf" multiple className="text-sm bg-white p-1 rounded border border-gray-300 cursor-pointer"
                            onChange={(e) => setPdfFiles(Array.from(e.target.files || []))} />
                        <span className="text-[10px] text-gray-500 mt-1">You can select multiple files at once.</span>
                    </div>

                    <div className="pt-4 mt-auto">
                        <Button variant="primary" className="w-full py-3.5 cursor-pointer" onClick={handleUploadSubmit} isLoading={isAnyVideoMutationPending} disabled={!videoFile || !uploadData.title}>
                            {uploadPdfMutation.isPending ? 'Attaching PDFs...' : 'Upload to Library'}
                        </Button>
                    </div>
                </div>
            </SideModal>

            {/* --- 2. EDIT MODAL --- */}
            <SideModal isOpen={!!editingVideo} onClose={() => setEditingVideo(null)} title="Edit Video Settings">
                <div className="flex flex-col space-y-5 pr-2">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg mb-2">
                        <p className="text-xs text-gray-500">Editing: <span className="font-bold text-gray-800">{editingVideo?.title}</span></p>
                    </div>

                    <Input label="Video Title *" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Topic" value={editData.topic} onChange={(e) => setEditData({ ...editData, topic: e.target.value })} />
                        <Input label="Level" value={editData.level} onChange={(e) => setEditData({ ...editData, level: e.target.value })} />
                    </div>

                    <div className="flex flex-col gap-1.5 pt-4 border-t border-gray-200">
                        <Label>Replace Video File (Optional)</Label>
                        <input type="file" accept="video/mp4,video/mkv" className="border border-gray-300 p-2 rounded-lg text-sm cursor-pointer" onChange={(e) => setEditVideoFile(e.target.files?.[0] || null)} />
                    </div>

                    <div className="flex flex-col gap-1.5 pt-4 border-t border-gray-200">
                        <Label>Append Additional PDFs (Optional)</Label>
                        <input type="file" accept="application/pdf" multiple className="border border-gray-300 p-2 rounded-lg text-sm cursor-pointer" onChange={(e) => setEditPdfFiles(Array.from(e.target.files || []))} />
                    </div>

                    <div className="pt-6 mt-auto">
                        <Button variant="primary" className="w-full py-3.5 cursor-pointer" onClick={handleEditSubmit} isLoading={isAnyVideoMutationPending} disabled={!editData.title}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </SideModal>

            {/* --- 3. ASSIGN STUDENTS MODAL --- */}
            <SideModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} title="Manage Club Members">
                <div className="flex flex-col h-full space-y-6 pr-2 pb-4">

                    {/* Filter Controls */}
                    <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <Label>Select Target Class</Label>
                            <SearchSelect
                                options={classOptions}
                                value={selectedClassId}
                                onChange={(opt: any) => {
                                    setSelectedClassId(opt?.value || '');
                                    setSelectedSectionId(''); // Reset section when class changes
                                }}
                            />
                        </div>

                        {hasSections && (
                            <div key={selectedClassId} className="flex flex-col gap-1.5 animate-in fade-in">
                                <Label>Select Section <span className="text-danger">*</span></Label>
                                <SearchSelect
                                    options={sectionOptions}
                                    value={selectedSectionId}
                                    onChange={(opt: any) => setSelectedSectionId(opt?.value || '')}
                                />
                            </div>
                        )}

                        {/* Bulk Action Button */}
                        {canFetchStudents && allStudents.length > 0 && (
                            <div className="pt-3 border-t border-border mt-2">
                                <Button
                                    variant="outline"
                                    className="w-full text-xs font-bold cursor-pointer border-primary/30 text-primary"
                                    onClick={handleClassToggle}
                                    isLoading={toggleClassMutation.isPending}
                                >
                                    <i className="fas fa-sync-alt mr-2"></i> Toggle Entire Class Enrollment
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Student List View */}
                    <div className="flex-1 flex flex-col min-h-0 bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-gray-50 border-b border-border p-3 px-4 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                                {!canFetchStudents ? "Currently Enrolled" : "Class Search Results"}
                            </h3>
                            {!canFetchStudents && clubData?.studentId && (
                                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                    {clubData.studentId.length}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">

                            {/* --- DEFAULT VIEW: Show already enrolled students --- */}
                            {!canFetchStudents ? (
                                clubData?.studentId && clubData.studentId.length > 0 ? (
                                    clubData.studentId.map((student: any) => (
                                        <div key={student._id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors shadow-sm">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-800">{student.studentName}</span>
                                                <span className="text-[10px] text-gray-400 font-medium">ID: {student.srId || "N/A"}</span>
                                            </div>
                                            <button
                                                onClick={() => handleStudentToggle(student._id, true)}
                                                disabled={isAnyStudentMutationPending}
                                                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center py-10">
                                        <i className="fas fa-users-slash text-3xl mb-2 opacity-50"></i>
                                        <p className="text-xs font-bold text-gray-500">No students enrolled yet.</p>
                                        <p className="text-[10px] mt-1">Select a class above to start adding members.</p>
                                    </div>
                                )
                            ) :

                                /* --- SEARCH VIEW: Show results from API --- */
                                isStudentsLoading ? (
                                    <div className="flex justify-center py-10"><i className="fas fa-circle-notch fa-spin text-primary text-xl"></i></div>
                                ) : allStudents.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500 text-sm">No students found in this selection.</div>
                                ) : (
                                    <>
                                        {allStudents.map((student: any) => {
                                            const isEnrolled = enrolledStudentIds.includes(student._id);
                                            return (
                                                <div key={student._id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors shadow-sm">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-800">{student.studentName}</span>
                                                        <span className="text-[10px] text-gray-400 font-medium">ID: {student.srId || "N/A"}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleStudentToggle(student._id, isEnrolled)}
                                                        disabled={isAnyStudentMutationPending}
                                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${isEnrolled
                                                            ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                                                            : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                                            }`}
                                                    >
                                                        {isEnrolled ? 'Remove' : 'Add'}
                                                    </button>
                                                </div>
                                            );
                                        })}

                                        {hasNextStudents && (
                                            <div className="flex justify-center pt-4 pb-2">
                                                <button
                                                    onClick={() => fetchNextStudents()}
                                                    disabled={isFetchingNextStudents}
                                                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                                                >
                                                    {isFetchingNextStudents ? "Loading..." : "Load More Students"}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                        </div>
                    </div>
                </div>
            </SideModal>

        </div>
    );
}