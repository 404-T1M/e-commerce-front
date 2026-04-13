import api from './axios';
import { buildQuery } from '@/utils';
import type { LocalizedString } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OverviewData {
    newOrders: number;
    activeOrders: number;
    completedOrders: number;
    totalCustomers: number;
    incomingMessages: number;
    topCustomers?: Array<{
        user: { id?: string; _id?: string; name: string; email: string };
        activeOrders: number;
        completedOrders: number;
        cancelledOrders: number;
        totalSpent?: number;
    }>;
}

export interface ProfitChartMonth {
    month: number;
    revenue: number;
    profit: number;
}

export interface ProfitChartData {
    year: number;
    chart: ProfitChartMonth[];
}

export interface OrderStatsReport {
    date?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    totalOrders: number;
    totalItemsSold: number;
    totalRevenue: number;
    totalProfit: number;
}

export interface CustomerReportItem {
    user: {
        id: string;
        name: string;
        email: string;
    };
    activeOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalSpent?: number;
}

export interface CustomerReportData {
    total: number;
    page: number;
    limit: number;
    customers: CustomerReportItem[];
}

export type CustomerSortOption =
    | 'active_asc'
    | 'active_desc'
    | 'cancelled_asc'
    | 'cancelled_desc'
    | 'completed_asc'
    | 'completed_desc';
export type CustomerSortOptionWithSpent = CustomerSortOption | 'spent_asc' | 'spent_desc';

export interface ProductStatsItem {
    productId: string;
    name?: LocalizedString;
    image?: { fileName?: string; imageUrl?: string };
    soldCount: number;
    revenue: number;
    profit: number;
}

export interface ProductStatsData {
    total: number;
    products: ProductStatsItem[];
}

export interface CouponStatsItem {
    code: string;
    discountType?: string;
    discountValue?: number;
    usedCount: number;
    totalDiscount: number;
}

export interface CouponStatsData {
    total: number;
    coupons: CouponStatsItem[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const analyticsApi = {
    /** GET /admin/analytics/overview */
    getOverview: () =>
        api
            .get<OverviewData & { message: string }>('/admin/analytics/overview')
            .then((r) => r.data),

    /** GET /admin/analytics/profit-chart?year= */
    getProfitChart: (year?: number) =>
        api
            .get<ProfitChartData & { message: string }>(
                `/admin/analytics/profit-chart${year ? `?year=${year}` : ''}`,
            )
            .then((r) => r.data),

    /** GET /admin/analytics/reports/daily */
    getDailyReport: () =>
        api
            .get<OrderStatsReport & { message: string }>('/admin/analytics/reports/daily')
            .then((r) => r.data),

    /** GET /admin/analytics/reports/profit?startDate=&endDate= */
    getProfitReport: (startDate: string, endDate: string) =>
        api
            .get<OrderStatsReport & { message: string }>(
                `/admin/analytics/reports/profit?startDate=${startDate}&endDate=${endDate}`,
            )
            .then((r) => r.data),

    /** GET /admin/analytics/reports/customers?sort=&page=&limit= */
    getCustomerReport: (sort?: CustomerSortOptionWithSpent, page?: number, limit?: number) => {
        const params = new URLSearchParams();
        if (sort) params.set('sort', sort);
        if (page) params.set('page', String(page));
        if (limit) params.set('limit', String(limit));
        const query = params.toString();
        return api
            .get<CustomerReportData & { message: string }>(
                `/admin/analytics/reports/customers${query ? `?${query}` : ''}`,
            )
            .then((r) => r.data);
    },

    /** GET /admin/analytics/reports/products */
    getProductStats: (params: { sortBy?: string; sortOrder?: 'asc' | 'desc'; page?: number; limit?: number } = {}) => {
        const q = buildQuery(params as Record<string, unknown>);
        return api
            .get<{ message: string; data: ProductStatsData }>(
                `/admin/analytics/reports/products${q ? `?${q}` : ''}`,
            )
            .then((r) => r.data.data);
    },

    /** GET /admin/analytics/reports/coupons */
    getCouponStats: (params: { sortBy?: string; sortOrder?: 'asc' | 'desc'; page?: number; limit?: number } = {}) => {
        const q = buildQuery(params as Record<string, unknown>);
        return api
            .get<{ message: string; data: CouponStatsData }>(
                `/admin/analytics/reports/coupons${q ? `?${q}` : ''}`,
            )
            .then((r) => r.data.data);
    },
};
