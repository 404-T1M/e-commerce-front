import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils';

// ─── Generic DataTable ─────────────────────────────────────────────────────────
export interface ColumnDef<T> {
    key: string;
    header: string;
    cell: (row: T, index: number) => ReactNode;
    headerClass?: string;
    cellClass?: string;
}

interface DataTableProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
    loading?: boolean;
    emptyMessage?: string;
    keyExtractor: (row: T) => string;
}

function SkeletonRow({ cols }: { cols: number }) {
    return (
        <tr className="border-b border-slate-100">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="table-td">
                    <div className="skeleton h-4 w-full rounded" />
                </td>
            ))}
        </tr>
    );
}

export function DataTable<T>({
    columns,
    data,
    loading = false,
    emptyMessage = 'No records found.',
    keyExtractor,
}: DataTableProps<T>) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[600px] border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className={cn('table-th', col.headerClass)}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonRow key={i} cols={columns.length} />
                        ))
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="py-16 text-center text-slate-400 text-sm">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, idx) => (
                            <tr key={keyExtractor(row)} className="table-row">
                                {columns.map((col) => (
                                    <td key={col.key} className={cn('table-td', col.cellClass)}>
                                        {col.cell(row, idx)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

// ─── Pagination ────────────────────────────────────────────────────────────────
interface PaginationProps {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
    labels?: {
        summary?: (from: number, to: number, total: number) => string;
        previous?: string;
        next?: string;
    };
}

export function Pagination({ page, totalPages, total, limit, onPageChange, labels }: PaginationProps) {
    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);
    const summaryText = labels?.summary ? labels.summary(from, to, total) : null;
    const prevLabel = labels?.previous ?? 'Previous page';
    const nextLabel = labels?.next ?? 'Next page';

    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
        (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
    );

    const rendered: (number | '...')[] = [];
    for (let i = 0; i < pages.length; i++) {
        if (i > 0 && pages[i] - pages[i - 1] > 1) rendered.push('...');
        rendered.push(pages[i]);
    }

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 py-3">
            <p className="text-xs text-slate-500">
                {summaryText
                    ? summaryText
                    : (
                        <>
                            Showing <span className="font-medium text-slate-700">{from}–{to}</span> of{' '}
                            <span className="font-medium text-slate-700">{total}</span> results
                        </>
                    )}
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="btn-ghost btn-sm btn-icon disabled:opacity-40"
                    aria-label={prevLabel}
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                {rendered.map((p, i) =>
                    p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p as number)}
                            className={cn(
                                'w-8 h-8 text-sm rounded-lg font-medium transition-colors',
                                page === p
                                    ? 'bg-brand-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-100',
                            )}
                            aria-current={page === p ? 'page' : undefined}
                        >
                            {p}
                        </button>
                    ),
                )}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="btn-ghost btn-sm btn-icon disabled:opacity-40"
                    aria-label={nextLabel}
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
