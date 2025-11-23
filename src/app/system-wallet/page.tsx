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

interface PaginationMeta {
  page: number;
  pages: number;
  take: number;
  number_records: number;
  has_next: boolean;
  has_prev: boolean;
}

interface WalletData {
  total_wallets: number;
  total_balance: number;
  last_updated: string;
  main_wallets: Wallet[];
  paginated: PaginationMeta;
}

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

export default function SystemWalletPage() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // Fetch API with pagination
  async function fetchSystemWallets(page: number = 1) {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("take", perPage.toString());

      const res = await axiosClient.get(
        `${API_URL}/platform-config/dashboard/main-wallets?${params.toString()}`
      );

      console.log("✅ Wallet Data Response:", res.data);

      // Handle both direct data and nested data structure
      const apiData = res.data?.data || res.data;

      return apiData;
    } catch (error: any) {
      console.error("❌ Fetch system wallets failed:", error);
      setError(error.message || "Failed to fetch wallet data");
      return null;
    }
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      const data = await fetchSystemWallets(currentPage);

      if (data) {
        setWalletData({
          total_wallets: data.total_wallets || 0,
          total_balance: data.total_balance || 0,
          last_updated: data.last_updated || new Date().toISOString(),
          main_wallets: Array.isArray(data.main_wallets) ? data.main_wallets : [],
          paginated: data.paginated || {
            page: currentPage,
            pages: 1,
            take: perPage,
            number_records: Array.isArray(data.main_wallets) ? data.main_wallets.length : 0,
            has_next: false,
            has_prev: false,
          },
        });
      }
      setLoading(false);
    }
    loadData();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const formatNumber = (num?: number) =>
    typeof num === "number"
      ? num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "0.00";

  if (loading && !walletData) {
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

  if (error && !walletData) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
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
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Error Loading Data</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => {
              setCurrentPage(1);
              setError(null);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!walletData || !walletData.main_wallets || walletData.main_wallets.length === 0) {
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
          <h3 className="text-lg font-medium text-gray-900 mb-1">No System Wallet Data</h3>
          <p className="text-gray-500">No wallets available at the moment.</p>
        </div>
      </div>
    );
  }

  const { total_wallets, total_balance, last_updated, main_wallets, paginated } = walletData;

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

      {/* System Wallet Table with Server-Side Pagination */}
      <SystemWalletTable
        wallets={main_wallets || []}
        pagination={paginated || {
          page: currentPage,
          pages: 1,
          take: perPage,
          number_records: main_wallets?.length || 0,
          has_next: false,
          has_prev: false,
        }}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  );
}