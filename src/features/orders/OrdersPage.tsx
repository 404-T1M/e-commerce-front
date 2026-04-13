import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, Search, RefreshCw, Eye, ChevronDown } from "lucide-react";
import { DataTable, Pagination, type ColumnDef } from "@/components/DataTable";
import { Modal } from "@/components/Modal";
import { AccessDeniedState } from '@/components/AccessDeniedState';
import { cn, DEFAULT_CURRENCY, formatCurrency, formatDate, getApiErrorMessage, getIntlLocale, pickLocale, isForbiddenError } from "@/utils";
import { ordersApi, type Order, type OrderStatus } from "@/api/orders.api";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/contexts/LocaleContext";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-cyan-50 text-cyan-700 border-cyan-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-slate-50 text-slate-700 border-slate-200",
};

const STATUS_LABELS: Record<OrderStatus, { en: string; ar: string }> = {
  pending: { en: "Pending", ar: "قيد الانتظار" },
  confirmed: { en: "Confirmed", ar: "مؤكد" },
  processing: { en: "Processing", ar: "قيد التجهيز" },
  shipped: { en: "Shipped", ar: "تم الشحن" },
  delivered: { en: "Delivered", ar: "تم التوصيل" },
  cancelled: { en: "Cancelled", ar: "ملغي" },
  refunded: { en: "Refunded", ar: "مرتجع" },
};

const PAYMENT_STATUS_LABELS: Record<string, { en: string; ar: string }> = {
  pending: { en: "Pending", ar: "قيد الانتظار" },
  paid: { en: "Paid", ar: "مدفوع" },
  failed: { en: "Failed", ar: "فشل" },
  refunded: { en: "Refunded", ar: "مرتجع" },
};

const getStatusLabel = (status: OrderStatus, locale: "en" | "ar") =>
  STATUS_LABELS[status]?.[locale] ?? status;

const getPaymentStatusLabel = (status: string | undefined, locale: "en" | "ar") =>
  PAYMENT_STATUS_LABELS[status ?? "pending"]?.[locale] ?? status ?? "Pending";

const getOrdersCopy = (locale: "en" | "ar") =>
  locale === "ar"
    ? {
        pageTitle: "الطلبات",
        pageSubtitle: "إدارة وتتبع طلبات العملاء",
        refresh: "تحديث",
        searchPlaceholder: "ابحث برقم الطلب…",
        filters: {
          allStatuses: "كل الحالات",
          allPayments: "كل المدفوعات",
        },
        table: {
          orderId: "رقم الطلب",
          customer: "العميل",
          status: "الحالة",
          payment: "الدفع",
          total: "الإجمالي",
          items: "المنتجات",
          date: "التاريخ",
          actions: "إجراءات",
          viewDetails: "عرض التفاصيل",
          empty: "لا توجد طلبات.",
        },
        modal: {
          title: "طلب",
          customer: "العميل",
          deliveryAddress: "عنوان التوصيل",
          shippingMethod: "طريقة الشحن",
          payment: "الدفع",
          paymentStatus: "الحالة",
          orderItems: "عناصر الطلب",
          qty: "الكمية",
          subtotal: "الإجمالي الفرعي",
          shipping: "الشحن",
          discount: "الخصم",
          total: "الإجمالي",
          updateStatus: "تحديث الحالة",
          save: "حفظ",
          saving: "جارٍ الحفظ…",
          statusUpdated: "تم تحديث الحالة",
          statusFailed: "فشل",
          shippingFallback: "الشحن",
          emptyValue: "—",
        },
      }
    : {
        pageTitle: "Orders",
        pageSubtitle: "Manage and track customer orders",
        refresh: "Refresh",
        searchPlaceholder: "Search order number…",
        filters: {
          allStatuses: "All Statuses",
          allPayments: "All Payments",
        },
        table: {
          orderId: "Order ID",
          customer: "Customer",
          status: "Status",
          payment: "Payment",
          total: "Total",
          items: "Items",
          date: "Date",
          actions: "Actions",
          viewDetails: "View Details",
          empty: "No orders found.",
        },
        modal: {
          title: "Order",
          customer: "Customer",
          deliveryAddress: "Delivery Address",
          shippingMethod: "Shipping Method",
          payment: "Payment",
          paymentStatus: "Status",
          orderItems: "Order Items",
          qty: "Qty",
          subtotal: "Subtotal",
          shipping: "Shipping",
          discount: "Discount",
          total: "Total",
          updateStatus: "Update Status",
          save: "Save",
          saving: "Saving...",
          statusUpdated: "Status updated",
          statusFailed: "Failed",
          shippingFallback: "Shipping",
          emptyValue: "—",
        },
      };

