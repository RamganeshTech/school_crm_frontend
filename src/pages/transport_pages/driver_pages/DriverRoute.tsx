import React, { useState } from 'react';
import { useGetAssignedRoutesForDriver } from '../../../api_services/transport_api/busRouteApi'; // Adjust import path

interface DriverRouteProps {
    driverId: string;
}

const DriverRoute: React.FC<DriverRouteProps> = ({ driverId }) => {
    const { data: routes, isLoading, isError } = useGetAssignedRoutesForDriver(driverId);
    
    // Tracks collapsed state. Empty object means all routes are OPEN by default.
    // If a route ID is set to true in this object, it means it has been manually collapsed.
    const [collapsedRoutes, setCollapsedRoutes] = useState<Record<string, boolean>>({});

    const toggleRoute = (routeId: string) => {
        setCollapsedRoutes((prev) => ({
            ...prev,
            [routeId]: !prev[routeId],
        }));
    };

    // ─── Loading / Error States ─────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-muted bg-surface rounded-xl border border-border">
                <i className="fas fa-spinner fa-spin text-2xl text-primary mb-2"></i>
                <p className="text-sm font-medium">Loading assigned routes...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-danger bg-danger/10 rounded-xl border border-danger/20">
                <i className="fas fa-exclamation-circle text-xl mb-2"></i>
                <p className="text-sm font-medium">Failed to load route assignments.</p>
            </div>
        );
    }

    if (!routes || routes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-surface rounded-xl border border-border text-center">
                <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center border border-border mb-3">
                    <i className="fas fa-route text-2xl text-muted opacity-60"></i>
                </div>
                <p className="text-sm font-bold text-foreground">No Routes Assigned</p>
                <p className="text-xs text-muted mt-1">This driver is not currently assigned to any active bus routes.</p>
            </div>
        );
    }

    // ─── Render Component ───────────────────────────────────────────────────
    // return (
    //     <div className="flex flex-col gap-4 w-full animate-fade-in">
    //         {routes.map((route: any) => {
    //             const isOpen = !collapsedRoutes[route._id];

    //             return (
    //                 <div key={route._id} className="flex flex-col w-full shadow-sm">
                        
    //                     {/* --- Accordion Header --- */}
    //                     <div
    //                         onClick={() => toggleRoute(route._id)}
    //                         className={`flex items-center justify-between p-4 bg-surface border-border cursor-pointer hover:bg-background/80 transition-colors ${
    //                             isOpen ? "border border-b-0 rounded-t-xl" : "border rounded-xl"
    //                         }`}
    //                     >
    //                         <div className="flex items-center gap-3">
    //                             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
    //                                 <i className="fas fa-bus text-primary"></i>
    //                             </div>
    //                             <div>
    //                                 <h4 className="text-sm md:text-base font-bold text-foreground capitalize">
    //                                     {route.routeName}
    //                                 </h4>
    //                                 {route.routeNo && (
    //                                     <p className="text-xs font-semibold text-muted uppercase tracking-wider mt-0.5">
    //                                         Route No: {route.routeNo}
    //                                     </p>
    //                                 )}
    //                             </div>
    //                         </div>
    //                         <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border border-border text-muted shrink-0 shadow-sm">
    //                             <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-xs transition-transform duration-300`}></i>
    //                         </div>
    //                     </div>

    //                     {/* --- Accordion Body --- */}
    //                     {isOpen && (
    //                         <div className="p-4 md:p-6 bg-background border border-border rounded-b-xl animate-in slide-in-from-top-2 fade-in">
    //                             {route.assignments?.length > 0 ? (
    //                                 <div className="flex flex-col gap-8">
                                        
    //                                     {route.assignments.map((assignment: any, aIndex: number) => (
    //                                         <div key={assignment._id || aIndex} className="flex flex-col">
                                                
    //                                             {/* Shift Details Badge */}
    //                                             <div className="flex flex-wrap items-center gap-2 mb-5">
    //                                                 <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${
    //                                                     assignment.shift === 'pickup' 
    //                                                         ? 'bg-success/10 text-success border border-success/20' 
    //                                                         : 'bg-warning/10 text-warning border border-warning/20'
    //                                                 }`}>
    //                                                     <i className={`fas ${assignment.shift === 'pickup' ? 'fa-sun' : 'fa-moon'} mr-1.5`}></i>
    //                                                     {assignment.shift} Shift
    //                                                 </span>
                                                    
    //                                                 {assignment.busId?.registrationNumber && (
    //                                                     <span className="text-xs font-semibold text-muted bg-surface border border-border px-2.5 py-1 rounded-md shadow-sm">
    //                                                         Bus: {assignment.busId.registrationNumber}
    //                                                     </span>
    //                                                 )}
    //                                             </div>

    //                                             {/* Stop Timings Vertical Timeline */}
    //                                             <div className="flex flex-col relative before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-border ml-1 md:ml-2">
                                                    
    //                                                 {assignment.stopTimings?.map((timing: any, tIndex: number) => {
    //                                                     // Safely resolve nested stop details based on standard schemas
    //                                                     const stopName = timing.stopName || timing.stop?.stopName || timing.stop?.name || "Unknown Stop";
    //                                                     const arrivalTime = timing.arrivalTime || timing.time || "--:--";

    //                                                     return (
    //                                                         <div key={tIndex} className="relative flex items-start gap-4 mb-4 last:mb-0">
    //                                                             {/* Timeline Dot */}
    //                                                             <div className="absolute left-1 w-3.5 h-3.5 rounded-full bg-background border-[3px] border-primary mt-1 z-10 shadow-sm"></div>
                                                                
    //                                                             {/* Timeline Content */}
    //                                                             <div className="flex flex-col pl-8 md:pl-10 min-w-[70px] shrink-0 pt-0.5">
    //                                                                 <span className="text-xs font-bold text-foreground">
    //                                                                     {arrivalTime}
    //                                                                 </span>
    //                                                             </div>
                                                                
    //                                                             <div className="flex-1 bg-surface border border-border rounded-lg p-3 shadow-sm transition-colors hover:border-primary/40">
    //                                                                 <p className="text-sm font-semibold text-foreground">{stopName}</p>
    //                                                             </div>
    //                                                         </div>
    //                                                     );
    //                                                 })}
                                                    
    //                                                 {(!assignment.stopTimings || assignment.stopTimings.length === 0) && (
    //                                                     <p className="text-xs text-muted pl-8 italic border-l-2 border-transparent">
    //                                                         No stop timings configured for this shift.
    //                                                     </p>
    //                                                 )}
    //                                             </div>

    //                                         </div>
    //                                     ))}
    //                                 </div>
    //                             ) : (
    //                                 <div className="flex flex-col items-center text-center py-6">
    //                                     <i className="fas fa-clipboard-list text-2xl text-muted opacity-40 mb-2"></i>
    //                                     <p className="text-sm text-muted font-medium">No schedule details found for this route.</p>
    //                                 </div>
    //                             )}
    //                         </div>
    //                     )}
    //                 </div>
    //             );
    //         })}
    //     </div>
    // );


  return (
        <div className="flex flex-col gap-4 w-full mt-10">

            {/* --- Section Heading --- */}
            <div className="flex items-center gap-2 pb-2 mb-2 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <i className="fas fa-map-marked-alt text-primary text-sm"></i>
                </div>
                <h3 className="text-lg font-bold text-foreground">Assigned Routes</h3>
                <span className="ml-auto bg-background border border-border text-muted text-xs font-bold px-2 py-1 rounded-md">
                    {routes.length} {routes.length === 1 ? 'Route' : 'Routes'}
                </span>
            </div>

            {routes.map((route: any) => {
                const isOpen = !collapsedRoutes[route._id];

                return (
                    <div key={route._id} className="flex flex-col w-full shadow-sm rounded-xl border border-border overflow-hidden bg-surface">
                        
                        {/* --- Accordion Header --- */}
                        <div
                            onClick={() => toggleRoute(route._id)}
                            className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                                isOpen ? "bg-surface border-b border-border" : "bg-surface hover:bg-background"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <i className="fas fa-bus text-sm"></i>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-sm md:text-base font-bold text-foreground capitalize">
                                            {route.routeName}
                                        </h4>
                                        {route.routeNo && (
                                            <span className="text-[10px] font-bold text-muted bg-background border border-border px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                {route.routeNo}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-colors ${isOpen ? 'bg-primary/10 text-primary' : 'bg-background border border-border text-muted'}`}>
                                <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-xs`}></i>
                            </div>
                        </div>

                        {/* --- Accordion Body --- */}
                        {isOpen && (
                            <div className="p-4 bg-background animate-in slide-in-from-top-2 fade-in">
                                {route.assignments?.length > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        
                                        {route.assignments.map((assignment: any, aIndex: number) => (
                                            <div key={assignment._id || aIndex} className="flex flex-col bg-surface border border-border rounded-xl p-4 shadow-sm">
                                                
                                                {/* Shift Details Badge */}
                                                <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-border-soft">
                                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md flex items-center ${
                                                        assignment.shift === 'pickup' 
                                                            ? 'bg-success/10 text-success border border-success/20' 
                                                            : 'bg-warning/10 text-warning border border-warning/20'
                                                    }`}>
                                                        <i className={`fas ${assignment.shift === 'pickup' ? 'fa-sun' : 'fa-moon'} mr-1.5`}></i>
                                                        {assignment.shift} Shift
                                                    </span>
                                                    
                                                    {assignment.busId?.registrationNumber && (
                                                        <span className="text-[10px] font-bold text-muted bg-background border border-border px-2 py-1 rounded-md flex items-center gap-1.5">
                                                            <i className="fas fa-id-card opacity-70"></i>
                                                            {assignment.busId.registrationNumber}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Stop Timings Vertical Timeline */}
                                                <div className="flex flex-col relative before:absolute before:inset-y-0 before:left-[15px] before:w-0.5 before:bg-border ml-1">
                                                    
                                                    {assignment.stopTimings?.map((timing: any, tIndex: number) => {
                                                        const stopName = timing.stopName || timing.stop?.stopName || timing.stop?.name || "Unknown Stop";
                                                        const arrivalTime = timing.arrivalTime || timing.time || "--:--";

                                                        return (
                                                            <div key={tIndex} className="relative flex items-start gap-3 mb-4 last:mb-0">
                                                                {/* Timeline Dot */}
                                                                <div className="absolute left-[11px] w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface mt-1.5 z-10"></div>
                                                                
                                                                {/* Timeline Content */}
                                                                <div className="flex flex-col pl-8 min-w-[65px] shrink-0 pt-0.5">
                                                                    <span className="text-xs font-bold text-foreground">
                                                                        {arrivalTime}
                                                                    </span>
                                                                </div>
                                                                
                                                                <div className="flex-1 bg-surface border border-border-soft rounded-lg p-3 shadow-sm hover:border-border transition-colors">
                                                                    <p className="text-sm font-semibold text-foreground">
                                                                        {stopName}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    
                                                    {(!assignment.stopTimings || assignment.stopTimings.length === 0) && (
                                                        <div className="pl-8 py-2">
                                                            <p className="text-xs text-muted italic bg-background inline-block px-3 py-1.5 rounded border border-border">
                                                                No stop timings configured.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center py-8 bg-surface rounded-xl border border-border border-dashed">
                                        <i className="fas fa-clipboard-list text-2xl text-muted opacity-30 mb-2"></i>
                                        <p className="text-sm text-foreground font-bold">No schedule details</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default DriverRoute;