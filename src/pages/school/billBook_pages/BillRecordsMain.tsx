import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../features/store/store';
import { useGetAllBillRecordsInfinite } from '../../../api_services/schoolConfig_api/billBook_api/billBookRecordApi';
import { Card, CardHeader, CardContent } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';

interface BillRecordsMainProps {
    billBook: any;
    onBack: () => void;
}

export default function BillRecordsMain({ billBook, onBack }: BillRecordsMainProps) {
    const { schoolId } = useSelector((state: RootState) => state.auth);

    // --- Infinite Query ---
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useGetAllBillRecordsInfinite({
        schoolId: schoolId!,
        billBookId: billBook._id,
    });

    // 🌟 Native Intersection Observer Setup
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Create the observer
        const observer = new IntersectionObserver(
            (entries) => {
                // If the target element is visible and we can fetch more, trigger the fetch
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.5 } // Triggers when 50% of the element is visible
        );

        // Start observing the ref element
        const currentRef = loadMoreRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        // Cleanup observer on unmount
        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Flatten pages into a single array
    const records = data?.pages.flatMap(page => page.data.records) || [];
    const totalRecords = data?.pages[0]?.data.pagination.totalRecords || 0;

    return (
        <Card className="h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
            <CardHeader
                title={`Bill Book: ${billBook.bookName}`}
                subtitle={`Total Bills: ${totalRecords}`}
                action={
                    <Button variant="outline" size="sm" leftIcon="fas fa-arrow-left" onClick={onBack}>
                        Back to Bill Books
                    </Button>
                }
            />
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center text-muted">
                        <i className="fas fa-spinner fa-spin text-2xl"></i>
                    </div>
                ) : isError ? (
                    <div className="flex-1 flex items-center justify-center text-danger font-medium">
                        Failed to load ledger records.
                    </div>
                ) : records.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted/60 py-12">
                        <i className="fas fa-receipt text-4xl mb-3 opacity-50"></i>
                        <p className="text-sm font-medium">No bills generated from this book yet.</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto custom-scrollbar relative flex flex-col">

                        {/* 🌟 Responsive Table Wrapper (Expanded min-width for extra columns) */}
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm min-w-[1000px]">
                                <thead className="bg-surface sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3 font-bold text-muted uppercase tracking-wider text-[11px] border-b border-border w-12">S.No</th>
                                        <th className="px-4 py-3 font-bold text-muted uppercase tracking-wider text-[11px] border-b border-border">Date & Time</th>
                                        <th className="px-4 py-3 font-bold text-muted uppercase tracking-wider text-[11px] border-b border-border">Bill No.</th>
                                        <th className="px-4 py-3 font-bold text-muted uppercase tracking-wider text-[11px] border-b border-border">Receipt No.</th>
                                        <th className="px-4 py-3 font-bold text-muted uppercase tracking-wider text-[11px] border-b border-border">Student Details</th>
                                        <th className="px-4 py-3 font-bold text-muted uppercase tracking-wider text-[11px] border-b border-border text-right">Amount Paid</th>
                                        <th className="px-4 py-3 font-bold text-muted uppercase tracking-wider text-[11px] border-b border-border text-center">Payment Mode</th>
                                        <th className="px-4 py-3 font-bold text-muted uppercase tracking-wider text-[11px] border-b border-border text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {records?.map((record, index) => (
                                        <tr key={`${record?._id}-${index}`} className="hover:bg-background/50 transition-colors">

                                            {/* S.No */}
                                            <td className="px-4 py-3 font-bold text-muted whitespace-nowrap">
                                                {index + 1}
                                            </td>

                                            {/* Date */}
                                            <td className="px-4 py-3 text-muted text-xs font-medium whitespace-nowrap">
                                                <div className="font-bold text-foreground">
                                                    {new Date(record?.createdAt).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                                <div className="text-[12px] text-muted mt-0.5">
                                                    {new Date(record?.createdAt).toLocaleTimeString('en-IN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>

                                            {/* Bill No */}
                                            <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">
                                                {record?.billNumber}
                                            </td>

                                            {/* Receipt No */}
                                            <td className="px-4 py-3 font-bold text-primary whitespace-nowrap">
                                                {record?.feeReceiptId?.receiptNo || <span className="text-muted font-normal italic">N/A</span>}
                                            </td>

                                            {/* Student Details */}
                                            <td className="px-4 py-3">
                                                {record?.studentId ? (
                                                    <div>
                                                        <p className="font-bold text-foreground capitalize whitespace-nowrap">{record?.studentId?.studentName}</p>
                                                        <p className="text-[11px] text-muted font-medium whitespace-nowrap">
                                                            {record?.studentId?.className} {record?.studentId?.sectionName && `- ${record?.studentId?.sectionName}`}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted italic text-xs">Unknown Student</span>
                                                )}
                                            </td>

                                            {/* Amount Paid */}
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                {record?.feeReceiptId ? (
                                                    <span className="font-bold text-success text-md">₹{record?.feeReceiptId?.amountPaid?.toLocaleString('en-IN')}</span>
                                                ) : (
                                                    <span className="text-muted text-xs">-</span>
                                                )}
                                            </td>

                                            {/* Mode of Payment */}
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                {record?.feeReceiptId?.paymentMode ? (
                                                    <span className="text-[12px] text-muted font-bold uppercase tracking-wider">
                                                        {record?.feeReceiptId?.paymentMode}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted text-xs">-</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                {record?.feeReceiptId?.status === 'success' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20">
                                                        <i className="fas fa-check-circle"></i> Paid
                                                    </span>
                                                ) : record?.feeReceiptId?.status === 'pending' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-warning/10 text-warning border border-warning/20">
                                                        <i className="fas fa-clock"></i> Pending
                                                    </span>
                                                ) : (
                                                    <span className="text-muted text-xs">-</span>
                                                )}
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* --- NATIVE INFINITE SCROLL TRIGGER TARGET --- */}
                        <div ref={loadMoreRef} className="py-6 flex justify-center items-center shrink-0">
                            {isFetchingNextPage ? (
                                <div className="flex items-center gap-2 text-primary font-medium text-sm">
                                    <i className="fas fa-circle-notch fa-spin"></i> Loading more...
                                </div>
                            ) : hasNextPage ? (
                                <span className="text-xs text-muted font-medium">Scroll down for more</span>
                            ) : (
                                <span className="text-[11px] text-muted/50 font-bold uppercase tracking-widest border-t border-border/50 pt-4 w-1/2 text-center">
                                    End of Ledger
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}