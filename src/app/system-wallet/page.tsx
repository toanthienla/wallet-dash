"use client";

import React, { useEffect, useState } from "react";
import MetricCard from "@/components/system-wallet/MetricCard";
import SystemWalletTable from "@/components/system-wallet/SystemWalletTable";
import { API_URL } from "@/utils/constants";
import axiosClient from "@/utils/axiosClient";

interface Wallet {
  name: string;
  slug: string;
  current_balance: number;
  last_updated: string;
  status: string;
}

interface WalletData {
  total_wallets: number;
  total_balance: number;
  last_updated: string;
  main_wallets: Wallet[];
}

export default function SystemWalletPage() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  //  Fetch API bằng axios (có cookie)
  async function fetchSystemWallets() {
    try {
      const res = await axiosClient.get(
        `${API_URL}/platform-config/dashboard/main-wallets`
      );

      return res.data;
    } catch (error) {
      console.error(" Fetch system wallets failed:", error);
      return null;
    }
  }

  useEffect(() => {
    async function loadData() {
      const data = await fetchSystemWallets();
      if (data?.success) {
        setWalletData(data.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const formatNumber = (num?: number) =>
    typeof num === "number"
      ? num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "0.00";

  // Skeleton Loading Component
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-lg ml-4"></div>
      </div>
    </div>
  );

  // Skeleton Loading for Table
  const SkeletonTable = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="space-y-4">
        {/* Table Header Skeleton */}
        <div className="flex gap-4 pb-4 border-b">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-28"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>

        {/* Table Rows Skeleton */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 py-4 border-b last:border-b-0 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Table Skeleton */}
        <SkeletonTable />
      </div>
    );
  }

  if (!walletData) {
    return (
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
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Wallet Data</h3>
          <p className="text-gray-500">Unable to load wallet data. Please try again later.</p>
        </div>
      </div>
    );
  }

  const { total_wallets, total_balance, last_updated, main_wallets } = walletData;

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total Wallet" value={total_wallets} iconSrc="/images/icons/TotalW.svg" />
        <MetricCard title="Critical Alerts" value={2} iconSrc="/images/icons/Critical.svg" />
        <MetricCard
          title="Total Balance (USD)"
          value={formatNumber(total_balance)}
          iconSrc="/images/icons/TotalBVND.svg"
        />
        <MetricCard
          title="Last Update"
          value={new Date(last_updated).toLocaleString()}
          iconSrc="/images/icons/Last.svg"
        />
      </div>

      {/*  Truyền đúng prop cho bảng */}
      <SystemWalletTable wallets={main_wallets} />
    </div>
  );
}