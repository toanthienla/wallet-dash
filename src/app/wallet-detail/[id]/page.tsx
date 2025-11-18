"use client";
import React, { useEffect, useState } from "react";

import AppSidebar from "@/layout/AppSidebar";
import AppHeader from "@/layout/AppHeader";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
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

// Types
interface WalletAsset {
  name: string;
  amount: string;
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
  assets: WalletAsset[];
}

interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
}

// --- Dynamic Color Generation ---
const COLORS = [
  "#10b981", // green-500
  "#f97316", // orange-500
  "#3b82f6", // blue-500
  "#a855f7", // purple-500
  "#ef4444", // red-500
  "#f59e0b", // amber-500
];

function getAssetColor(index: number) {
  return COLORS[index % COLORS.length];
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function getUserColor(userId: string | null): string {
  if (!userId) {
    return getAssetColor(0); // Default green for no user
  }
  const hash = hashCode(userId);
  return getAssetColor(hash);
}

// Helper function to generate user info with full name and initials
function generateUserInfo(userData: { first_name: string | null; last_name: string | null; username: string }) {
  const fullName = [userData.first_name, userData.last_name]
    .filter(Boolean)
    .join(" ") || userData.username || "No user info";

  const initials = fullName
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  return { fullName, initials };
}

// Helper function to format asset type for display
function formatAssetType(assetType: string): string {
  if (!assetType) return "-";
  return assetType.charAt(0).toUpperCase() + assetType.slice(1);
}

// Skeleton loaders
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
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
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

export default function WalletDetailPage() {
  const params = useParams();
  const walletAddress = params.id as string;

  const [wallet, setWallet] = useState<WalletDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);

  // --- Pagination State & Logic ---
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false,
    nextCursor: null,
    prevCursor: null,
  });

  // Store cursors for navigation
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  // ✅ Fetch Wallet Details
  useEffect(() => {
    if (!walletAddress) return;

    const fetchWallet = async () => {
      try {
        const res = await axiosClient.get(`${API_URL}/wallets/dashboard/${walletAddress}`);
        const apiData = res.data?.data;

        // FIX: Calculate total balance from the 'balances' array
        const totalAssetsValue = apiData.balances.reduce((sum: number, asset: any) => sum + asset.total_value, 0);

        const assets = apiData.balances.map((b: any, i: number) => ({
          name: b.currency.name,
          amount: b.assets.toFixed(4),
          // FIX: Prevent division by zero
          percentage: totalAssetsValue > 0 ? parseFloat(((b.total_value / totalAssetsValue) * 100).toFixed(2)) : 0,
          color: getAssetColor(i),
        }));

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
          currentBalance: totalAssetsValue, // FIX: Use calculated total
          totalDeposit: apiData.total_deposit,
          totalWithdrawal: apiData.total_withdrawn,
          totalReceived: apiData.total_received,
          assets,
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

  // ✅ Fetch Transaction History with Cursor-Based Pagination
  useEffect(() => {
    if (!walletAddress) return;

    const fetchTransactions = async () => {
      try {
        setLoadingTx(true);
        const params: any = {
          limit: 10,
        };

        // Use cursor for pagination if on page > 1
        if (currentPage > 1 && cursorHistory.length > 0) {
          params.cursor = cursorHistory[currentPage - 2];
        }

        const res = await axiosClient.get(
          `${API_URL}/transaction/dashboard/${walletAddress}`,
          { params }
        );

        const responseData = res.data?.data;
        const paginatedInfo = responseData?.paginated || {};

        // Calculate total pages
        const totalRecords = paginatedInfo.number_records || 0;
        const limit = paginatedInfo.limit || 10;
        const totalPages = Math.ceil(totalRecords / limit);

        setPaginationMeta({
          totalItems: totalRecords,
          totalPages,
          currentPage,
          itemsPerPage: limit,
          hasNext: paginatedInfo.has_next || false,
          hasPrev: paginatedInfo.has_prev || false,
          nextCursor: paginatedInfo.next_cursor || null,
          prevCursor: paginatedInfo.prev_cursor || null,
        });

        // Update cursor history for forward/backward navigation
        if (paginatedInfo.next_cursor && !cursorHistory.includes(paginatedInfo.next_cursor)) {
          setCursorHistory((prev) => [...prev, paginatedInfo.next_cursor]);
        }

        const transactions_data = responseData?.transactions || [];

        const formatted = transactions_data.map((tx: any) => ({
          date: new Date(tx.date_created).toLocaleString(),
          id: tx.id?.toString() ?? "-", // ✅ Use tx.id instead of tx.hash
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
  }, [walletAddress, currentPage]);

  // ✅ Fetch Chart Data from statistic-total-assets API
  useEffect(() => {
    if (!walletAddress) return;

    const fetchWalletChart = async () => {
      try {
        const res = await axiosClient.get(
          `${API_URL}/wallets/dashboard/statistic-total-assets/${walletAddress}`
        );

        if (res.data.labels && res.data.data[0]?.values) {
          const chartData = res.data.labels.map((label: string, i: number) => ({
            date: new Date(label).toLocaleDateString(), // Use toLocaleDateString for cleaner date format
            balance: res.data.data[0].values[i],
          }));
          setWallet((prev) => (prev ? { ...prev, chartData } : null));
        } else {
          // Handle case with no chart data
          setWallet((prev) => (prev ? { ...prev, chartData: [] } : null));
        }
      } catch (err) {
        console.error("Error fetching chart data:", err);
      }
    };

    fetchWalletChart();
  }, [walletAddress]);

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
                    <span className="text-2xl font-bold text-white">
                      {wallet.userInitials}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{wallet.userName}</h2>
                    <p className="text-gray-500">Wallet: {wallet.walletAddress}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ${wallet.currentBalance.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Current Balance</div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[wallet.totalDeposit, wallet.totalWithdrawal, wallet.totalReceived].map((v, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
                  <p className="text-sm text-gray-500">{["Total Deposit", "Total Withdrawal", "Total Received"][i]}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">${v.toLocaleString()}</p>
                </div>
              ))}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Asset Category</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="relative w-40 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={wallet.assets.map((a) => ({
                            name: a.name,
                            value: a.percentage,
                          }))}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {wallet.assets.map((a, i) => (
                            <Cell
                              key={i}
                              fill={a.color}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">
                        ${wallet.currentBalance.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">Total</span>
                    </div>
                  </div>

                  <div className="space-y-3 ml-6">
                    {wallet.assets.map((a, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full`}
                          style={{ backgroundColor: a.color }}
                        ></span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{a.name}</p>
                          <p className="text-xs text-gray-500">
                            {a.percentage}% - {a.amount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Asset List */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Asset List</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {wallet.assets.length === 0 ? (
                    <p className="text-center py-6 text-gray-500">No assets found</p>
                  ) : (
                    wallet.assets.map((asset, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-3 hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-sm"
                            style={{ backgroundColor: asset.color }}
                          >
                            {asset.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {asset.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {asset.percentage}% of total
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            ${Number(asset.amount).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">—</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-8">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Transaction History
              </h3>

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
                      <th></th>
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
                          <td className="py-3 px-6 text-blue-600 font-mono text-xs font-semibold">
                            {t.id}
                          </td>
                          <td className="py-3 px-6">{t.type}</td>
                          <td className="py-3 px-6">{t.amount}</td>
                          <td className="py-3 px-6">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {formatAssetType(t.assetType)}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-xs">
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
                      Showing {(currentPage - 1) * paginationMeta.itemsPerPage + 1} to{" "}
                      {Math.min(currentPage * paginationMeta.itemsPerPage, paginationMeta.totalItems)} of{" "}
                      <span className="font-semibold">{paginationMeta.totalItems}</span> transactions
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className={`inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium transition ${currentPage === 1 || !paginationMeta.hasPrev
                      ? "text-gray-400 cursor-not-allowed bg-gray-50"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    disabled={currentPage === 1 || !paginationMeta.hasPrev}
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage((prev) => prev - 1);
                      }
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Page <span className="font-semibold">{currentPage}</span> of{" "}
                      <span className="font-semibold">{paginationMeta.totalPages}</span>
                    </span>
                  </div>

                  <button
                    className={`inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium transition ${!paginationMeta.hasNext
                      ? "text-gray-400 cursor-not-allowed bg-gray-50"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    disabled={!paginationMeta.hasNext}
                    onClick={() => {
                      if (paginationMeta.hasNext) {
                        setCurrentPage((prev) => prev + 1);
                      }
                    }}
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}