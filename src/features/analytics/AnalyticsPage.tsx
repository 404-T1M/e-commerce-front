import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart2,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Users,
  MessageSquare,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  BarChart as BarChartIcon,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { analyticsApi } from "@/api/analytics.api";
import {
  cn,
  DEFAULT_CURRENCY,
  formatCompactCurrency,
  formatCurrency,
  getIntlLocale,
} from "@/utils";
import { useLocale } from "@/contexts/LocaleContext";

type ChartTooltipItem = {
  dataKey?: string | number;
  name?: string;
  color?: string;
  value?: number | string | null;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: ChartTooltipItem[];
  label?: string | number;
  currency: string;
  intlLocale: string;
};

function ChartTooltip({
  active,
  payload,
  label,
  currency,
  intlLocale,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 space-y-1">
      <p className="text-xs font-semibold text-slate-500 mb-2">{label}</p>
      {payload.map((p) => (
        <div
          key={p.dataKey ?? p.name}
          className="flex items-center gap-2 text-sm"
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: p.color ?? "#94a3b8" }}
          />
          <span className="text-slate-600 capitalize">{p.name}:</span>
          <span className="font-semibold text-slate-900">
            {formatCurrency(Number(p.value ?? 0), currency, intlLocale)}
          </span>
        </div>
      ))}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  iconColor: string;
  loading?: boolean;
}

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  iconBg,
  iconColor,
  loading,
}: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 ${gradient} border border-white/20 shadow-sm`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-60">
            {label}
          </p>
          {loading ? (
            <div className="mt-2 h-8 w-20 rounded-lg skeleton" />
          ) : (
            <p className="mt-1 text-3xl font-bold">{value}</p>
          )}
        </div>
        <div
          className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10">
        <Icon className="w-full h-full" />
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const { locale } = useLocale();
  const intlLocale = getIntlLocale(locale);
  const currency = DEFAULT_CURRENCY;

  const copy =
    locale === "ar"
      ? {
          title: "نظرة عامة",
          subtitle: "رؤى الأعمال واتجاهات الإيرادات",
          liveData: "بيانات مباشرة",
          refresh: "تحديث",
          statsTitle: "نظرة عامة",
          chartTitle: "الإيرادات والأرباح",
          chartSubtitle: (y: number) => `تحليل شهري لعام ${y}`,
          revenue: "الإيرادات",
          profit: "الربح",
          area: "منطقة",
          bar: "أعمدة",
          stats: {
            newOrders: "طلبات جديدة",
            activeOrders: "طلبات نشطة",
            completedOrders: "طلبات مكتملة",
            totalCustomers: "إجمالي العملاء",
            incomingMessages: "الرسائل الواردة",
          },
        }
      : {
          title: "Overview",
          subtitle: "Business insights & revenue trends",
          liveData: "Live data",
          refresh: "Refresh",
          statsTitle: "Overview",
          chartTitle: "Revenue & Profit",
          chartSubtitle: (y: number) => `Monthly breakdown for ${y}`,
          revenue: "Revenue",
          profit: "Profit",
          area: "Area",
          bar: "Bar",
          stats: {
            newOrders: "New Orders",
            activeOrders: "Active Orders",
            completedOrders: "Completed Orders",
            totalCustomers: "Total Customers",
            incomingMessages: "Incoming Messages",
          },
        };

  const {
    data: overview,
    isLoading: overviewLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: analyticsApi.getOverview,
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["analytics-profit-chart", year],
    queryFn: () => analyticsApi.getProfitChart(year),
  });

  const monthFormatter = new Intl.DateTimeFormat(intlLocale, {
    month: "short",
  });
  const chartPoints = (chartData?.chart ?? []).map((m) => ({
    name: monthFormatter.format(new Date(year, m.month - 1, 1)),
    revenue: m.revenue,
    profit: m.profit,
  }));

  const totalRevenue = chartData?.chart.reduce((s, m) => s + m.revenue, 0) ?? 0;
  const totalProfit = chartData?.chart.reduce((s, m) => s + m.profit, 0) ?? 0;

  const STATS: StatCardProps[] = [
    {
      label: copy.stats.newOrders,
      value: overview?.newOrders ?? 0,
      icon: ShoppingBag,
      gradient: "bg-gradient-to-br from-amber-50  to-orange-50  text-amber-900",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      label: copy.stats.activeOrders,
      value: overview?.activeOrders ?? 0,
      icon: Clock,
      gradient: "bg-gradient-to-br from-blue-50   to-sky-50     text-blue-900",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: copy.stats.completedOrders,
      value: overview?.completedOrders ?? 0,
      icon: CheckCircle2,
      gradient:
        "bg-gradient-to-br from-emerald-50 to-green-50  text-emerald-900",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: copy.stats.totalCustomers,
      value: overview?.totalCustomers ?? 0,
      icon: Users,
      gradient:
        "bg-gradient-to-br from-purple-50 to-violet-50  text-purple-900",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: copy.stats.incomingMessages,
      value: overview?.incomingMessages ?? 0,
      icon: MessageSquare,
      gradient: "bg-gradient-to-br from-rose-50   to-pink-50    text-rose-900",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-brand-600" /> {copy.title}
          </h1>
          <p className="page-subtitle">{copy.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-white border border-slate-200 px-3 py-2 rounded-xl">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />{" "}
            {copy.liveData}
          </div>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="btn-secondary btn-sm"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`}
            />{" "}
            {copy.refresh}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          <Activity className="w-4 h-4" /> {copy.statsTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} loading={overviewLoading} />
          ))}
        </div>
      </div>

      {/* Revenue & Profit Chart */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex-1">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
              <TrendingUp className="w-5 h-5 text-brand-600" />{" "}
              {copy.chartTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {copy.chartSubtitle(year)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                {copy.revenue}
              </p>
              <p className="text-sm font-bold text-indigo-600">
                {formatCompactCurrency(totalRevenue, currency, intlLocale)}
              </p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                {copy.profit}
              </p>
              <p className="text-sm font-bold text-emerald-600">
                {formatCompactCurrency(totalProfit, currency, intlLocale)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="input py-1.5 pr-8 text-sm appearance-none min-w-[90px]"
              >
                {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
            <div className="flex rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setChartType("area")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5",
                  chartType === "area"
                    ? "bg-brand-600 text-white"
                    : "bg-white text-slate-500 hover:bg-slate-50",
                )}
              >
                <Activity className="w-3 h-3" /> {copy.area}
              </button>
              <button
                onClick={() => setChartType("bar")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5",
                  chartType === "bar"
                    ? "bg-brand-600 text-white"
                    : "bg-white text-slate-500 hover:bg-slate-50",
                )}
              >
                <BarChartIcon className="w-3 h-3" /> {copy.bar}
              </button>
            </div>
          </div>
        </div>

        {chartLoading ? (
          <div className="h-72 skeleton rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={288}>
            {chartType === "area" ? (
              <AreaChart
                data={chartPoints}
                margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="ovGradRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ovGradPro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) =>
                    formatCompactCurrency(Number(v), currency, intlLocale)
                  }
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  content={
                    <ChartTooltip currency={currency} intlLocale={intlLocale} />
                  }
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  formatter={(v) => (
                    <span className="text-slate-600 capitalize">{v}</span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name={copy.revenue}
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#ovGradRev)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name={copy.profit}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#ovGradPro)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            ) : (
              <BarChart
                data={chartPoints}
                margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) =>
                    formatCompactCurrency(Number(v), currency, intlLocale)
                  }
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  content={
                    <ChartTooltip currency={currency} intlLocale={intlLocale} />
                  }
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  formatter={(v) => (
                    <span className="text-slate-600 capitalize">{v}</span>
                  )}
                />
                <Bar
                  dataKey="revenue"
                  name={copy.revenue}
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="profit"
                  name={copy.profit}
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
