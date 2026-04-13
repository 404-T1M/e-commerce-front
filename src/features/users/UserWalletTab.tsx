import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Plus,
  AlertCircle,
} from "lucide-react";
import { walletApi, type WalletTransaction } from "@/api/wallet.api";
import { Pagination } from "@/components/DataTable";
import { AccessDeniedState } from "@/components/AccessDeniedState";
import {
  cn,
  DEFAULT_CURRENCY,
  formatCurrency,
  formatDate,
  getApiErrorMessage,
  getIntlLocale,
  isForbiddenError,
} from "@/utils";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/contexts/LocaleContext";

type WalletPaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  pages: number;
};

export function UserWalletTab({ userId }: { userId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { locale } = useLocale();
  const intlLocale = getIntlLocale(locale);
  const currency = DEFAULT_CURRENCY;
  const copy =
    locale === "ar"
      ? {
          title: "المحفظة والمعاملات",
          estimatedBalance: "الرصيد التقديري",
          fallbackText: "إدارة معاملات المحفظة وإضافة الرصيد.",
          addCredit: "إضافة رصيد",
          noTransactions: "لا توجد معاملات بعد",
          via: "عبر",
          pending: "قيد الانتظار",
          failed: "فشل",
          balance: "الرصيد",
          modal: {
            title: "إضافة رصيد للمحفظة",
            amount: `المبلغ (${currency})`,
            note: "ملاحظة (اختياري)",
            notePlaceholder: "مثال: استرداد لطلب #123",
            cancel: "إلغاء",
            confirm: "إضافة رصيد",
            confirming: "جارٍ الإضافة…",
          },
          toast: {
            credited: "تمت إضافة الرصيد بنجاح",
            creditFailed: "فشل إضافة الرصيد",
            amountError: "يجب أن يكون المبلغ أكبر من 0",
          },
          tx: {
            topUp: "شحن",
            bonus: "مكافأة",
            refund: "استرداد",
            purchase: "شراء",
          },
        }
      : {
          title: "Wallet & Transactions",
          estimatedBalance: "Estimated Balance",
          fallbackText: "Manage user wallet transactions and credit balance.",
          addCredit: "Add Credit",
          noTransactions: "No transactions yet",
          via: "via",
          pending: "Pending",
          failed: "Failed",
          balance: "Bal",
          modal: {
            title: "Add Wallet Credit",
            amount: `Amount (${currency})`,
            note: "Note (Optional)",
            notePlaceholder: "e.g. Refund for order #123",
            cancel: "Cancel",
            confirm: "Add Credit",
            confirming: "Crediting...",
          },
          toast: {
            credited: "Wallet credited successfully",
            creditFailed: "Failed to credit wallet",
            amountError: "Amount must be greater than 0",
          },
          tx: {
            topUp: "Top up",
            bonus: "Bonus",
            refund: "Refund",
            purchase: "Purchase",
          },
        };
  const page = Number(searchParams.get("walletPage")) || 1;
  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    if (p > 1) params.set("walletPage", p.toString());
    else params.delete("walletPage");
    setSearchParams(params);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 10;

  const {
    data: txData,
    isLoading: txLoading,
    error,
  } = useQuery({
    queryKey: ["adminUserTransactions", userId, page],
    queryFn: () => walletApi.adminGetUserTransactions(userId, { page, limit }),
  });

  const transactions = txData?.transactions ?? [];
  const meta: WalletPaginationMeta | undefined = txData?.meta
    ? {
        total: txData.meta.total,
        page: txData.meta.page,
        limit: txData.meta.limit,
        totalPages: txData.meta.totalPages,
        pages: txData.meta.totalPages,
      }
    : txData?.pagination
      ? {
          total: txData.pagination.total,
          page: txData.pagination.page,
          limit: txData.pagination.limit,
          totalPages: txData.pagination.totalPages ?? txData.pagination.pages,
          pages: txData.pagination.pages ?? txData.pagination.totalPages ?? 1,
        }
      : undefined;

  // Estimate balance from the most recent transaction on the first page
  const estimatedBalance =
    page === 1 && transactions.length > 0 ? transactions[0].balanceAfter : null;

  const creditMutation = useMutation({
    mutationFn: (data: { amount: number; note: string }) =>
      walletApi.adminCreditWallet({ userId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["adminUserTransactions", userId],
      });
      toast(copy.toast.credited, "success");
      setIsModalOpen(false);
    },
    onError: (err: unknown) => {
      toast(getApiErrorMessage(err, copy.toast.creditFailed), "error");
    },
  });

  if (isForbiddenError(error)) {
    return <AccessDeniedState showBack={false} />;
  }

  const handleCreditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const amount = Number(fd.get("amount"));
    const note = fd.get("note") as string;
    if (amount <= 0) {
      toast(copy.toast.amountError, "error");
      return;
    }
    creditMutation.mutate({ amount, note });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-brand-600" /> {copy.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {estimatedBalance !== null ? (
              <>
                {copy.estimatedBalance}:{" "}
                <span className="font-bold text-gray-900">
                  {formatCurrency(estimatedBalance, currency, intlLocale)}
                </span>
              </>
            ) : (
              copy.fallbackText
            )}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary btn-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> {copy.addCredit}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {txLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-50 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">{copy.noTransactions}</p>
            </div>
          ) : (
            transactions.map((tx: WalletTransaction) => {
              const isCredit = ["topUp", "bonus", "refund"].includes(tx.type);
              const txLabel =
                tx.note ||
                copy.tx[tx.type as keyof typeof copy.tx] ||
                copy.tx.purchase;
              return (
                <div
                  key={tx.id}
                  className="p-4 sm:px-6 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                      isCredit
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-600",
                    )}
                  >
                    {isCredit ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm capitalize truncate pr-4">
                      {txLabel}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-gray-500">
                      <span>{formatDate(tx.createdAt, intlLocale)}</span>
                      {tx.paymentMethod && (
                        <span className="capitalize px-1.5 py-0.5 bg-gray-100 rounded-md">
                          {copy.via} {tx.paymentMethod}
                        </span>
                      )}
                      {tx.status === "pending" && (
                        <span className="flex items-center gap-1 text-amber-600 font-medium">
                          <AlertCircle className="w-3 h-3" /> {copy.pending}
                        </span>
                      )}
                      {tx.status === "failed" && (
                        <span className="text-red-500 font-medium">
                          {copy.failed}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={cn(
                        "font-bold",
                        isCredit ? "text-emerald-600" : "text-gray-900",
                      )}
                    >
                      {isCredit ? "+" : "-"}
                      {formatCurrency(tx.amount, currency, intlLocale)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {copy.balance}:{" "}
                      {formatCurrency(tx.balanceAfter, currency, intlLocale)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {meta && (meta.totalPages > 1 || meta.pages > 1) && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages || meta.pages}
              total={meta.total}
              limit={meta.limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Credit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleCreditSubmit}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-slide-up"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{copy.modal.title}</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.modal.amount}
                </label>
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.modal.note}
                </label>
                <input
                  name="note"
                  type="text"
                  placeholder={copy.modal.notePlaceholder}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {copy.modal.cancel}
              </button>
              <button
                type="submit"
                disabled={creditMutation.isPending}
                className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50"
              >
                {creditMutation.isPending
                  ? copy.modal.confirming
                  : copy.modal.confirm}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
