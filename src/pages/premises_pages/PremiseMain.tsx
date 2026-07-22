// import React, { useState, useMemo } from "react";
// import { useAuthData } from "../../hooks/useAuthData";
// import { useRoleCheck } from "../../hooks/useRoleCheck";
// import {
//     useGetPremises,
//     useCreatePremises,
//     useUpdatePremises,
//     useDeletePremises,
//     type IPremises
// } from "../../api_services/eb_api/premisesApi";
// import { Input } from "../../shared/ui/Input";
// import { Button } from "../../shared/ui/Button";
// import { Card } from "../../shared/ui/Card";
// import { TableContainer, TBody, Td, Th, THead, Tr } from "../../shared/ui/TableLayout";
// import { toast } from "../../shared/ui/ToastContext";

// export const PremiseMain: React.FC = () => {
//     // 1. Auth & Role Hooks (Mocked based on your context)
//     const { schoolId } = useAuthData();
//     const { isAccountant, isParent, isVicePrincipal, isTeacher } = useRoleCheck();


//     // Permissions check based on your logic
//     const canModify = !isAccountant && !isParent && !isVicePrincipal && !isTeacher;

//     // 2. React Query Hooks
//     const { data: premisesList = [], isLoading, isError } = useGetPremises(schoolId!);
//     const { mutateAsync: createPremises, isPending: isCreating } = useCreatePremises();
//     const { mutateAsync: updatePremises, isPending: isUpdating } = useUpdatePremises();
//     const { mutateAsync: deletePremises, isPending: isDeleting } = useDeletePremises();

//     // 3. Local State
//     const [searchQuery, setSearchQuery] = useState("");
//     const [isFormOpen, setIsFormOpen] = useState(false);
//     const [editingItem, setEditingItem] = useState<IPremises | null>(null);
//     const [formData, setFormData] = useState({ premisesName: "", isActive: true });

//     // 4. Derived State (Filtering)
//     const filteredPremises = useMemo(() => {
//         if (!searchQuery) return premisesList;
//         return premisesList.filter(p =>
//             p.premisesName.toLowerCase().includes(searchQuery.toLowerCase())
//         );
//     }, [premisesList, searchQuery]);

//     // 5. Handlers
//     const openCreateForm = () => {
//         setEditingItem(null);
//         setFormData({ premisesName: "", isActive: true });
//         setIsFormOpen(true);
//     };

//     const openEditForm = (item: IPremises) => {
//         setEditingItem(item);
//         setFormData({ premisesName: item.premisesName, isActive: item.isActive });
//         setIsFormOpen(true);
//     };

