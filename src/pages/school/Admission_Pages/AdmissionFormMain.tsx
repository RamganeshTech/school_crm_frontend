import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../features/store/store';
import { useDeleteAdmissionForm, useGenerateAdmissionLink, useGetInfiniteAdmissionForms } from '../../../api_services/schoolConfig_api/admissionFormApi';
import { useGetSchoolById } from '../../../api_services/schoolConfig_api/schoolapi';
import { toast } from '../../../shared/ui/ToastContext';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { TableContainer, TBody, Td, Th, THead, Tr } from '../../../shared/ui/TableLayout';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SideModal } from '../../../shared/ui/SideModal';



export default function AdmissionFormMain() {
    // Check if we are viewing a single form inside the nested route
    // const isSingleView = useMatch('*/admission-form/single/:id');
    const location = useLocation()
    const navigate = useNavigate();

    const { schoolId, } = useSelector((state: RootState) => state.auth);

    const { data: schoolData } = useGetSchoolById(schoolId!);


    const currentAcademicYear = schoolData?.currentAcademicYear || "";

    // --- State ---
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: 'All',
        search: '',
        startDate: '',
        endDate: ''
    });

    const [debouncedSearch, setDebouncedSearch] = useState('');
    // 🌟 Modal State for the Generated Link
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [newLinkData, setNewLinkData] = useState({ url: '', formNumber: '', id: '' });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(filters.search), 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    // --- API Hooks ---
    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        refetch,
        fetchNextPage
    } = useGetInfiniteAdmissionForms({
        schoolId: schoolId!,
        academicYear: currentAcademicYear!,
        status: filters.status,
        search: debouncedSearch,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: "20"
    });

    const generateLinkMutation = useGenerateAdmissionLink();
    const deleteMutation = useDeleteAdmissionForm();

    // Flatten pages into a single array
    const allForms = data?.pages.flatMap(page => page.forms) || [];

    // --- Handlers ---
   const handleGenerateLink = async () => {
        try {
            const res = await generateLinkMutation.mutateAsync({ schoolId: schoolId! });
            
            // 🌟 Build the public link using the environment variable or fallback to window origin
            const baseUrl = import.meta.env.VITE_APP_FRONTEND_URL || window.location.origin;
            const publicUrl = `${baseUrl}/public/apply/admission-form/single/${res.data.id}`;
            
            // Open the modal instead of just silently copying to clipboard
            setNewLinkData({
                url: publicUrl,
                formNumber: res.data.formNumber,
                id: res.data.id
            });
            setIsLinkModalOpen(true);
            refetch();

        } catch (error: any) {
            toast.error(error.message || "Failed to generate link");
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(newLinkData.url);
            toast.success("Link copied to clipboard!");
        } catch (err) {
            toast.error("Failed to copy link.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this admission form?")) return;
        try {
            await deleteMutation.mutateAsync({ id, schoolId: schoolId! });
            refetch()
            toast.success("Form deleted successfully.");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Infinite Scroll Handler for the Table
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        // Trigger fetch when user is 1.5 screen heights away from the bottom
        if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };



    const isChild = location.pathname.includes("single")
    // 🌟 If we are on the single view route, ONLY render the Outlet
    if (isChild) {
        return <Outlet />;
    }

    return (
        <div className="w-full h-full flex flex-col gap-3 bg-background overflow-hidden animate-in fade-in duration-300">

            {/* FLAT HEADER */}
            <header className="shrink-0 px-4 lg:px-6 py-2 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface z-10 shadow-sm">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-user-graduate text-primary"></i>
                        Admission Forms
                    </h1>
                    <p className="text-xs lg:text-sm text-muted mt-1">Manage applications and generate public enrollment links.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        className="lg:hidden flex-1 sm:flex-none justify-center"
                        leftIcon="fas fa-filter"
                        onClick={() => setIsMobileFilterOpen(true)}
                    >
                        Filters
                    </Button>
                    <Button
                        variant="primary"
                        className="flex-1 sm:flex-none justify-center"
                        leftIcon="fas fa-link"
                        onClick={handleGenerateLink}
                        isLoading={generateLinkMutation.isPending}
                    >
                        Generate Blank Link
                    </Button>
                </div>
            </header>

            {/* MAIN LAYOUT */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

                {/* MOBILE OVERLAY */}
                {isMobileFilterOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />
                )}

                {/* 30% LEFT: FILTERS PANE */}
                <aside className={`
                    fixed inset-y-0 left-0 z-50 w-[280px] bg-surface p-4 flex flex-col gap-6 shadow-2xl transition-transform duration-300 ease-in-out
                    lg:static lg:w-[30%] lg:shrink-0 lg:border-r lg:border-border lg:bg-surface/50 lg:p-4 lg:shadow-none lg:translate-x-0
                    ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}
                    overflow-y-auto custom-scrollbar
                `}>
                    <div className="flex items-center justify-between lg:block">
                        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                            <i className="fas fa-filter text-primary"></i> Filter Applications
                        </h2>
                        <button
                            className="lg:hidden text-muted hover:text-danger p-1"
                            onClick={() => setIsMobileFilterOpen(false)}
                        >
                            <i className="fas fa-xmark text-xl"></i>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <Input
                            id="search"
                            type="text"
                            label="Search by Name/Phone"
                            placeholder="e.g. John Doe, 9876543210"
                            leftIcon="fas fa-search"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-muted">Application Status</label>
                            <select
                                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg outline-none focus:border-primary transition-colors"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="All">All Applications</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                id="startDate"
                                type="date"
                                label="From Date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            />
                            <Input
                                id="endDate"
                                type="date"
                                label="To Date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            />
                        </div>

                        <Button
                            variant="primary"
                            className="w-full lg:hidden mt-4"
                            onClick={() => setIsMobileFilterOpen(false)}
                        >
                            Apply Filters
                        </Button>
                    </div>
                </aside>

                {/* 70% RIGHT: TABLE LIST PANE */}
                <main className="flex-1 w-full lg:w-[70%] px-2 lg:px-3 py-2 flex flex-col overflow-hidden bg-background">

                    {isLoading ? (
                        <div className="flex flex-1 justify-center items-center">
                            <i className="fas fa-circle-notch fa-spin text-3xl text-primary"></i>
                        </div>
                    ) : allForms.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center text-muted">
                            <i className="fas fa-file-signature text-4xl opacity-30 mb-3"></i>
                            <h2 className="text-lg font-bold text-foreground">No Forms Found</h2>
                            <p className="text-sm">Adjust your filters or generate a new blank link.</p>
                        </div>
                    ) : (
                        <TableContainer onScroll={handleScroll} className="h-full custom-scrollbar">
                            <THead className="sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <Th>S.No</Th>
                                    <Th>Form No</Th>
                                    <Th>Student / Details</Th>
                                    <Th>Parent Contact</Th>
                                    {/* <Th>Sought For</Th> */}
                                    <Th>Status</Th>
                                    <Th className="text-center pr-6">Action</Th>
                                </tr>
                            </THead>
                            <TBody>
                                <>
                                    {allForms.map((form: any, idx: number) => (
                                        <Tr key={form._id}>
                                            <Td className="font-medium whitespace-nowrap">
                                                {idx + 1}
                                            </Td>
                                            <Td className="font-medium whitespace-nowrap">
                                                {form.formNumber}
                                            </Td>

                                            {/* Merged Student Name & Date to save space */}
                                            <Td>
                                                <div className="flex flex-col">
                                                    <span className={`font-semibold ${form.isSubmitted ? 'text-foreground' : 'text-muted italic'}`}>
                                                        {form.isSubmitted ? form.studentName : "Pending Submission"}
                                                    </span>
                                                    <span className="text-[10px] text-muted">
                                                        {new Date(form.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </Td>

                                            <Td>
                                                <div className="flex flex-col text-sm">
                                                    <span className={form.isSubmitted ? 'text-foreground' : 'text-muted'}>
                                                        {form.isSubmitted ? form.fatherName : "-"}
                                                    </span>
                                                    <span className="text-[10px] text-muted">
                                                        {form.isSubmitted ? form.phone : ""}
                                                    </span>
                                                </div>
                                            </Td>

                                            {/* <Td>
                                                <span className="text-sm font-medium">
                                                    {form.isSubmitted ? form.admissionSoughtFor : "-"}
                                                </span>
                                            </Td> */}

                                            <Td>
                                                <span className={`px-2.5 py-1 text-[10px] rounded uppercase font-bold tracking-wider ${form.status === 'Approved' ? 'bg-success/10 text-success' :
                                                        form.status === 'Rejected' ? 'bg-danger/10 text-danger' :
                                                            'bg-warning/10 text-warning'
                                                    }`}>
                                                    {form.status}
                                                </span>
                                            </Td>

                                            <Td>
                                                <div className="flex items-center justify-end gap-2 pr-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`single/${form._id}`)}
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        className="!px-2.5"
                                                        onClick={() => handleDelete(form._id)}
                                                        isLoading={deleteMutation.isPending && deleteMutation.variables?.id === form._id}
                                                        title="Delete Form"
                                                    >
                                                        <i className="fas fa-trash-alt text-xs"></i>
                                                    </Button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))}

                                    {/* Infinite Scroll Loading Indicator Row */}
                                    {isFetchingNextPage && (
                                        <tr>
                                            <td colSpan={7} className="py-6 text-center bg-surface/50">
                                                <i className="fas fa-circle-notch fa-spin text-primary text-xl"></i>
                                                <p className="text-xs text-muted mt-2">Loading more applications...</p>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            </TBody>
                        </TableContainer>
                    )}
                </main>
            </div>


            {/* 🌟 NEW: Link Generation SideModal */}
            <SideModal 
                isOpen={isLinkModalOpen} 
                onClose={() => setIsLinkModalOpen(false)} 
                title="Admission Link Generated"
            >
                <div className="flex flex-col h-full space-y-6">
                    <div className="flex flex-col items-center justify-center text-center py-6">
                        <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-4 border border-success/20">
                            <i className="fas fa-check text-3xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Form #{newLinkData.formNumber} Created!</h3>
                        <p className="text-sm text-muted mt-2">
                            A blank admission form has been registered. Share the link below with the parent to complete the application.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground">Public Application Link:</label>
                        <div className="flex items-center gap-2">
                            <Input 
                                id="generatedUrl" 
                                value={newLinkData.url} 
                                readOnly 
                                className="flex-1 bg-surface font-mono text-sm"
                            />
                        </div>
                        <Button 
                            variant="primary" 
                            fullWidth 
                            leftIcon="fas fa-copy" 
                            onClick={copyToClipboard}
                        >
                            Copy Link
                        </Button>
                    </div>

                    <div className="mt-auto pt-6 border-t border-border flex flex-col gap-3">
                        <Button 
                            variant="outline" 
                            fullWidth 
                            leftIcon="fas fa-external-link-alt"
                            onClick={() => {
                                setIsLinkModalOpen(false);
                                navigate(`single/${newLinkData.id}`);
                            }}
                        >
                            Open Form Dashboard Status
                        </Button>
                        <Button 
                            variant="ghost" 
                            fullWidth 
                            onClick={() => setIsLinkModalOpen(false)}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </SideModal>

        </div>
    );
}