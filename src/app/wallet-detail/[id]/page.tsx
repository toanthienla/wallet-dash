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

interface WalletDetail {
  userName: string;
  email: string;
  walletAddress: string;
  currentBalance: number;
  totalDeposit: number;
  totalWithdrawal: number;
  totalReceived: number;
  chartData: { date: string; balance: number }[];
  assets: WalletAsset[];
}

export default function WalletDetailPage() {
  // const params = useParams();
  // const walletAddress = params.id as string;
  const walletAddress = "0xe39a611233c237ea006E5406dc1DEAce1ED38368";

  const [wallet, setWallet] = useState<WalletDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);

  // --- Pagination State & Logic ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // số transaction hiển thị mỗi trang
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await axiosClient.get(`${API_URL}/wallets/dashboard/${walletAddress}`);
        const apiData = res.data?.data;

        const totalAssets = apiData.assets;
        const assets = apiData.balances.map((b: any, i: number) => ({
          name: b.currency.name,
          amount: b.assets.toFixed(4),
          percentage: parseFloat(((b.assets / totalAssets) * 100).toFixed(2)),
          color: ["bg-green-500", "bg-orange-500", "bg-blue-500", "bg-purple-500"][i % 4],
        }));

        // Không map chartData từ balances nữa
        setWallet({
          userName: apiData.user.username,
          email: apiData.user.email,
          walletAddress: apiData.wallet_address,
          currentBalance: totalAssets,
          totalDeposit: apiData.total_deposit,
          totalWithdrawal: apiData.total_withdrawn,
          totalReceived: apiData.total_received,
          assets,
          chartData: [], // tạm thời rỗng, sẽ fetch API chart riêng
        });
      } catch {
        setWallet(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [walletAddress]);

  // ✅ Fetch Transaction History
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axiosClient.get(`${API_URL}/transaction/dashboard/${walletAddress}`);
        const data = res.data?.data?.transactions || [];

        const formatted = data.map((tx: any) => ({
          date: new Date(tx.date_created).toLocaleString(),
          id: tx.hash ?? "-",
          type: tx.transaction_type?.name ?? "-",
          amount: `${tx.amount} ${tx.currency_slug.toUpperCase()}`,
          asset: tx.currency_data?.full_name || tx.currency_slug.toUpperCase(),
          address: tx.from_address || tx.to_address || "-",
          status: tx.transaction_status,
        }));

        setTransactions(formatted);
      } catch {
        setTransactions([]);
      } finally {
        setLoadingTx(false);
      }
    };

    fetchTransactions();
  }, [walletAddress]);

  // ✅ Fetch Chart Data from statistic-total-assets API
  useEffect(() => {
    const fetchWalletChart = async () => {
      try {
        const res = await axiosClient.get(
          `${API_URL}/wallets/dashboard/statistic-total-assets/${walletAddress}`
        );

        // map API mới về {date, balance}
        const chartData = res.data.labels.map((label: string, i: number) => ({
          date: new Date(label).toLocaleString(),
          balance: res.data.data[0].values[i],
        }));

        // update wallet state với chartData
        setWallet((prev) => prev ? { ...prev, chartData } : null);
      } catch (err) {
        console.error("Error fetching chart data:", err);
      }
    };

    fetchWalletChart();
  }, [walletAddress]);

  if (loading) return <div>Loading...</div>;
  if (!wallet) return <div>Wallet not found</div>;

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
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {wallet.userName.slice(0, 2).toUpperCase()}
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

                {/* Time range filter + Date range + Stat summary */}
                <div className="flex items-center gap-4">
                  {/* Time filter */}
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

                  {/* Date range picker */}
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

                  {/* Summary stats */}
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

              {/* Chart */}
              <div className="h-80">
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
                          data={wallet.assets.map((a) => ({ name: a.name, value: a.percentage }))}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {wallet.assets.map((a, i) => (
                            <Cell key={i} fill={a.color.replace("bg-", "#")} />
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
                        <span className={`w-2.5 h-2.5 rounded-full ${a.color}`}></span>
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
                          {/* Có thể dùng icon thật nếu API có trả về link hình ảnh */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${asset.color} bg-opacity-10`}
                          >
                            <span className="text-sm font-semibold text-gray-700">
                              {asset.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{asset.name}</p>
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
            </div> {/* ✅ Đóng grid */}

            {/* Transaction History */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-8">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Transaction History</h3>

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
                      <tr><td colSpan={8} className="text-center py-6 text-gray-500">Loading...</td></tr>
                    ) : transactions.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-6 text-gray-500">No transactions found</td></tr>
                    ) : (
                      paginatedTransactions.map((t, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-6">{t.date}</td>
                          <td className="py-3 px-6 text-blue-600 font-mono">{t.id}</td>
                          <td className="py-3 px-6">{t.type}</td>
                          <td className="py-3 px-6">{t.amount}</td>
                          <td className="py-3 px-6 text-indigo-500">{t.asset}</td>
                          <td className="py-3 px-6">{t.address}</td>
                          <td className="py-3 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs ${t.status === "success"
                                ? "bg-green-50 text-green-600"
                                : t.status === "pending"
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-red-50 text-red-600"
                              }`}>{t.status}</span>
                          </td>
                          <td className="py-3 px-6 text-right">
                            <button className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs">View detail</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <button
                  className={`inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages || 1 }).map((_, i) => (
                    <button
                      key={i}
                      className={`w-8 h-8 rounded-lg text-sm font-medium ${i + 1 === currentPage ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                        }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  className={`inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  Next →
                </button>
              </div>

            </section>

          </main>
        </div>
      </div>
    </div>
  );
}