//     const closeForm = () => {
//         setIsFormOpen(false);
//         setEditingItem(null);
//         setFormData({ premisesName: "", isActive: true });
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         try {


//             e.preventDefault();

//             if (editingItem) {
//                 await updatePremises(
//                     {
//                         schoolId: schoolId!,
//                         premisesId: editingItem._id,
//                         payload: formData
//                     },
//                 );
//                 toast.success("updated successfully")
//                 closeForm()
//             } else {
//                 await createPremises(
//                     {
//                         schoolId: schoolId!,
//                         payload: { premisesName: formData.premisesName }
//                     }
//                 );
//                 toast.success("created successfully")
//                 closeForm()
//             }
//         } catch (error: any) {
//             toast.error(error?.message || "Operation Failed.");
//         }
//     };

//     const handleDelete = async (premisesId: string) => {
//         try {
//             if (window.confirm("Are you sure you want to delete this premises?")) {
//                 await deletePremises({ schoolId: schoolId!, premisesId });
//             }
//         } catch (error: any) {
//             toast.error(error?.message || "Operation Failed.");
//         }
//     };

//     return (
//         <div className="h-full bg-mainBg p-4 font-sans">
//             <div className="max-w-7xl mx-auto space-y-6">

//                 {/* HEADER SECTION (Matched to your exact snippet structure) */}
//                 <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-default pb-4">
//                     <div>
//                         <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
//                             <i className="fas fa-building text-primary"></i>
//                             Premises Configuration
//                         </h1>
//                         <p className="text-sm text-muted mt-1 font-normal">
//                             Manage buildings, blocks, and campus premises for your school.
//                         </p>
//                     </div>

//                     <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
//                         <Input
//                             id="searchPremises"
//                             placeholder="Search premises..."
//                             leftIcon="fas fa-search"
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                             wrapperClassName="w-full sm:w-64"
//                         />
//                         {canModify && (
//                             <Button
//                                 onClick={openCreateForm}
//                                 leftIcon="fas fa-plus"
//                                 variant="primary"
//                                 className="w-full sm:w-auto whitespace-nowrap shrink-0 font-medium"
//                             >
//                                 Add New Premises
//                             </Button>
//                         )}
//                     </div>
//                 </header>

//                 {/* INLINE FORM (Atlassian Style - Clean and contextual) */}
//                 {isFormOpen && canModify && (
//                     <Card className="bg-surface border border-border-default shadow-sm p-5 animate-in fade-in slide-in-from-top-4">
//                         <div className="flex items-center justify-between mb-4">
//                             <h2 className="text-lg font-medium text-foreground">
//                                 {editingItem ? "Edit Premises" : "Create New Premises"}
//                             </h2>
//                             <button onClick={closeForm} className="text-muted hover:text-foreground transition-colors">
//                                 <i className="fas fa-times"></i>
//                             </button>
//                         </div>

//                         <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
//                             <div className="w-full sm:flex-1">
//                                 <label className="block text-sm text-foreground mb-1.5 font-medium">
//                                     Premises Name <span className="text-danger">*</span>
//                                 </label>
//                                 <Input
//                                     required
//                                     autoFocus
//                                     placeholder="e.g., Main Block, Science Wing..."
//                                     value={formData.premisesName}
//                                     onChange={(e) => setFormData({ ...formData, premisesName: e.target.value })}
//                                     className="w-full"
//                                 />
//                             </div>

//                             {editingItem && (
//                                 <div className="w-full sm:w-auto flex items-center h-[42px] px-2">
//                                     <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
//                                         <input
//                                             type="checkbox"
//                                             className="w-4 h-4 accent-primary rounded border-border-default"
//                                             checked={formData.isActive}
//                                             onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
//                                         />
//                                         Active Status
//                                     </label>
//                                 </div>
//                             )}

//                             <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
//                                 <Button
//                                     type="button"
//                                     variant="outline"
//                                     onClick={closeForm}
//                                     className="w-full sm:w-auto border-border-default text-foreground font-medium"
//                                 >
//                                     Cancel
//                                 </Button>
//                                 <Button
//                                     type="submit"
//                                     variant="primary"
//                                     disabled={isCreating || isUpdating}
//                                     className="w-full sm:w-auto font-medium"
//                                 >
//                                     {isCreating || isUpdating ? (
//                                         <i className="fas fa-spinner fa-spin mr-2"></i>
//                                     ) : (
//                                         <i className="fas fa-check mr-2"></i>
//                                     )}
//                                     {editingItem ? "Save Changes" : "Create"}
//                                 </Button>
//                             </div>
//                         </form>
//                     </Card>
//                 )}

//                 {/* DATA GRID */}
//                 {/* TABLE LAYOUT */}
//                 <div className="bg-surface border border-border-default rounded-lg shadow-sm overflow-hidden flex flex-col">
//                     <TableContainer className="h-full overflow-y-auto">
//                         <THead className="sticky top-0 z-10 after:absolute after:bottom-0 after:left-0 after:right-0 after:border-b after:border-border-default">
//                             <tr>
//                                 <Th className="w-16 text-center font-bold">S.No</Th>
//                                 <Th className="font-bold">Premises Name</Th>
//                                 <Th className="font-bold">Status</Th>
//                                 {canModify && <Th className="text-center font-bold w-28">Actions</Th>}
//                             </tr>
//                         </THead>
//                         <TBody>
//                             {isLoading ? (
//                                 <tr>
//                                     <td colSpan={canModify ? 4 : 3} className="py-16 text-center">
//                                         <div className="flex flex-col items-center justify-center">
//                                             <i className="fas fa-circle-notch fa-spin text-primary text-3xl mb-4"></i>
//                                             <p className="text-muted text-sm font-medium">Loading premises...</p>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ) : isError ? (
//                                 <tr>
//                                     <td colSpan={canModify ? 4 : 3} className="py-16 text-center">
//                                         <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 mx-auto max-w-md">
//                                             <p className="text-danger font-medium">Failed to load premises. Please try again.</p>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ) : filteredPremises.length === 0 ? (
//                                 <tr>
//                                     <td colSpan={canModify ? 4 : 3} className="py-16 text-center">
//                                         <div className="flex flex-col items-center justify-center">
//                                             <i className="fas fa-building text-4xl text-border-default mb-3"></i>
//                                             <h3 className="text-base font-medium text-foreground">No premises found</h3>
//                                             <p className="text-sm text-muted mt-1">
//                                                 {searchQuery ? "Try adjusting your search criteria." : "Get started by adding a new premises."}
//                                             </p>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 filteredPremises.map((item, index) => (
//                                     <Tr key={item._id} className="group hover:bg-sub-header/60 transition-colors border-b border-border-soft last:border-0">
//                                         <Td className="text-center font-medium text-muted">
//                                             {index + 1}
//                                         </Td>
//                                         <Td className="font-medium text-foreground">
//                                             <div className="flex items-center gap-2">
//                                                 <i className="fas fa-map-marker-alt text-primary-soft text-sm"></i>
//                                                 {item.premisesName}
//                                             </div>
//                                         </Td>
//                                         <Td>
//                                             <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${item.isActive
//                                                 ? "bg-success/10 text-success border border-success/20"
//                                                 : "bg-muted/10 text-muted border border-muted/20"
//                                                 }`}>
//                                                 {item.isActive ? "Active" : "Inactive"}
//                                             </span>
//                                         </Td>
//                                         {canModify && (
//                                             <Td className="text-center">
//                                                 <div className="flex items-center justify-center gap-1">
//                                                     <Button
//                                                         variant="ghost"
//                                                         className="h-8 w-8 p-0 text-foreground hover:text-primary hover:bg-primary-soft/20 rounded-md"
//                                                         onClick={() => openEditForm(item)}
//                                                         title="Edit Premises"
//                                                     >
//                                                         <i className="fas fa-pen text-sm"></i>
//                                                     </Button>
//                                                     <Button
//                                                         variant="ghost"
//                                                         className="h-8 w-8 p-0 text-danger hover:bg-danger/10 rounded-md"
//                                                         onClick={() => handleDelete(item._id)}
//                                                         disabled={isDeleting}
//                                                         title="Delete Premises"
//                                                     >
//                                                         <i className="fas fa-trash-alt text-sm"></i>
//                                                     </Button>
//                                                 </div>
//                                             </Td>
//                                         )}
//                                     </Tr>
//                                 ))
//                             )}
//                         </TBody>
//                     </TableContainer>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default PremiseMain;





import React, { useState, useMemo } from "react";
import { useAuthData } from "../../hooks/useAuthData";
import { useRoleCheck } from "../../hooks/useRoleCheck";
import {
    useGetPremises,
    useDeletePremises,
    type IPremises
} from "../../api_services/eb_api/premisesApi";
import { Input } from "../../shared/ui/Input";
import { Button } from "../../shared/ui/Button";
import { TableContainer, TBody, Td, Th, THead, Tr } from "../../shared/ui/TableLayout";
import { toast } from "../../shared/ui/ToastContext";
import PremisesModal from "./PremisesModal";

export const PremiseMain: React.FC = () => {
    // 1. Auth & Role Hooks
    const { schoolId } = useAuthData();
    const { isAccountant, isParent, isVicePrincipal, isTeacher } = useRoleCheck();

    // Permissions check
    const canModify =  !isAccountant && !isParent && !isVicePrincipal && !isTeacher;

    // 2. React Query Hooks
    const { data: premisesList = [], isLoading, isError } = useGetPremises(schoolId!);
    const { mutateAsync: deletePremises, isPending: isDeleting } = useDeletePremises();

    // 3. Local State
    const [searchQuery, setSearchQuery] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPremises, setSelectedPremises] = useState<IPremises | null>(null);

    // 4. Derived State (Filtering)
    const filteredPremises = useMemo(() => {
        if (!searchQuery) return premisesList;
        return premisesList.filter(p =>
            p.premisesName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.consumerNumber && p.consumerNumber.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [premisesList, searchQuery]);

    // 5. Handlers
    const openCreateForm = () => {
        setSelectedPremises(null);
        setIsFormOpen(true);
    };

    const openEditForm = (item: IPremises) => {
        setSelectedPremises(item);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setSelectedPremises(null);
    };

    const handleDelete = async (premisesId: string) => {
        try {
            if (window.confirm("Are you sure you want to delete this premises?")) {
                await deletePremises({ schoolId: schoolId!, premisesId });
                toast.success("Premises deleted successfully");
            }
        } catch (error: any) {
            toast.error(error?.message || "Operation Failed.");
        }
    };

    return (
        <div className="h-full bg-mainBg p-4 font-sans flex flex-col">
            <div className="max-w-7xl mx-auto space-y-6 w-full flex-1 flex flex-col">

                {/* HEADER SECTION */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-default pb-4 shrink-0">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
                            <i className="fas fa-building text-primary"></i>
                            Premises Configuration
                        </h1>
                        <p className="text-sm text-muted mt-1 font-normal">
                            Manage buildings, blocks, and meter details for your school.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        <Input
                            id="searchPremises"
                            placeholder="Search name or consumer no..."
                            leftIcon="fas fa-search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            wrapperClassName="w-full sm:w-64"
                        />
                        {canModify && (
                            <Button
                                onClick={openCreateForm}
                                leftIcon="fas fa-plus"
                                variant="primary"
                                className="w-full sm:w-auto whitespace-nowrap shrink-0 font-medium"
                            >
                                Add New Premises
                            </Button>
                        )}
                    </div>
                </header>

                {/* DATA GRID / TABLE LAYOUT */}
                <div className="bg-surface border border-border-default rounded-lg shadow-sm overflow-hidden flex flex-col flex-1">
                    <TableContainer className="h-full overflow-y-auto">
                        <THead className="sticky top-0 z-10 bg-sub-header after:absolute after:bottom-0 after:left-0 after:right-0 after:border-b after:border-border-default">
                            <tr>
                                <Th className="w-16 text-center font-bold">S.No</Th>
                                <Th className="font-bold">Premises Details</Th>
                                <Th className="font-bold">Meter & Consumer No</Th>
                                <Th className="font-bold">Sanctioned Load</Th>
                                <Th className="font-bold">Status</Th>
                                {canModify && <Th className="text-center font-bold w-28">Actions</Th>}
                            </tr>
                        </THead>
                        <TBody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={canModify ? 6 : 5} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <i className="fas fa-circle-notch fa-spin text-primary text-3xl mb-4"></i>
                                            <p className="text-muted text-sm font-medium">Loading premises...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : isError ? (
                                <tr>
                                    <td colSpan={canModify ? 6 : 5} className="py-16 text-center">
                                        <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 mx-auto max-w-md">
                                            <p className="text-danger font-medium">Failed to load premises. Please try again.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPremises.length === 0 ? (
                                <tr>
                                    <td colSpan={canModify ? 6 : 5} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <i className="fas fa-building text-4xl text-border-default mb-3"></i>
                                            <h3 className="text-base font-medium text-foreground">No premises found</h3>
                                            <p className="text-sm text-muted mt-1">
                                                {searchQuery ? "Try adjusting your search criteria." : "Get started by adding a new premises."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPremises.map((item, index) => (
                                    <Tr key={item._id} className="group hover:bg-sub-header/60 transition-colors border-b border-border-soft last:border-0">
                                        <Td className="text-center font-medium text-muted">
                                            {index + 1}
                                        </Td>
                                        
                                        {/* Premises Details */}
                                        <Td>
                                            <p className="font-medium text-foreground flex items-center gap-2">
                                                <i className="fas fa-map-marker-alt text-primary text-sm"></i>
                                                {item.premisesName}
                                            </p>
                                            {item.premisesAddress && (
                                                <p className="text-[12px] text-muted mt-0.5 truncate max-w-[200px]" title={item.premisesAddress}>
                                                    {item.premisesAddress}
                                                </p>
                                            )}
                                        </Td>

                                        {/* Meter & Consumer */}
                                        <Td>
                                            <p className="font-medium text-foreground text-[13px]">
                                                {item.consumerNumber || 'N/A'}
                                            </p>
                                            <p className="text-[11px] text-muted mt-0.5">
                                                Loc: {item.meterLocation || 'Not specified'}
                                            </p>
                                        </Td>

                                        {/* Load */}
                                        <Td>
                                            <p className="font-medium text-foreground text-[13px]">
                                                {item.sanctionedLoad ? `${item.sanctionedLoad} kW` : 'N/A'}
                                            </p>
                                        </Td>

                                        {/* Status */}
                                        <Td>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${item.isActive
                                                ? "bg-success/10 text-success border border-success/20"
                                                : "bg-muted/10 text-muted border border-muted/20"
                                                }`}>
                                                {item.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </Td>

                                        {/* Actions */}
                                        {canModify && (
                                            <Td className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-foreground hover:text-primary hover:bg-primary-soft/20 rounded-md"
                                                        onClick={() => openEditForm(item)}
                                                        title="Edit Premises"
                                                    >
                                                        <i className="fas fa-pen text-sm"></i>
                                                    </Button>
                                                    <Button
                                                    size="icon"
                                                        variant="danger"
                                                        // className="text-danger hover:bg-danger/10 rounded-md"
                                                        onClick={() => handleDelete(item._id)}
                                                        disabled={isDeleting}
                                                        title="Delete Premises"
                                                    >
                                                        <i className="fas fa-trash-alt text-sm"></i>
                                                    </Button>
                                                </div>
                                            </Td>
                                        )}
                                    </Tr>
                                ))
                            )}
                        </TBody>
                    </TableContainer>
                </div>
            </div>

            {/* SIDE MODAL FOR CREATE/EDIT */}
            <PremisesModal
                isOpen={isFormOpen}
                onClose={closeForm}
                premisesData={selectedPremises}
                schoolId={schoolId!}
                canEdit={canModify}
            />
        </div>
    );
};

export default PremiseMain;