type OrdersCopy = ReturnType<typeof getOrdersCopy>;

function StatusBadge({ status, locale }: { status: OrderStatus; locale: "en" | "ar" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
        STATUS_STYLES[status] ?? STATUS_STYLES.pending,
      )}
    >
      {getStatusLabel(status, locale)}
    </span>
  );
}

function OrderDetailsModal({
  order,
  onClose,
  locale,
  intlLocale,
  currency,
  copy,
}: {
  order: Order;
  onClose: () => void;
  locale: "en" | "ar";
  intlLocale: string;
  currency: string;
  copy: OrdersCopy;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<OrderStatus>(order.status);

  const updateMutation = useMutation({
    mutationFn: () =>
      ordersApi.adminUpdateStatus((order._id || order.id)!, status),
    onSuccess: () => {
      toast(copy.modal.statusUpdated, "success");
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      onClose();
    },
    onError: (err: unknown) =>
      toast(getApiErrorMessage(err, copy.modal.statusFailed), "error"),
  });

  const c = typeof order.customer === "object" ? order.customer : null;
  const formatMoney = (value?: number | null) =>
    value === null || value === undefined
      ? copy.modal.emptyValue
      : formatCurrency(value, currency, intlLocale);

  const shippingName =
    typeof order.shippingMethod?.name === "string"
      ? order.shippingMethod.name
      : order.shippingMethod?.name
        ? pickLocale(order.shippingMethod.name, locale, copy.modal.shippingFallback)
        : "";
  const paymentName =
    typeof order.paymentMethod?.name === "string"
      ? order.paymentMethod.name
      : order.paymentMethod?.name
        ? pickLocale(order.paymentMethod.name, locale, copy.modal.emptyValue)
        : copy.modal.emptyValue;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4 space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {copy.modal.customer}
          </p>
          <p className="font-medium text-slate-800">{c?.name ?? copy.modal.emptyValue}</p>
          <p className="text-sm text-slate-500 flex items-center gap-2">
            {c?.email ?? copy.modal.emptyValue}
          </p>
          {c?.mobilePhone && (
            <p className="text-sm text-slate-500">{c.mobilePhone}</p>
          )}
        </div>
        <div className="card p-4 space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {copy.modal.deliveryAddress}
          </p>
          <p className="font-medium text-slate-800">
            {order.address?.recipientName}
          </p>
          <p className="text-sm text-slate-500">
            {order.address?.address}, {order.address?.city},{" "}
            {order.address?.country}
          </p>
          <p className="text-sm text-slate-500">
            {order.address?.recipientMobilePhone}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4 space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {copy.modal.shippingMethod}
          </p>
          <p className="font-medium text-slate-800">
            {shippingName || copy.modal.shippingFallback}
          </p>
          <p className="text-sm text-slate-500">
            {formatMoney(order.pricing?.shipping)}
          </p>
        </div>
        <div className="card p-4 space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {copy.modal.payment}
          </p>
          <p className="font-medium text-slate-800">
            {paymentName}
          </p>
          <p className="text-sm text-slate-500 capitalize">
            {copy.modal.paymentStatus}:{" "}
            {getPaymentStatusLabel(order.paymentStatus, locale)}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            {copy.modal.orderItems}
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              {item.image?.imageUrl && (
                <img
                  src={item.image.imageUrl}
                  alt=""
                  className="w-12 h-12 object-cover rounded-lg border border-slate-100"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {pickLocale(item.productName ?? {}, locale, copy.modal.emptyValue)}
                </p>
                <p className="text-xs text-slate-500">
                  {item.attributes?.map((a) => a.value).join(" / ")} · {copy.modal.qty}:{" "}
                  {item.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {formatCurrency(
                  (item.unitPrice ?? 0) * (item.quantity ?? 0),
                  currency,
                  intlLocale,
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">{copy.modal.subtotal}</span>
          <span className="font-medium">
            {formatMoney(order.pricing?.subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">{copy.modal.shipping}</span>
          <span className="font-medium">
            {formatMoney(order.pricing?.shipping)}
          </span>
        </div>
        {(order.pricing?.discount || 0) > 0 && (
          <div className="flex justify-between text-sm text-emerald-600">
            <span>{copy.modal.discount}</span>
            <span>{formatCurrency(-(order.pricing?.discount ?? 0), currency, intlLocale)}</span>
          </div>
        )}
        <div className="flex justify-between border-t pt-2 font-bold">
          <span>{copy.modal.total}</span>
          <span>{formatMoney(order.pricing?.total)}</span>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {copy.modal.updateStatus}
        </p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="input w-full appearance-none pr-8"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {getStatusLabel(s, locale)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending || status === order.status}
            className="btn-primary"
          >
            {updateMutation.isPending ? copy.modal.saving : copy.modal.save}
          </button>
        </div>
      </div>
    </div>
  );
}

export function OrdersPage() {
  const { locale } = useLocale();
  const intlLocale = getIntlLocale(locale);
  const currency = DEFAULT_CURRENCY;
  const copy = getOrdersCopy(locale);
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive state from URL
  const page = Number(searchParams.get("page")) || 1;
  const statusFilter = searchParams.get("status") || "";
  const paymentStatusFilter = searchParams.get("paymentStatus") || "";
  const orderNumber = searchParams.get("orderNumber") || "";

  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", p.toString());
    setSearchParams(params);
  };

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    setSearchParams(params);
  };

  const { data, isLoading, refetch, error } = useQuery({
    queryKey: [
      "adminOrders",
      { page, statusFilter, paymentStatusFilter, orderNumber },
    ],
    queryFn: () =>
      ordersApi.adminGetAll({
        page,
        limit: 15,
        status: statusFilter || undefined,
        paymentStatus: paymentStatusFilter || undefined,
        orderNumber: orderNumber || undefined,
      }),
  });

  const orders = data?.orders ?? [];
  const meta = data?.meta;
  const itemsLabel = (count: number) =>
    locale === "ar"
      ? `${count} ${count === 1 ? "منتج" : "منتجات"}`
      : `${count} item${count !== 1 ? "s" : ""}`;

  const columns: ColumnDef<Order>[] = [
    {
      key: "id",
      header: copy.table.orderId,
      cell: (row) => (
        <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
          {row.orderNumber ||
            `#${(row._id || row.id)?.slice(-8).toUpperCase()}`}
        </code>
      ),
    },
    {
      key: "customer",
      header: copy.table.customer,
      cell: (row) => {
        const c = typeof row.customer === "object" ? row.customer : null;
        return (
          <div>
            <p className="text-sm font-medium text-slate-800 truncate">
              {c?.name ?? "—"}
            </p>
            <p className="text-xs text-slate-400 truncate">{c?.email ?? "—"}</p>
          </div>
        );
      },
    },
    {
      key: "status",
      header: copy.table.status,
      cell: (row) => <StatusBadge status={row.status} locale={locale} />,
    },
    {
      key: "paymentStatus",
      header: copy.table.payment,
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider w-fit",
              row.paymentStatus === "paid"
                ? "bg-emerald-50 text-emerald-700"
                : row.paymentStatus === "failed"
                  ? "bg-red-50 text-red-700"
                  : row.paymentStatus === "refunded"
                    ? "bg-slate-100 text-slate-700"
                    : "bg-amber-50 text-amber-700",
            )}
          >
            {getPaymentStatusLabel(row.paymentStatus, locale)}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {typeof row.paymentMethod?.name === "string"
              ? row.paymentMethod.name
              : row.paymentMethod?.name
                ? pickLocale(row.paymentMethod.name, locale, "—")
                : "—"}
          </span>
        </div>
      ),
    },
    {
      key: "total",
      header: copy.table.total,
      cell: (row) => (
        <span className="text-sm font-semibold text-slate-800">
          {row.pricing?.total !== undefined && row.pricing?.total !== null
            ? formatCurrency(row.pricing.total, currency, intlLocale)
            : copy.modal.emptyValue}
        </span>
      ),
    },
    {
      key: "items",
      header: copy.table.items,
      cell: (row) => (
        <span className="badge badge-gray">
          {itemsLabel(row.items?.length ?? 0)}
        </span>
      ),
    },
    {
      key: "date",
      header: copy.table.date,
      cell: (row) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDate(row.createdAt, intlLocale)}
        </span>
      ),
    },
    {
      key: "actions",
      header: copy.table.actions,
      headerClass: "text-right",
      cellClass: "text-right",
      cell: (row) => (
        <button
          onClick={() => setViewOrder(row)}
          className="btn-ghost btn-icon btn-sm text-slate-400 hover:text-brand-600"
          title={copy.table.viewDetails}
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  if (isForbiddenError(error)) {
    return <AccessDeniedState />;
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-brand-600" /> {copy.pageTitle}
          </h1>
          <p className="page-subtitle">{copy.pageSubtitle}</p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary">
          <RefreshCw className="w-4 h-4" /> {copy.refresh}
        </button>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            placeholder={copy.searchPlaceholder}
            className="input pl-9"
            value={orderNumber}
            onChange={(e) => updateFilters("orderNumber", e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => updateFilters("status", e.target.value)}
              className="input sm:w-auto min-w-[150px] appearance-none pr-8 bg-white"
            >
              <option value="">{copy.filters.allStatuses}</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {getStatusLabel(s, locale)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={paymentStatusFilter}
              onChange={(e) => updateFilters("paymentStatus", e.target.value)}
              className="input sm:w-auto min-w-[150px] appearance-none pr-8 bg-white"
            >
              <option value="">{copy.filters.allPayments}</option>
              <option value="pending">{PAYMENT_STATUS_LABELS.pending[locale]}</option>
              <option value="paid">{PAYMENT_STATUS_LABELS.paid[locale]}</option>
              <option value="failed">{PAYMENT_STATUS_LABELS.failed[locale]}</option>
              <option value="refunded">{PAYMENT_STATUS_LABELS.refunded[locale]}</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={isLoading}
        keyExtractor={(o) => (o._id || o.id)!}
        emptyMessage={copy.table.empty}
      />
      {meta && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={setPage}
        />
      )}

      <Modal
        open={!!viewOrder}
        onClose={() => setViewOrder(null)}
        title={`${copy.modal.title} ${viewOrder?.orderNumber || `#${(viewOrder?._id || viewOrder?.id)?.slice(-8).toUpperCase() ?? ""}`}`}
        size="lg"
      >
        {viewOrder && (
          <OrderDetailsModal
            order={viewOrder}
            onClose={() => setViewOrder(null)}
            locale={locale}
            intlLocale={intlLocale}
            currency={currency}
            copy={copy}
          />
        )}
      </Modal>
    </div>
  );
}
