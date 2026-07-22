import React, { useState, useMemo } from "react";
import { useAuthData } from "../../../hooks/useAuthData";
import { useRoleCheck } from "../../../hooks/useRoleCheck";
import { useDeleteTariff, useGetTariffs, type ITariff } from "../../../api_services/eb_api/tariffApi";
import { toast } from "../../../shared/ui/ToastContext";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { TableContainer, THead, Th, TBody, Tr, Td } from "../../../shared/ui/TableLayout";
import TariffModal from "./TariffModal";

export const TariffMain: React.FC = () => {
    // 1. Auth & Role Hooks
    const { schoolId } = useAuthData();
    const { isParent, isVicePrincipal, isTeacher } = useRoleCheck();

    // Permissions check
    const canModify =  !isParent && !isVicePrincipal && !isTeacher;

    // 2. React Query Hooks
    const { data: tariffsList = [], isLoading, isError } = useGetTariffs(schoolId!);
    const { mutateAsync: deleteTariff, isPending: isDeleting } = useDeleteTariff();

    // 3. Local State
    const [searchQuery, setSearchQuery] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTariff, setSelectedTariff] = useState<ITariff | null>(null);

    // 4. Derived State (Filtering)
    const filteredTariffs = useMemo(() => {
        if (!searchQuery) return tariffsList;
        return tariffsList.filter(t =>
            t.tariffName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tariffsList, searchQuery]);

    // 5. Handlers
    const openCreateForm = () => {
        setSelectedTariff(null);
        setIsFormOpen(true);
    };

    const openEditForm = (item: ITariff) => {
        setSelectedTariff(item);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setSelectedTariff(null);
    };

    const handleDelete = async (tariffId: string) => {
        try {
            if (window.confirm("Are you sure you want to delete this tariff? This may affect historical calculations if not handled carefully.")) {
                await deleteTariff({ schoolId: schoolId!, tariffId });
                toast.success("Tariff deleted successfully");
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
                            <i className="fas fa-file-invoice text-primary"></i>
                            Tariff Configuration
                        </h1>
                        <p className="text-sm text-muted mt-1 font-normal">
                            Define electricity pricing slabs and fixed charges for campus billing.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        <Input
                            id="searchTariffs"
                            placeholder="Search tariff name..."
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
                                Create Tariff
                            </Button>
                        )}
                    </div>
                </header>

                {/* DATA GRID / TABLE LAYOUT */}
                <div className="bg-surface border border-border-default rounded-lg shadow-sm overflow-hidden flex flex-col flex-1">
                    <TableContainer className="h-full overflow-y-auto">
                        <THead className="sticky top-0 z-10 bg-sub-header after:absolute after:bottom-0 after:left-0 after:right-0 after:border-b after:border-border-default">
                            <tr>
                                <Th className=" text-center font-bold">S.No</Th>
                                <Th className="font-bold">Tariff Plan Name</Th>
                                <Th className="font-bold text-right">Fixed Charge (₹/kW)</Th>
                                <Th className="font-bold text-center">Configured Slabs</Th>
                                {/* <Th className="font-bold">Status</Th> */}
                                {canModify && <Th className="text-center font-bold w-28">Actions</Th>}
                            </tr>
                        </THead>
                        <TBody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={canModify ? 6 : 5} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <i className="fas fa-circle-notch fa-spin text-primary text-3xl mb-4"></i>
                                            <p className="text-muted text-sm font-medium">Loading tariffs...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : isError ? (
                                <tr>
                                    <td colSpan={canModify ? 6 : 5} className="py-16 text-center">
                                        <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 mx-auto max-w-md">
                                            <p className="text-danger font-medium">Failed to load tariffs. Please try again.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTariffs.length === 0 ? (
                                <tr>
                                    <td colSpan={canModify ? 6 : 5} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <i className="fas fa-receipt text-4xl text-border-default mb-3"></i>
                                            <h3 className="text-base font-medium text-foreground">No tariffs found</h3>
                                            <p className="text-sm text-muted mt-1">
                                                {searchQuery ? "Try adjusting your search criteria." : "Create a new tariff to get started."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTariffs.map((item, index) => (
                                    <Tr key={item._id} className="group hover:bg-sub-header/30 transition-colors border-b border-border-soft last:border-0">
                                        <Td className="text-center font-medium text-muted">
                                            {index + 1}
                                        </Td>
                                        
                                        {/* Tariff Name */}
                                        <Td>
                                            <p className="font-medium text-foreground flex items-center gap-2 text-[14px]">
                                                <i className="fas fa-bolt text-primar text-sm"></i>
                                                {item.tariffName}
                                            </p>
                                        </Td>

                                        {/* Fixed Charge */}
                                        <Td className="text-right">
                                            <span className="font-mono font-medium text-[14px] text-foreground">
                                                ₹{item.fixedChargePerKw?.toFixed(2)}
                                            </span>
                                        </Td>

                                        {/* Configured Slabs */}
                                        <Td className="text-center">
                                            <span className="inline-flex items-center justify-center bg-background border border-border-default rounded-full px-2.5 py-0.5 text-[12px] font-medium text-muted">
                                                {item.slabs?.length || 0} Slabs
                                            </span>
                                        </Td>

                                        {/* Status */}
                                        {/* <Td>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${item.isActive
                                                ? "bg-success/10 text-success border border-success/20"
                                                : "bg-muted/10 text-muted border border-muted/20"
                                                }`}>
                                                {item.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </Td> */}

                                        {/* Actions */}
                                        {canModify && (
                                            <Td className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-foreground hover:text-primary hover:bg-primary-soft/20 rounded-md"
                                                        onClick={() => openEditForm(item)}
                                                        title="Edit Tariff"
                                                    >
                                                        <i className="fas fa-pen text-sm"></i>
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="icon"
                                                        // className="h-8 w-8 p-0 text-danger hover:bg-danger/10 rounded-md"
                                                        onClick={() => handleDelete(item._id)}
                                                        disabled={isDeleting}
                                                        title="Delete Tariff"
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
            <TariffModal
                isOpen={isFormOpen}
                onClose={closeForm}
                tariffData={selectedTariff}
                schoolId={schoolId!}
                canEdit={canModify}
            />
        </div>
    );
};

export default TariffMain;