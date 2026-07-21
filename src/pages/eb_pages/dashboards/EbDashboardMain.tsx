import React from 'react';
import { useAuthData } from '../../../hooks/useAuthData';
import { useGetEBBillKpis, useGetEBDashboardOverview, useGetEBPremisesAnalytics } from '../../../api_services/eb_api/ebLogApi';
import { EbAnalyticsCards, EbConsumptionChart, EbCostChart, EbRecentLogsList, EbStatCard, EbConsumptionDoughnut } from './components/EbDashboardWidgets';
export const EbDashboardMain: React.FC = () => {
    const { schoolId } = useAuthData();

    // 1. Fetch Dashboard Queries
    const { data: overviewData, isLoading: isOverviewLoading } = useGetEBDashboardOverview(schoolId!);
    const { data: billingData, isLoading: isBillingLoading } = useGetEBBillKpis(schoolId!);
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
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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


                <div className="w-full pt-2">
                    <div className="flex items-center gap-2 px-1 mb-3">
                        <i className="fas fa-coins text-primary"></i>
                        <h3 className="text-lg font-semibold text-foreground">Financial Overview</h3>
                    </div>
                    <EbBillingKpis />
                </div> */}

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                    {/* Usage KPIs */}
                    <EbStatCard
                        title="Yday Usage"
                        value={
                            overviewData?.totalConsumptionYesterday !== undefined 
                                ? `${overviewData.totalConsumptionYesterday.toLocaleString()} kWh` 
                                : '0 kWh'
                        }
                        icon="fas fa-bolt"
                        subtitle="All reported premises"
                        isLoading={isOverviewLoading}
                        valueColor="text-primary"
                    />
                    
                    <EbStatCard
                        title="Reported"
                        value={
                            overviewData ? `${overviewData.premisesReportedYesterday} / ${overviewData.totalPremises}` : '0 / 0'
                        }
                        icon="fas fa-building"
                        subtitle="Premises logged yday"
                        isLoading={isOverviewLoading}
                        valueColor={
                            overviewData?.premisesReportedYesterday === overviewData?.totalPremises && (overviewData?.totalPremises ?? 0) > 0
                                ? "text-success" 
                                : "text-foreground"
                        }
                    />

                    <EbStatCard
                        title="Recent Logs"
                        value={overviewData?.recentLogs?.length ? `${overviewData.recentLogs.length} logs` : '0 logs'}
                        icon="fas fa-clipboard-check"
                        subtitle="Latest recorded entries"
                        isLoading={isOverviewLoading}
                    />

                    {/* Financial KPIs */}
                    <EbStatCard
                        title="Proj. Bill (Mo)"
                        value={billingData ? `₹${billingData.monthlyProjectedBill.toLocaleString('en-IN')}` : '₹0'}
                        icon="fas fa-file-invoice-dollar"
                        subtitle="Est. total this month"
                        isLoading={isBillingLoading}
                        valueColor="text-primary"
                    />
                    
                    <EbStatCard
                        title="Daily Cost (Est)"
                        value={billingData ? `₹${billingData.estimatedDailyEBCost.toLocaleString('en-IN')}` : '₹0'}
                        icon="fas fa-calendar-day"
                        subtitle="MTD average cost"
                        isLoading={isBillingLoading}
                        valueColor="text-primary"
                    />

                    <EbStatCard
                        title="Proj. Units (Mo)"
                        value={billingData ? `${billingData.projectedUnitsThisMonth.toLocaleString('en-IN')} kWh` : '0 kWh'}
                        icon="fas fa-tachometer-alt"
                        subtitle="Est. month-end usage"
                        isLoading={isBillingLoading}
                        valueColor="text-primary"
                    />
                </div>

                {/* ROW 2: CONSUMPTION LINE CHART */}
                {/* <div className="w-full">
                    <EbConsumptionChart />
                </div>


                <div className="w-full">
                    <EbCostChart />
                </div> */}

              <div className="w-full pt-2 grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Line Chart takes up 2/3 of the space on large screens */}
                    <div className="lg:col-span-2">
                        <EbConsumptionChart />
                    </div>
                    
                    {/* Doughnut Chart takes up 1/3 of the space */}
                    <div className="lg:col-span-1 h-full">
                        <EbConsumptionDoughnut 
                            data={analyticsData} 
                            isLoading={isAnalyticsLoading} 
                        />
                    </div>
                </div>

                {/* ROW 3: COST CHART (Full Width below) */}
                <div className="w-full mt-5">
                    <EbCostChart />
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