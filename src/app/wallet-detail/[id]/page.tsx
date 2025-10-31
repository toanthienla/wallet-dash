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

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await axiosClient.get(
          `${API_URL}/wallets/dashboard/${walletAddress}`,
          {
            headers: {
              "Content-Type": "application/json",
            }
          }
        );

        const data = res.data;
        const apiData = data.data;

        if (!apiData) {
          console.error("Invalid data structure", data);
          setWallet(null);
          setLoading(false);
          return;
        }

        const totalAssets = apiData.assets;
        const assets = apiData.balances.map((b: any, i: number) => ({
          name: b.currency.name,
          amount: b.assets.toFixed(4),
          percentage: parseFloat(((b.assets / totalAssets) * 100).toFixed(2)),
          color: ["bg-green-500", "bg-orange-500", "bg-blue-500", "bg-purple-500"][i % 4],
        }));

        const chartData = apiData.balances.map((b: any, i: number) => ({
          date: `T${i + 1}`,
          balance: b.current_value,
        }));

        setWallet({
          userName: apiData.user.username,
          email: apiData.user.email,
          walletAddress: apiData.wallet_address,
          currentBalance: totalAssets,
          totalDeposit: apiData.total_deposit,
          totalWithdrawal: apiData.total_withdrawn,
          totalReceived: apiData.total_received,
          assets,
          chartData,
        });
      } catch (err) {
        console.error(" Error fetching wallet:", err);
        setWallet(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
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
              {[
                { title: "Total Deposit", value: wallet.totalDeposit, trend: "+", trendColor: "green" },
                { title: "Total Withdrawal", value: wallet.totalWithdrawal, trend: "-", trendColor: "red" },
                { title: "Total Received", value: wallet.totalReceived, trend: "+", trendColor: "green" },
              ].map((card, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    ${card.value.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className={`text-xs font-medium text-${card.trendColor}-600 bg-${card.trendColor}-50 px-2 py-0.5 rounded-md`}
                    >
                      {card.trend}0%
                    </span>
                    <span className="text-sm text-gray-500">From last month</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wallet.chartData}>
                    <defs>
                      <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#F3F4F6" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickMargin={10}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickMargin={10}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      dot={false}
                      fill="url(#balanceGradient)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Assets Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
