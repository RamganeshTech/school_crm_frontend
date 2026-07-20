import React from 'react';
import { useAuthData } from '../../../hooks/useAuthData';
import { useGetEBDashboardOverview, useGetEBPremisesAnalytics } from '../../../api_services/eb_api/ebLogApi';
import { EbAnalyticsCards, EbConsumptionChart, EbRecentLogsList, EbStatCard } from './components/EbDashboardWidgets';
export const EbDashboardMain: React.FC = () => {
    const { schoolId } = useAuthData();

    // 1. Fetch Dashboard Queries
    const { data: overviewData, isLoading: isOverviewLoading } = useGetEBDashboardOverview(schoolId!);
    const { data: analyticsData = [], isLoading: isAnalyticsLoading } = useGetEBPremisesAnalytics(schoolId!);

    return (
        <div className="h-full bg-mainBg p-2 font-[poppins] flex flex-col">
            <div className="max-w-7xl mx-auto space-y-6 w-full flex-1">

                {/* HEADER SECTION */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-default pb-4 shrink-0">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
                            <i className="fas fa-chart-pie text-primary"></i>
                            Electricity Dashboard
                        </h1>
                        <p className="text-sm text-muted mt-1 font-normal">
                            Monitor campus-wide power consumption and trends.
                        </p>
                    </div>
                </header>

                {/* KPI CARDS ROW */}
                {/* ROW 1: KPI CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <EbStatCard
                        title="Yesterday's Consumption"
                        value={
                            overviewData?.totalConsumptionYesterday !== undefined
                                ? `${overviewData.totalConsumptionYesterday.toLocaleString()} kWh`
                                : '0 kWh'
                        }
                        icon="fas fa-bolt"
                        subtitle="Total across all reported premises"
                        isLoading={isOverviewLoading}
                        valueColor="text-primary"
                    />

                    <EbStatCard
                        title="Reporting Status"
                        value={
                            overviewData ? `${overviewData.premisesReportedYesterday} / ${overviewData.totalPremises}` : '0 / 0'
                        }
                        icon="fas fa-building"
                        subtitle="Premises logged yesterday"
                        isLoading={isOverviewLoading}
                        valueColor={
                            overviewData?.premisesReportedYesterday === overviewData?.totalPremises && (overviewData?.totalPremises && overviewData?.totalPremises > 0)
                                ? "text-success"
                                : "text-foreground"
                        }
                    />

                    <EbStatCard
                        title="Total Logs Tracked"
                        value={String(overviewData?.recentLogs?.length) + " " + "logs"}
                        icon="fas fa-clipboard-check"
                        subtitle="System logging operational"
                        isLoading={isOverviewLoading}
                    />
                </div>

                {/* ROW 2: CONSUMPTION LINE CHART */}
                <div className="w-full">
                    {/* Zero props needed! It manages its own state and fetching. */}
                    <EbConsumptionChart />
                </div>

                {/* ROW 2: RECENT LOGS (Full Width List) */}
                <div className="w-full">
                    <EbRecentLogsList
                        logs={overviewData?.recentLogs || []}
                        isLoading={isOverviewLoading}
                    />
                </div>

                {/* ROW 3: PREMISES ANALYTICS (Full Width Grid of Cards) */}
                <div className="w-full space-y-3 pt-2">
                    <div className="flex items-center gap-2 px-1">
                        <i className="fas fa-chart-bar text-primary"></i>
                        <h3 className="text-lg font-semibold text-foreground">Premises Consumption Analytics</h3>
                    </div>
                    <EbAnalyticsCards
                        data={analyticsData}
                        isLoading={isAnalyticsLoading}
                    />
                </div>
            </div>
        </div>
    );
};

export default EbDashboardMain;