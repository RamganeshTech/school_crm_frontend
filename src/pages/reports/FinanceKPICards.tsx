
interface KPICardsProps {
    data: {
        totalIncome: number;
        totalExpense: number;
        netBalance: number;
        transactionCount: number;
    };
    isLoading: boolean;
}

export default function FinanceKPICards({ data, isLoading }: KPICardsProps) {
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    });

    const cards = [
        {
            title: 'Total Revenue Collections',
            value: formatter.format(data?.totalIncome || 0),
            icon: 'fas fa-arrow-trend-up',
            bg: 'bg-success/10',
            text: 'text-success',
            desc: 'Aggregate inflows and collections'
        },
        {
            title: 'Operational Expenditures',
            value: formatter.format(data?.totalExpense || 0),
            icon: 'fas fa-arrow-trend-down',
            bg: 'bg-danger/10',
            text: 'text-danger',
            desc: 'Disbursed operational costs'
        },
        {
            title: 'Net Operational Balance',
            value: formatter.format(data?.netBalance || 0),
            icon: 'fas fa-wallet',
            bg: (data?.netBalance || 0) >= 0 ? 'bg-primary-soft' : 'bg-warning/10',
            text: (data?.netBalance || 0) >= 0 ? 'text-primary' : 'text-warning',
            desc: 'Liquid ledger runway balance'
        },
        {
            title: 'Processed Transactions',
            value: data?.transactionCount || 0,
            icon: 'fas fa-receipt',
            bg: 'bg-sub-header',
            text: 'text-muted',
            desc: 'Active audited ledger lines'
        }
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
                {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="h-32 bg-surface border border-border rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((card, idx) => (
                <div key={idx} className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-border-hover transition-colors">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-bold text-muted uppercase tracking-wider line-clamp-1">{card.title}</span>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm border border-border/10 shrink-0 ${card.bg} ${card.text}`}>
                            <i className={card.icon}></i>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-black text-foreground tracking-tight">{card.value}</h3>
                        <p className="text-[11px] text-muted font-medium mt-1">{card.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}