"use client";
import React, { useEffect, useState } from "react";
import MetricCard from "@/components/user-wallet/MetricCard";
import BulkActions from "@/components/user-wallet/BulkActions";
import WalletTable from "@/components/user-wallet/WalletTable";
import Image from "next/image";
import { API_URL } from "@/utils/constants";
import axiosClient from "@/utils/axiosClient";

type Stats = {
  totalUsers: number;
  activeSubWallets: number;
  pendingCollection: number;
  totalBalance: number;
  uninitializedPasscodes: number;
  initializedPasscodes: number;
};

// Skeleton loader for metric card
function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow animate-pulse">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-5 h-5 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-32 mb-3"></div>
      <div className="h-3 bg-gray-200 rounded w-40"></div>
    </div>
  );
}

// Skeleton loader for bulk actions
function BulkActionsSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5 rounded-xl border border-gray-200 bg-white">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="w-4 h-4 bg-gray-200 rounded flex-shrink-0"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserWalletPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeSubWallets: 0,
    pendingCollection: 0,
    totalBalance: 0,
    uninitializedPasscodes: 0,
    initializedPasscodes: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosClient.get(
          `${API_URL}/wallets/dashboard/list`
        );

        console.log("📊 Dashboard result:", response.data);
        const d = response.data?.data || {};

        setStats({
          totalUsers: d.total_of_users ?? 0,
          activeSubWallets: d.total_of_active_sub_wallets ?? 0,
          pendingCollection: d.total_of_pending_collection ?? 0,
          totalBalance: d.total_balance ?? 0,
          uninitializedPasscodes: d.total_of_uninitialized_passcode ?? 0,
          initializedPasscodes: d.total_of_initialized_passcode ?? 0,
        });
      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <svg
              className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900">Error Loading Dashboard</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => new Intl.NumberFormat("en-US").format(num);
  const formatCurrency = (num: number) =>
    "$" + new Intl.NumberFormat("en-US").format(num);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Wallet Management</h1>
        <p className="text-gray-500 mt-2">Monitor and manage all user wallets and balances</p>
      </div>

      {/* 🧩 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              title="Total Sub-wallets"
              value={formatNumber(stats.activeSubWallets)}
              desc={`Users: ${formatNumber(stats.totalUsers)}`}
              icon={
                <Image
                  src="/images/icons/TotalS.svg"
                  alt="Total Sub-wallet icon"
                  width={20}
                  height={20}
                />
              }
            />

            <MetricCard
              title="Total Balance"
              value={formatCurrency(stats.totalBalance)}
              desc={`Pending: ${formatNumber(stats.pendingCollection)} wallets`}
              icon={
                <Image
                  src="/images/icons/TotalB.svg"
                  alt="Total Balance icon"
                  width={20}
                  height={20}
                />
              }
            />

            <MetricCard
              title="Uninitialized Passcodes"
              value={formatNumber(stats.uninitializedPasscodes)}
              desc={`Initialized: ${formatNumber(stats.initializedPasscodes)}`}
              icon={
                <Image
                  src="/images/icons/Selected.svg"
                  alt="Selected for Collection icon"
                  width={20}
                  height={20}
                />
              }
            />
          </>
        )}
      </div>

      {/* Bulk Actions */}
      <div>
        {loading ? <BulkActionsSkeleton /> : <BulkActions />}
      </div>

      {/* Wallet Table */}
      <div>
        <WalletTable loading={loading} />
      </div>
    </div>
  );
}