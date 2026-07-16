import { useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../features/store/store';
import DailyTripAnalyticsMain from './daiyTripAnalytics_pages/DailyTripAnalyticsMain';
import FuelLogAnalyticsMain from './fuelAnalytics_pages/FuelLogAnalyticsMain';

export default function TransportationDashboardMain() {
    const { schoolId } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState<'trips' | 'fuel'>('trips');

    return (
        <div className="w-full h-full flex flex-col p-4 overflow-hidden bg-background">
            
            {/* Dashboard Header & Chips */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <i className="fas fa-chart-pie"></i>
                        </div>
                        Transportation Analytics
                    </h1>
                    <p className="text-sm text-muted mt-1">Comprehensive overview of fleet utilization and fuel management.</p>
                </div>

                {/* Module Switcher Chips */}
                <div className="flex bg-surface border border-border p-1 rounded-xl shadow-sm">
                    <button
                        onClick={() => setActiveTab('trips')}
                        className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors ${
                            activeTab === 'trips' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-foreground'
                        }`}
                    >
                        <i className="fas fa-route mr-2"></i> Daily Trips
                    </button>
                    <button
                        onClick={() => setActiveTab('fuel')}
                        className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors ${
                            activeTab === 'fuel' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-foreground'
                        }`}
                    >
                        <i className="fas fa-gas-pump mr-2"></i> Fuel Logs
                    </button>
                </div>
            </div>

            {/* Render Active Tab */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'trips' ? (
                    <DailyTripAnalyticsMain schoolId={schoolId!} />
                ) : (
                    <FuelLogAnalyticsMain schoolId={schoolId!} />
                )}
            </div>
        </div>
    );
}