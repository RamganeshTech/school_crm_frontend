import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../features/store/store';

// UI Components
import { Button } from '../../../shared/ui/Button';
import { Input, Label } from '../../../shared/ui/Input';
import { SideModal } from '../../../shared/ui/SideModal';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { toast } from '../../../shared/ui/ToastContext';

// Hooks & APIs
import { useRoleCheck } from '../../../hooks/useRoleCheck';
import {
    useGetSingleBusRoute,
    useUpdateBusRoute,
    useAddBusRouteAssignment,
    useRemoveBusRouteAssignment,
    useUpdateBusRouteAssignment,
    // type IStops
} from '../../../api_services/transport_api/busRouteApi';
import { useGetBusDropDown } from '../../../api_services/transport_api/busApi';
import { useGetDriverDropDown } from '../../../api_services/transport_api/driverApi';
import { formatTime12Hour } from '../../../utils/utils';
// Assuming you have a generic driver dropdown hook. If not, replace with your actual hook or input.
// import { useGetAllDrivers } from '../../../api_services/transport_api/driverApi';

export default function BusRouteSingle() {
    const { routeId } = useParams();
    const navigate = useNavigate();
    const { schoolId } = useSelector((state: RootState) => state.auth);
    const { isAdmin, isCorrespondent } = useRoleCheck();
    const canEdit = isAdmin || isCorrespondent;

    // Modals State
    const [isEditRouteOpen, setIsEditRouteOpen] = useState(false);
    // const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false); // Renamed for generic use
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null); // Tracks edit data


    // --- API Hooks ---
    const { data: route, isLoading, isError } = useGetSingleBusRoute(routeId);
    const removeAssignmentMutation = useRemoveBusRouteAssignment();

    const handleRemoveAssignment = async (assignmentId: string) => {
        if (window.confirm("Are you sure you want to remove this bus assignment?")) {
            try {
                await removeAssignmentMutation.mutateAsync({
                    routeId: routeId!,
                    payload: { schoolId: schoolId!, assignmentId }
                });
                toast.success("Assignment removed successfully!");
            } catch (error: any) {
                toast.error(error.message || "Failed to remove assignment.");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full">
                <i className="fas fa-circle-notch fa-spin text-primary text-4xl mb-4"></i>
                <p className="text-muted font-medium">Loading Route Details...</p>
            </div>
        );
    }

    if (isError || !route) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="bg-danger/10 border border-danger/20 p-6 rounded-xl max-w-md text-center">
                    <i className="fas fa-exclamation-triangle text-danger text-3xl mb-3"></i>
                    <h3 className="text-lg font-bold text-foreground">Route Not Found</h3>
                    <p className="text-muted text-sm mt-2 mb-4">The route you are looking for does not exist or has been deleted.</p>
                    <Button onClick={() => navigate('..')} variant="outline">Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col p-2 space-y-4 overflow-hidden">
            {/* --- Header Section --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 px-2 border-b border-border pb-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('..')}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-surface border border-border text-muted hover:text-foreground hover:bg-background transition-colors"
                    >
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2">
                            {route.routeName}
                            {route.routeNo && <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-mono ml-2">ID: {route.routeNo}</span>}
                        </h1>
                        <p className="text-xs lg:text-sm text-muted mt-1">
                            Fee: <span className="font-semibold text-foreground">₹{route.feeAmount || 'Not Set'}</span> • {route.stops?.length || 0} Stops
                        </p>
                    </div>
                </div>

                {canEdit && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" className="flex-1 sm:flex-none justify-center" leftIcon="fas fa-edit" onClick={() => setIsEditRouteOpen(true)}>
                            Edit Route
                        </Button>
                        <Button variant="primary" className="flex-1 sm:flex-none justify-center" leftIcon="fas fa-plus" onClick={() => {
                            setSelectedAssignment(null);
                            setIsAssignmentModalOpen(true);
                        }}>
                            Assign Bus
                        </Button>
                    </div>
                )}
            </div>

            {/* --- Main Content Layout --- */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* LEFT PANEL: Stops Timeline (35%) */}
                    <div className="w-full lg:w-[35%] bg-surface border border-border rounded-xl shadow-sm p-5 h-fit">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3 mb-5">
                            <i className="fas fa-map-marker-alt text-primary"></i> Route Journey
                        </h3>

                        <div className="relative border-l-2 border-primary/20 ml-3 space-y-6 pb-2">
                            {route.stops && route.stops.length > 0 ? route.stops.map((stop: any, index: number) => (
                                <div key={stop._id || index} className="relative pl-6">
                                    {/* Timeline Dot */}
                                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-background ${index === 0 ? 'bg-success' : index === route.stops.length - 1 ? 'bg-danger' : 'bg-primary'}`}></div>

                                    <h4 className="text-sm font-bold text-foreground leading-none">{stop.stopName}</h4>
                                    {stop.landmark && (
                                        <p className="text-xs text-muted mt-1 flex items-center gap-1">
                                            <i className="fas fa-building opacity-50"></i> {stop.landmark}
                                        </p>
                                    )}
                                    {(stop.latitude && stop.longitude) && (
                                        <p className="text-[10px] text-muted/70 font-mono mt-1">
                                            {stop.latitude}, {stop.longitude}
                                        </p>
                                    )}
                                </div>
                            )) : (
                                <p className="text-sm text-muted italic pl-4">No stops configured for this route.</p>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: Assignments (65%) */}
                    <div className="w-full lg:w-[65%] space-y-4">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <i className="fas fa-bus text-primary"></i> Active Assignments
                        </h3>

                        {route.assignments && route.assignments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {route.assignments.map((assignment: any, index: number) => (
                                    <div key={index} className="bg-surface border border-border rounded-xl p-4 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                                            {assignment.shift} Shift
                                        </div>

                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                                                    <i className="fas fa-bus-alt"></i>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted uppercase">Assigned Bus</p>
                                                    <p className="text-sm font-bold text-foreground pr-2">
                                                        {assignment.busId?.registrationNo || assignment.busId || 'Unknown Bus'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* ACTION BUTTONS */}
                                            {canEdit && (
                                                <div className="flex items-center gap-1 mt-1 mr-1 shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedAssignment(assignment);
                                                            setIsAssignmentModalOpen(true);
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center rounded bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                                                        title="Edit Assignment"
                                                    >
                                                        <i className="fas fa-edit text-xs"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveAssignment(assignment._id)}
                                                        disabled={removeAssignmentMutation.isPending}
                                                        className="w-8 h-8 flex items-center justify-center rounded bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors"
                                                        title="Remove Assignment"
                                                    >
                                                        {removeAssignmentMutation.isPending && removeAssignmentMutation.variables?.payload.assignmentId === assignment._id
                                                            ? <i className="fas fa-spinner fa-spin text-xs"></i>
                                                            : <i className="fas fa-trash-alt text-xs"></i>
                                                        }
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-muted mb-4 pb-4 border-b border-border/50">
                                            <i className="fas fa-id-card"></i>
                                            <span>Driver ID: <span className="font-semibold text-foreground">{assignment.driverId?.name || assignment.driverId || 'N/A'}</span></span>
                                        </div>

                                        {/* Stop Timings Preview */}
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-muted uppercase mb-2">Stop Timings</p>
                                            <div className="max-h-[120px] overflow-y-auto custom-scrollbar pr-2 space-y-1.5">
                                                {assignment.stopTimings?.map((timing: any, tIdx: number) => (
                                                    <div key={tIdx} className="flex justify-between items-center text-xs bg-background border border-border/50 px-2 py-1.5 rounded">
                                                        <span className="text-foreground truncate pr-2" title={timing.stopName}>{timing.stopName}</span>
                                                        <span className="font-mono font-semibold text-primary shrink-0">
                                                            {formatTime12Hour(timing.time)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-surface border border-border rounded-xl p-10 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-3 text-muted text-2xl shadow-sm">
                                    <i className="fas fa-clipboard-list"></i>
                                </div>
                                <h3 className="text-md font-medium text-foreground mb-1">No Buses Assigned</h3>
                                <p className="text-muted text-sm max-w-sm mb-4">
                                    There are currently no buses running on this route. Assign a bus and driver to generate the manifest.
                                </p>
                                {canEdit && (
                                    <Button variant="outline" size="sm" leftIcon="fas fa-plus"

                                        onClick={() => {
                                            setSelectedAssignment(null);
                                            setIsAssignmentModalOpen(true);
                                        }}>
                                        Assign Bus Now
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Modals */}
            {/* {isEditRouteOpen && ( */}
            <EditRouteModal
                isOpen={isEditRouteOpen}
                onClose={() => setIsEditRouteOpen(false)}
                routeData={route}
            />
            {/* )} */}

            {/* {isAddAssignmentOpen && ( */}
            <AssignmentModal
                isOpen={isAssignmentModalOpen}
                onClose={() => setIsAssignmentModalOpen(false)}
                routeData={route}
                assignmentData={selectedAssignment}
            />
            {/* )} */}
        </div>
    );
}

// ============================================================================
// 1. EDIT ROUTE MODAL (Inline Component)
// ============================================================================
function EditRouteModal({ isOpen, onClose, routeData }: { isOpen: boolean, onClose: () => void, routeData: any }) {
    const { schoolId } = useSelector((state: RootState) => state.auth);
    const updateRouteMutation = useUpdateBusRoute();

    const [routeName, setRouteName] = useState(routeData.routeName || '');
    const [feeAmount, setFeeAmount] = useState(routeData.feeAmount?.toString() || '');

    // Map existing stops for editing
    const [stops, setStops] = useState<any[]>(() => {
        if (routeData.stops && routeData.stops.length > 0) {
            return routeData.stops.map((s: any) => ({
                id: s._id || Date.now().toString() + Math.random(),
                stopName: s.stopName || '',
                landmark: s.landmark || '',
                latitude: s.latitude?.toString() || '',
                longitude: s.longitude?.toString() || '',
            }));
        }
        return [{ id: Date.now().toString(), stopName: '', landmark: '', latitude: '', longitude: '' }];
    });

    const handleStopChange = (id: string, field: string, value: string) => {
        setStops(prev => prev.map(stop => stop.id === id ? { ...stop, [field]: value } : stop));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!routeName.trim() || stops.length === 0) return toast.error("Name and at least one stop required.");

            const formattedStops = stops.map((stop, index) => ({
                stopName: stop.stopName.trim(),
                landmark: stop.landmark.trim() || undefined,
                order: index + 1,
                latitude: stop.latitude ? Number(stop.latitude) : undefined,
                longitude: stop.longitude ? Number(stop.longitude) : undefined,
            }));

            const payload: any = { schoolId: schoolId!, routeName: routeName.trim(), stops: formattedStops };
            if (feeAmount) payload.feeAmount = Number(feeAmount);

            await updateRouteMutation.mutateAsync({ routeId: routeData._id, payload });
            toast.success("Route Updated Successfully!");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Update Failed.");
        }
    };

    return (
        <SideModal isOpen={isOpen} onClose={onClose} title="Edit Bus Route">
            <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">
                <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-1 pb-4 mt-2">
                    {/* Basic Info */}
                    <div className="bg-surface/50 p-4 rounded-xl border border-border/50 grid grid-cols-1 gap-4">
                        <Input label="Route Name *" value={routeName} onChange={(e) => setRouteName(e.target.value)} required />
                        <Input label="Fee Amount (₹)" type="number" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} />
                    </div>

                    {/* Stops List */}
                    <div className="bg-surface/50 p-4 rounded-xl border border-border/50 space-y-4">
                        <div className="flex justify-between items-center border-b border-border pb-2">
                            <Label>Manage Stops</Label>
                            <Button type="button" variant="outline" size="sm" onClick={() => setStops(prev => [...prev, { id: Date.now().toString(), stopName: '', landmark: '', latitude: '', longitude: '' }])}>Add Stop</Button>
                        </div>
                        {stops.map((stop, index) => (
                            <div key={stop.id} className="p-3 border border-border/60 bg-background rounded-lg relative">
                                <button type="button" onClick={() => stops.length > 1 && setStops(s => s.filter(x => x.id !== stop.id))} className="absolute top-2 right-2 text-danger/70 hover:text-danger">
                                    <i className="fas fa-times"></i>
                                </button>
                                <p className="text-xs font-bold text-primary mb-2">Stop #{index + 1}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Input placeholder="Stop Name *" value={stop.stopName} onChange={(e) => handleStopChange(stop.id, 'stopName', e.target.value)} required />
                                    <Input placeholder="Landmark" value={stop.landmark} onChange={(e) => handleStopChange(stop.id, 'landmark', e.target.value)} />
                                    <Input
                                        type="number"
                                        step="any"
                                        placeholder="Latitude (Optional)"
                                        value={stop.latitude}
                                        onChange={(e) => handleStopChange(stop.id, 'latitude', e.target.value)}
                                    />
                                    <Input
                                        type="number"
                                        step="any"
                                        placeholder="Longitude (Optional)"
                                        value={stop.longitude}
                                        onChange={(e) => handleStopChange(stop.id, 'longitude', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-auto pt-4 flex justify-end gap-3 border-t border-border shrink-0">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" isLoading={updateRouteMutation.isPending}>Save Changes</Button>
                </div>
            </form>
        </SideModal>
    );
}

// ============================================================================
// 2. ADD ASSIGNMENT MODAL (Inline Component)
// ============================================================================
// ============================================================================
// 2. ASSIGNMENT MODAL (Handles both Create & Edit)
// ============================================================================
function AssignmentModal({ isOpen, onClose, routeData, assignmentData }: { isOpen: boolean, onClose: () => void, routeData: any, assignmentData?: any }) {
    const { schoolId } = useSelector((state: RootState) => state.auth);
    const addAssignmentMutation = useAddBusRouteAssignment();
    const updateAssignmentMutation = useUpdateBusRouteAssignment();

    // Dropdown Data
    const { data: busesData } = useGetBusDropDown({ schoolId: schoolId! });
    const busOptions = React.useMemo(() => (Array.isArray(busesData) ? busesData : (busesData?.data || [])).map((b: any) => ({ label: b.registrationNo, value: b._id })), [busesData]);

    const { data: driversData } = useGetDriverDropDown({ schoolId: schoolId! }); // Assumes you added this earlier
    const driverOptions = React.useMemo(() => (Array.isArray(driversData) ? driversData : (driversData?.data || [])).map((d: any) => ({ label: d.name || d.driverName, value: d._id })), [driversData]);

    // Form State (Pre-fill if editing)
    const [busId, setBusId] = useState(assignmentData?.busId?._id || assignmentData?.busId || '');
    const [driverId, setDriverId] = useState(assignmentData?.driverId?._id || assignmentData?.driverId || '');
    const [shift, setShift] = useState(assignmentData?.shift || 'pickup');

    // Initialize stop timings based on current route stops, pre-filling times if editing
    const [stopTimings, setStopTimings] = useState<{ stopName: string, time: string }[]>(() => {
        return routeData.stops?.map((s: any) => {
            const existingTiming = assignmentData?.stopTimings?.find((t: any) => t.stopName === s.stopName || t.stopId === s._id);
            return { stopName: s.stopName, time: existingTiming?.time || '' };
        }) || [];
    });

    // Reset state when modal opens/closes or switches between edit/create
    useEffect(() => {
        if (isOpen) {
            setBusId(assignmentData?.busId?._id || assignmentData?.busId || '');
            setDriverId(assignmentData?.driverId?._id || assignmentData?.driverId || '');
            setShift(assignmentData?.shift || 'pickup');

            setStopTimings(routeData.stops?.map((s: any) => {
                const existingTiming = assignmentData?.stopTimings?.find((t: any) => t.stopName === s.stopName || t.stopId === s._id);
                return { stopName: s.stopName, time: existingTiming?.time || '' };
            }) || []);
        }
    }, [isOpen, assignmentData, routeData]);

    const handleTimeChange = (index: number, val: string) => {
        setStopTimings(prev => {
            const updated = [...prev];
            updated[index].time = val;
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!busId || !driverId) return toast.error("Bus and Driver are mandatory.");

            const missingTime = stopTimings.find(t => !t.time);
            if (missingTime) return toast.error(`Please provide a time for stop: ${missingTime.stopName}`);

            if (assignmentData) {
                // UPDATE Mode
                const payload = {
                    schoolId: schoolId!,
                    assignmentId: assignmentData._id,
                    busId, driverId, shift, stopTimings
                };
                await updateAssignmentMutation.mutateAsync({ routeId: routeData._id, payload });
                toast.success("Assignment Updated Successfully!");
            } else {
                // CREATE Mode
                const payload = {
                    schoolId: schoolId!,
                    assignments: [{ busId, driverId, shift, stopTimings }]
                };
                await addAssignmentMutation.mutateAsync({ routeId: routeData._id, payload });
                toast.success("Assignment Added Successfully!");
            }
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to process assignment.");
        }
    };

    const isPending = addAssignmentMutation.isPending || updateAssignmentMutation.isPending;

    return (
        <SideModal isOpen={isOpen} onClose={onClose} title={assignmentData ? "Edit Bus Assignment" : "Assign Bus to Route"}>
            <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">
                <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-1 pb-4 mt-2">

                    <div className="bg-surface/50 p-4 rounded-xl border border-border/50 grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label>Select Bus *</Label>
                            <SearchSelect options={busOptions} value={busId} onChange={(opt) => setBusId(String(opt.value))} placeholder="Search Bus..." />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Select Driver *</Label>
                            <SearchSelect options={driverOptions} value={driverId} onChange={(opt) => setDriverId(String(opt.value))} placeholder="Search Driver..." />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Shift *</Label>
                            <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={shift} onChange={(e) => setShift(e.target.value)}>
                                <option value="pickup">Pick Up</option>
                                <option value="drop">Drop</option>
                                {/* <option value="Evening">Evening</option>
                                <option value="Night">Night</option> */}
                            </select>
                        </div>
                    </div>

                    <div className="bg-surface/50 p-4 rounded-xl border border-border/50 space-y-4">
                        <Label>Stop Timings Config</Label>
                        <p className="text-xs text-muted">Set the expected arrival time for each stop on this route.</p>
                        <div className="space-y-3">
                            {stopTimings.map((stop, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-4 bg-background border border-border/50 p-2.5 rounded-lg">
                                    <p className="text-sm font-semibold text-foreground truncate flex-1">{stop.stopName}</p>
                                    <input type="time" className="rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-[120px]" value={stop.time} onChange={(e) => handleTimeChange(idx, e.target.value)} required />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-auto pt-4 flex justify-end gap-3 border-t border-border shrink-0">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" isLoading={isPending}>{assignmentData ? "Save Changes" : "Add Assignment"}</Button>
                </div>
            </form>
        </SideModal>
    );
}