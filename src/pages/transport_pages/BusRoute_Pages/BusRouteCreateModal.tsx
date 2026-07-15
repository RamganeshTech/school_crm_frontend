import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../features/store/store';

// UI Components
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { SideModal } from '../../../shared/ui/SideModal';
import { toast } from '../../../shared/ui/ToastContext';

// API Hooks
import { useCreateBusRoute } from '../../../api_services/transport_api/busRouteApi';

interface BusRouteCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Internal type for form state handling
interface IStopForm {
    id: string; // Unique UI identifier for React mapping
    stopName: string;
    landmark: string;
    latitude: string;
    longitude: string;
}

export default function BusRouteCreateModal({ isOpen, onClose }: BusRouteCreateModalProps) {
    const { schoolId } = useSelector((state: RootState) => state.auth);
    const createRouteMutation = useCreateBusRoute();

    // --- State Setup ---
    const [routeName, setRouteName] = useState('');
    const [feeAmount, setFeeAmount] = useState('');
    
    // Start with one empty stop by default
    const [stops, setStops] = useState<IStopForm[]>([]);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setRouteName('');
            setFeeAmount('');
            setStops([{ id: Date.now().toString(), stopName: '', landmark: '', latitude: '', longitude: '' }]);
        }
    }, [isOpen]);

    // --- Stop Array Handlers ---
    const addStop = () => {
        setStops(prev => [
            ...prev,
            { id: Date.now().toString(), stopName: '', landmark: '', latitude: '', longitude: '' }
        ]);
    };

    const removeStop = (id: string) => {
        if (stops.length === 1) {
            toast.error("A route must have at least one stop.");
            return;
        }
        setStops(prev => prev.filter(stop => stop.id !== id));
    };

    const handleStopChange = (id: string, field: keyof IStopForm, value: string) => {
        setStops(prev => prev.map(stop => 
            stop.id === id ? { ...stop, [field]: value } : stop
        ));
    };

    // --- Submit Handler ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // 1. Basic Validation
            if (!routeName.trim()) {
                toast.error("Route Name is required.");
                return;
            }
            if (stops.length === 0) {
                toast.error("At least one stop is required.");
                return;
            }

            // 2. Validate individual stops
            for (let i = 0; i < stops.length; i++) {
                if (!stops[i].stopName.trim()) {
                    toast.error(`Stop Name is required for Stop #${i + 1}`);
                    return;
                }
            }

            // 3. Format payload to match backend Schema exactly
            const formattedStops = stops.map((stop, index) => ({
                stopName: stop.stopName.trim(),
                landmark: stop.landmark.trim() || undefined,
                order: index + 1, // Auto-assign order based on array sequence
                latitude: stop.latitude ? Number(stop.latitude) : undefined,
                longitude: stop.longitude ? Number(stop.longitude) : undefined,
            }));

            const payload: any = {
                schoolId: schoolId!,
                routeName: routeName.trim(),
                stops: formattedStops,
            };

            if (feeAmount) {
                payload.feeAmount = Number(feeAmount);
            }

            // 4. Execute API Call
            await createRouteMutation.mutateAsync(payload);
            toast.success("Bus Route Created Successfully!");
            onClose();

        } catch (error: any) {
            toast.error(error.message || "Failed to create bus route.");
        }
    };

    return (
        <SideModal isOpen={isOpen} onClose={onClose} title="Create New Bus Route">
            <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">
                
                {/* Scrollable Content Area */}
                <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-1 pb-4 mt-2">
                    
                    {/* --- 1. Basic Route Details --- */}
                    <div className="bg-surface/50 p-5 rounded-xl border border-border/50 space-y-4">
                        <h4 className="text-sm font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                            <i className="fas fa-info-circle text-muted"></i> Route Information
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                id="routeName"
                                label="Route Name"
                                placeholder="e.g. North City Express"
                                value={routeName}
                                onChange={(e) => setRouteName(e.target.value)}
                                autoFocus
                                required
                            />
                            <Input
                                id="feeAmount"
                                type="number"
                                label="Route Fee Amount (₹)"
                                placeholder="e.g. 1500"
                                value={feeAmount}
                                onChange={(e) => setFeeAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* --- 2. Stops Configuration --- */}
                    <div className="bg-surface/50 p-5 rounded-xl border border-border/50 space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <i className="fas fa-map-marker-alt text-muted"></i> Route Stops
                            </h4>
                            <Button type="button" variant="outline" size="sm" leftIcon="fas fa-plus" onClick={addStop}>
                                Add Stop
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {stops.map((stop, index) => (
                                <div key={stop.id} className="relative p-4 border border-border/60 bg-background rounded-lg shadow-sm">
                                    
                                    {/* Stop Header & Delete Button */}
                                    <div className="flex justify-between items-center mb-3">
                                        <h5 className="text-xs font-bold text-primary uppercase tracking-wider">
                                            Stop #{index + 1}
                                        </h5>
                                        {stops.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => removeStop(stop.id)}
                                                className="text-danger/70 hover:text-danger hover:bg-danger/10 w-6 h-6 rounded flex items-center justify-center transition-colors"
                                                title="Remove Stop"
                                            >
                                                <i className="fas fa-trash-alt text-xs"></i>
                                            </button>
                                        )}
                                    </div>

                                    {/* Stop Inputs */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            id={`stopName_${stop.id}`}
                                            label="Stop Name"
                                            placeholder="e.g. Central Library"
                                            value={stop.stopName}
                                            onChange={(e) => handleStopChange(stop.id, 'stopName', e.target.value)}
                                            required
                                        />
                                        <Input
                                            id={`landmark_${stop.id}`}
                                            label="Landmark"
                                            placeholder="e.g. Near Metro Station"
                                            value={stop.landmark}
                                            onChange={(e) => handleStopChange(stop.id, 'landmark', e.target.value)}
                                        />
                                        <Input
                                            id={`latitude_${stop.id}`}
                                            type="number"
                                            step="any"
                                            label="Latitude (Optional)"
                                            placeholder="e.g. 13.0827"
                                            value={stop.latitude}
                                            onChange={(e) => handleStopChange(stop.id, 'latitude', e.target.value)}
                                        />
                                        <Input
                                            id={`longitude_${stop.id}`}
                                            type="number"
                                            step="any"
                                            label="Longitude (Optional)"
                                            placeholder="e.g. 80.2707"
                                            value={stop.longitude}
                                            onChange={(e) => handleStopChange(stop.id, 'longitude', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- Fixed Footer --- */}
                <div className="mt-auto pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-border shrink-0 bg-background">
                    <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={createRouteMutation.isPending}
                        className="w-full sm:w-auto"
                    >
                        Create Route
                    </Button>
                </div>
            </form>
        </SideModal>
    );
}