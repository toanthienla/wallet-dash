"use client";
import React, { useEffect, useState } from "react";
import AppSidebar from "@/layout/AppSidebar";
import AppHeader from "@/layout/AppHeader";
import { ArrowLeft, MoreHorizontal, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { API_URL } from "@/utils/constants";
import axiosClient from "@/utils/axiosClient";
import Image from "next/image";

// Types
interface Balance {
  id: string;
  master_wallet_id: string;
  total_value: number;
  current_value: number;
  currency_slug: string;
  currency: {
    name: string;
    id: number;
    slug: string;
    full_name: string;
    icon: string;
    link: string;
    usd_rate: number;
    decimals: number;
    is_native_token: boolean;
    is_crypto_token: boolean;
    is_fiat_token: boolean;
    asset_type: string;
  };
  usd_rate: number;
  pnl: string;
  assets: number;
}

interface AssetCategory {
  type: string;
  label: string;
  totalValue: number;
  percentage: number;
  color: string;
}

interface Transaction {
  date: string;
  id: string;
  type: string;
  amount: string;
  asset: string;
  assetType: string;
  address: string;
  status: string;
}

interface WalletDetail {
  userName: string;
  userInitials: string;
  email: string;
  walletAddress: string;
  userId: string | null;
  userColor: string;
  currentBalance: number;
  totalDeposit: number;
  totalWithdrawal: number;
  totalReceived: number;
  chartData: { date: string; balance: number }[];
  balances: Balance[];
  assetCategories: AssetCategory[];
}

// --- MODIFIED: Updated PaginationMeta type to remove cursors ---
interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}


// Colors
const COLORS = [
  "#10b981", // green-500
  "#f97316", // orange-500
  "#3b82f6", // blue-500
  "#a855f7", // purple-500
  "#ef4444", // red-500
  "#f59e0b", // amber-500
];

const ASSET_TYPE_COLORS: { [key: string]: string } = {
  fiat: "#3b82f6",
  crypto: "#a855f7",
  native: "#10b981",
};

const ASSET_TYPE_LABELS: { [key: string]: string } = {
  fiat: "Fiat",
  crypto: "Crypto",
  native: "Native",
};

// Utility Functions
function getAssetColor(index: number) {
  return COLORS[index % COLORS.length];
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getUserColor(userId: string | null): string {
  if (!userId) return getAssetColor(0);
  const hash = hashCode(userId);
  return getAssetColor(hash);
}

function generateUserInfo(userData: {
  first_name: string | null;
  last_name: string | null;
  username: string;
}) {
  const fullName =
    [userData.first_name, userData.last_name].filter(Boolean).join(" ") ||
    userData.username ||
    "No user info";

  const initials = fullName
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  return { fullName, initials };
}

function formatAssetType(assetType: string): string {
  if (!assetType) return "-";
  return assetType.charAt(0).toUpperCase() + assetType.slice(1);
}

function parsePnL(pnlStr: string): { value: number; isPositive: boolean } {
  const value = parseFloat(pnlStr);
  return {
    value: Math.abs(value),
    isPositive: value >= 0,
  };
}

// Skeleton Components
function UserInfoCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-gray-200"></div>
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="text-right">
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}

function SummaryCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
      <div className="h-8 bg-gray-200 rounded w-32"></div>
    </div>
  );
}

function ChartSectionSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
        <div className="space-y-2">
          <div className="flex gap-4">
            <div className="h-8 bg-gray-200 rounded-full w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
      <div className="h-80 bg-gray-200 rounded"></div>
    </div>
  );
}

function AssetSectionSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TransactionTableSkeleton() {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-8 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-4 border-b border-gray-100 last:border-b-0">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Main Component
export default function WalletDetailPage() {
  const params = useParams();
  const walletAddress = params.id as string;

  const [wallet, setWallet] = useState<WalletDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);

  // --- MODIFIED: Pagination state updated for page-number based logic ---
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Corresponds to 'take'
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false,
  });

  // --- REMOVED: Cursor history state is no longer needed ---
  // const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  // ✅ Fetch Wallet Details
  useEffect(() => {
    if (!walletAddress) return;

    const fetchWallet = async () => {
      try {
        const res = await axiosClient.get(`${API_URL}/wallets/dashboard/${walletAddress}`);
        const apiData = res.data?.data;

        const totalAssetsValue = apiData.balances.reduce(
          (sum: number, balance: Balance) => sum + balance.total_value,
          0
        );

        const groupedByType: { [key: string]: Balance[] } = {};
        apiData.balances.forEach((balance: Balance) => {
          const assetType = balance.currency.asset_type || "unknown";
          if (!groupedByType[assetType]) {
            groupedByType[assetType] = [];
          }
          groupedByType[assetType].push(balance);
        });

        const assetCategories: AssetCategory[] = [];
        Object.entries(groupedByType).forEach(([type, balances]) => {
          const categoryTotal = balances.reduce((sum, b) => sum + b.total_value, 0);
          const percentage =
            totalAssetsValue > 0
              ? parseFloat(((categoryTotal / totalAssetsValue) * 100).toFixed(2))
              : 0;

          assetCategories.push({
            type,
            label: ASSET_TYPE_LABELS[type] || type,
            totalValue: categoryTotal,
            percentage,
            color: ASSET_TYPE_COLORS[type] || getAssetColor(Object.keys(groupedByType).indexOf(type)),
          });
        });

        const balances = apiData.balances;
        const { fullName, initials } = generateUserInfo(apiData.user);
        const userId = apiData.user.id;
        const userColor = getUserColor(userId);

        setWallet({
          userName: fullName,
          userInitials: initials,
          email: apiData.user.email,
          walletAddress: apiData.wallet_address,
          userId,
          userColor,
          currentBalance: totalAssetsValue,
          totalDeposit: apiData.total_deposit,
          totalWithdrawal: apiData.total_withdrawn,
          totalReceived: apiData.total_received,
          balances,
          assetCategories,
          chartData: [],
        });
      } catch (error) {
        console.error("Error fetching wallet:", error);
        setWallet(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [walletAddress]);

  // --- MODIFIED: Fetch Transaction History with Page-Number-Based Pagination ---
  useEffect(() => {
    if (!walletAddress) return;

    const fetchTransactions = async () => {
      try {
        setLoadingTx(true);
        const params = {
          page: currentPage,
          take: pageSize, // Using 'take' as specified in your new parameters
        };

        const res = await axiosClient.get(`${API_URL}/transaction/dashboard/${walletAddress}`, {
          params,
        });

        const responseData = res.data?.data;
        // Assuming pagination data is directly in `responseData` as per your example
        const paginatedInfo = responseData;

        setPaginationMeta({
          totalItems: paginatedInfo.number_records || 0,
          totalPages: paginatedInfo.pages || 1,
          currentPage: paginatedInfo.page || currentPage,
          itemsPerPage: paginatedInfo.take || pageSize,
          hasNext: paginatedInfo.has_next || false,
          hasPrev: paginatedInfo.has_prev || false,
        });

        const transactions_data = responseData?.transactions || [];

        const formatted = transactions_data.map((tx: any) => ({
          date: new Date(tx.date_created).toLocaleString(),
          id: tx.id?.toString() ?? "-",
          type: tx.transaction_type?.name ?? "-",
          amount: `${tx.amount} ${tx.currency_slug.toUpperCase()}`,
          asset: tx.currency_data?.asset_type ?? "-",
          assetType: tx.currency_data?.asset_type ?? "-",
          address: tx.from_address || tx.to_address || "-",
          status: tx.transaction_status,
        }));

        setTransactions(formatted);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setTransactions([]);
      } finally {
        setLoadingTx(false);
      }
    };

    fetchTransactions();
  }, [walletAddress, currentPage, pageSize]); // Dependency array is now simpler

  // ✅ Fetch Chart Data
  useEffect(() => {
    if (!walletAddress) return;

    const fetchWalletChart = async () => {
      try {
        const res = await axiosClient.get(
          `${API_URL}/wallets/dashboard/statistic-total-assets/${walletAddress}`
        );

        if (res.data.labels && res.data.data[0]?.values) {
          const chartData = res.data.labels.map((label: string, i: number) => ({
            date: new Date(label).toLocaleDateString(),
            balance: res.data.data[0].values[i],
          }));
          setWallet((prev) => (prev ? { ...prev, chartData } : null));
        } else {
          setWallet((prev) => (prev ? { ...prev, chartData: [] } : null));
        }
      } catch (err) {
        console.error("Error fetching chart data:", err);
      }
    };

    fetchWalletChart();
  }, [walletAddress]);

  // --- MODIFIED: Pagination Handlers are now simpler ---
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationMeta.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to page 1 when page size changes
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <AppSidebar />
          <div className="flex-1 min-h-screen">
            <AppHeader />
            <main className="px-8 py-8">
              <div className="mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              </div>

              <UserInfoCardSkeleton />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <SummaryCardSkeleton />
                <SummaryCardSkeleton />
                <SummaryCardSkeleton />
              </div>

              <ChartSectionSkeleton />

              <AssetSectionSkeleton />

              <TransactionTableSkeleton />
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <AppSidebar />
          <div className="flex-1 min-h-screen">
            <AppHeader />
            <main className="px-8 py-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
                <div className="text-center">
                  <div className="mb-4">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Wallet Not Found</h3>
                  <p className="text-gray-500">The wallet you are looking for does not exist.</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AppSidebar />
        <div className="flex-1 min-h-screen">
          <AppHeader />

          <main className="px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <Link href="/user-wallet">
                  <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border hover:bg-gray-50 transition">
                    <ArrowLeft size={18} className="text-gray-700" />
                  </button>
                </Link>
                <h1 className="text-xl font-semibold text-gray-900">Wallet Details</h1>
              </div>
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: wallet.userColor }}
                  >
                    <span className="text-2xl font-bold text-white">{wallet.userInitials}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{wallet.userName}</h2>
                    <p className="text-gray-500">Wallet: {wallet.walletAddress}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ${wallet.currentBalance.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-sm text-gray-500">Current Balance</div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[wallet.totalDeposit, wallet.totalWithdrawal, wallet.totalReceived].map(
                (v, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
                    <p className="text-sm text-gray-500">
                      {["Total Deposit", "Total Withdrawal", "Total Received"][i]}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                      ${v.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                )
              )}
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Statistics</h3>

                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                    {["Daily", "Weekly", "Monthly"].map((label, i) => (
                      <button
                        key={i}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition ${label === "Daily"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <button className="flex items-center px-3 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    05 Feb – 06 March
                  </button>

                  <div className="flex items-center gap-6">
                    <div className="flex flex-col text-right">
                      <p className="text-sm text-gray-500">Avg. Deposit</p>
                      <p className="text-base font-semibold text-gray-900">$212,142.12</p>
                    </div>
                    <div className="flex flex-col text-right">
                      <p className="text-sm text-gray-500">Avg. Interest</p>
                      <p className="text-base font-semibold text-gray-900">$30,321.23</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-80">
                {wallet.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={wallet.chartData}>
                      <CartesianGrid stroke="#F3F4F6" vertical={false} />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#2563EB"
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No statistical data available.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Assets Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Asset Category */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-base font-semibold text-gray-900">Asset Category</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  {/* Pie Chart */}
                  <div className="relative w-40 h-40">
                    {wallet.assetCategories.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={wallet.assetCategories.map((cat) => ({
                              name: cat.label,
                              value: cat.percentage,
                            }))}
                            innerRadius={60}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {wallet.assetCategories.map((cat, i) => (
                              <Cell key={i} fill={cat.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : null}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">
                        ${(wallet.currentBalance / 1000).toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 1,
                        })}
                        K
                      </span>
                      <span className="text-sm text-gray-500">Total</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-4 ml-8 flex-1">
                    {wallet.assetCategories.map((cat, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span
                          className={`w-3 h-3 rounded-full flex-shrink-0`}
                          style={{ backgroundColor: cat.color }}
                        ></span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{cat.label}</p>
                          <p className="text-xs text-gray-500">
                            {cat.percentage}% • ${cat.totalValue.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Asset List */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-base font-semibold text-gray-900">Asset list</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {wallet.balances.length === 0 ? (
                    <p className="text-center py-6 text-gray-500">No assets found</p>
                  ) : (
                    wallet.balances.map((balance, i) => {
                      const pnl = parsePnL(balance.pnl);

                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between py-4 px-3 hover:bg-gray-50 rounded-lg transition border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Currency Icon */}
                            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-100">
                              {balance.currency.link ? (
                                <img
                                  src={balance.currency.link}
                                  alt={balance.currency.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.parentElement!.innerHTML = `<span class="text-xs font-semibold text-gray-600">${balance.currency.name
                                      .slice(0, 2)
                                      .toUpperCase()}</span>`;
                                  }}
                                />
                              ) : (
                                <span className="text-xs font-semibold text-gray-600">
                                  {balance.currency.name.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>

                            {/* Currency Details */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {balance.currency.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {balance.currency.full_name}
                              </p>
                            </div>
                          </div>

                          {/* Value and PnL */}
                          <div className="text-right ml-2 flex-shrink-0">
                            <p className="text-sm font-semibold text-gray-900">
                              ${balance.total_value.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              {pnl.isPositive ? (
                                <>
                                  <TrendingUp size={14} className="text-green-500" />
                                  <span className="text-xs text-green-500 font-medium">
                                    +{pnl.value.toFixed(2)}%
                                  </span>
                                </>
                              ) : (
                                <>
                                  <TrendingDown size={14} className="text-red-500" />
                                  <span className="text-xs text-red-500 font-medium">
                                    {pnl.value.toFixed(2)}%
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-gray-900">Transaction History</h3>
                <div className="flex items-center gap-2">
                  <label htmlFor="pageSize" className="text-sm text-gray-600">
                    Show:
                  </label>
                  <select
                    id="pageSize"
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700">
                  <thead className="text-gray-500 border-b">
                    <tr>
                      <th className="py-3 px-6">Date/time</th>
                      <th className="py-3 px-6">Transaction ID</th>
                      <th className="py-3 px-6">Type</th>
                      <th className="py-3 px-6">Amount</th>
                      <th className="py-3 px-6">Asset</th>
                      <th className="py-3 px-6">Wallet Address</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTx ? (
                      <tr>
                        <td colSpan={8} className="text-center py-6 text-gray-500">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            Loading transactions...
                          </div>
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-6 text-gray-500">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      transactions.map((t, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-6">{t.date}</td>
                          <td className="py-3 px-6 font-mono text-xs">{t.id}</td>
                          <td className="py-3 px-6">{t.type}</td>
                          <td className="py-3 px-6 font-semibold">{t.amount}</td>
                          <td className="py-3 px-6">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {formatAssetType(t.assetType)}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-xs font-mono">
                            {t.address.length > 20 ? `${t.address.slice(0, 20)}...` : t.address}
                          </td>
                          <td className="py-3 px-6">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${t.status === "success"
                                ? "bg-green-50 text-green-600"
                                : t.status === "pending"
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-red-50 text-red-600"
                                }`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-right">
                            <button className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 transition">
                              View detail
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  {transactions.length === 0 ? (
                    <span>No transactions to display</span>
                  ) : (
                    <>
                      Showing{" "}
                      {paginationMeta.totalItems === 0
                        ? 0
                        : (currentPage - 1) * paginationMeta.itemsPerPage + 1}{" "}
                      to{" "}
                      {Math.min(
                        currentPage * paginationMeta.itemsPerPage,
                        paginationMeta.totalItems
                      )}{" "}
                      of <span className="font-semibold">{paginationMeta.totalItems}</span>{" "}
                      transactions
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Previous Button */}
                  <button
                    className={`inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium transition ${currentPage === 1 || !paginationMeta.hasPrev
                      ? "text-gray-400 cursor-not-allowed bg-gray-50"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    disabled={currentPage === 1 || !paginationMeta.hasPrev}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  {/* Page Info */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Page <span className="font-semibold">{currentPage}</span> of{" "}
                      <span className="font-semibold">{paginationMeta.totalPages}</span>
                    </span>
                  </div>

                  {/* Page Number Input */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="pageInput" className="text-sm text-gray-600">
                      Go to:
                    </label>
                    <input
                      id="pageInput"
                      type="number"
                      min="1"
                      max={paginationMeta.totalPages}
                      value={currentPage}
                      onChange={(e) => {
                        const page = Number(e.target.value);
                        if (page >= 1 && page <= paginationMeta.totalPages) {
                          handlePageChange(page);
                        }
                      }}
                      className="w-12 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Next Button */}
                  <button
                    className={`inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium transition ${!paginationMeta.hasNext
                      ? "text-gray-400 cursor-not-allowed bg-gray-50"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    disabled={!paginationMeta.hasNext}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Pagination Info */}
              {paginationMeta.totalPages > 1 && (
                <div className="mt-4 flex flex-wrap gap-2 items-center justify-center">
                  {Array.from({ length: Math.min(paginationMeta.totalPages, 5) }, (_, i) => {
                    const pageNum =
                      currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (pageNum > paginationMeta.totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg font-medium text-sm transition ${currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {paginationMeta.totalPages > 5 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <button
                        onClick={() => handlePageChange(paginationMeta.totalPages)}
                        className={`w-8 h-8 rounded-lg font-medium text-sm transition ${currentPage === paginationMeta.totalPages
                          ? "bg-blue-600 text-white"
                          : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {paginationMeta.totalPages}
                      </button>
                    </>
                  )}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}