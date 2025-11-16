"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AppSidebar from "@/layout/AppSidebar";
import AppHeader from "@/layout/AppHeader";
import Image from "next/image";
import axiosClient from "@/utils/axiosClient";
import { API_URL } from "@/utils/constants";

function StatCard({
  title,
  value,
  icon,
  subLabel,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subLabel?: string;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-md border border-gray-100 p-5 flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-sm font-semibold text-gray-900">{title}</p>
      </div>
      <div>
        <p className="text-2xl text-gray-900">
          {value !== undefined ? value : "--"}
        </p>
        {subLabel && <p className="text-sm text-gray-600 mt-0.5">{subLabel}</p>}
      </div>
    </div>
  );
}

// Skeleton for StatCard
function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white shadow-md border border-gray-100 p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
      <div>
        <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  );
}

// Skeleton for Form Section
function FormSectionSkeleton() {
  return (
    <section className="rounded-2xl bg-white shadow-sm border border-gray-200 p-8 mb-8 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
      <div className="space-y-5">
        <div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded-lg"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded-lg"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded-lg"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <div className="h-12 bg-gray-200 rounded-lg mt-2"></div>
      </div>
    </section>
  );
}

// Skeleton for Transaction Table
function TransactionTableSkeleton() {
  return (
    <section className="rounded-2xl bg-white shadow-md border border-gray-100 p-6 mt-8 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>

      <div className="overflow-x-auto mb-6">
        <div className="flex gap-4 pb-4 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-16 flex-1"></div>
          <div className="h-4 bg-gray-200 rounded w-20 flex-1"></div>
          <div className="h-4 bg-gray-200 rounded w-20 flex-1"></div>
          <div className="h-4 bg-gray-200 rounded w-16 flex-1"></div>
          <div className="h-4 bg-gray-200 rounded w-20 flex-1"></div>
          <div className="h-4 bg-gray-200 rounded w-16 flex-1"></div>
          <div className="h-4 bg-gray-200 rounded w-12 flex-1"></div>
        </div>

        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-4 border-b border-gray-100 last:border-b-0">
            <div className="h-4 bg-gray-200 rounded w-16 flex-1"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
      </div>
    </section>
  );
}

type TraceStats = {
  total_transactions: number;
  volume_traced: number;
  suspicious_pattems: number;
};

interface PaginationMeta {
  page: number;
  pages: number;
  take: number;
  number_records: number;
  has_next: boolean;
  has_prev: boolean;
}

export default function TransactionTracePage() {
  const [stats, setStats] = useState<TraceStats>({
    total_transactions: 0,
    volume_traced: 0,
    suspicious_pattems: 0,
  });

  const [traces, setTraces] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTraces, setLoadingTraces] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pages: 1,
    take: 10,
    number_records: 0,
    has_next: false,
    has_prev: false,
  });

  const perPage = 10;

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosClient.get(
          `${API_URL}/transaction/dashboard/traces`
        );

        const data = response.data?.data || {};
        const s = data.stats || data;
        setStats({
          total_transactions: s.total_transactions ?? 0,
          volume_traced: s.volume_traced ?? 0,
          suspicious_pattems: s.suspicious_pattems ?? 0,
        });
      } catch (error) {
        console.error("❌ Error fetching stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch traces with pagination
  useEffect(() => {
    const fetchTraces = async () => {
      try {
        setLoadingTraces(true);

        // Build query parameters
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("take", perPage.toString());

        const response = await axiosClient.get(
          `${API_URL}/transaction/dashboard/traces?${params.toString()}`
        );

        const data = response.data?.data || {};
        const tracesData = data.traces || [];
        const paginationData = data.paginated;

        setTraces(tracesData);
        setPagination({
          page: paginationData?.page || 1,
          pages: paginationData?.pages || 1,
          take: paginationData?.take || perPage,
          number_records: paginationData?.number_records || tracesData.length,
          has_next: paginationData?.has_next || false,
          has_prev: paginationData?.has_prev || false,
        });
      } catch (error) {
        console.error("❌ Error fetching traces:", error);
        setTraces([]);
      } finally {
        setLoadingTraces(false);
      }
    };

    fetchTraces();
  }, [page]);

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(num);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString("en-GB", { hour12: false });
    } catch {
      return iso;
    }
  };

  const getStatusColor = (status?: string) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
      case "success":
        return "bg-green-100 text-green-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
      case "flagged":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex">
        <AppSidebar />
        <div className="flex-1 min-h-screen">
          <AppHeader />

          <main className="px-8 py-8">
            {/* ✅ Stats grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {loadingStats ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : (
                <>
                  <StatCard
                    title="Total Transactions"
                    value={formatNumber(stats.total_transactions)}
                    icon={
                      <Image
                        src="/images/icons/TotalW.svg"
                        alt="Total Transactions"
                        width={24}
                        height={24}
                      />
                    }
                  />
                  <StatCard
                    title="Volume Traced (VND)"
                    value={formatNumber(stats.volume_traced)}
                    icon={
                      <Image
                        src="/images/icons/TotalBVND.svg"
                        alt="Volume Traced"
                        width={24}
                        height={24}
                      />
                    }
                  />
                  <StatCard
                    title="Suspicious Patterns"
                    value={formatNumber(stats.suspicious_pattems)}
                    icon={
                      <Image
                        src="/images/icons/Critical.svg"
                        alt="Suspicious Patterns"
                        width={24}
                        height={24}
                      />
                    }
                  />
                  <StatCard
                    title="Real time"
                    value="Monitoring status"
                    icon={
                      <Image
                        src="/images/icons/Last.svg"
                        alt="Real time"
                        width={24}
                        height={24}
                      />
                    }
                  />
                </>
              )}
            </section>

            {/* ✅ Trace Transaction Form */}
            {loadingStats ? (
              <FormSectionSkeleton />
            ) : (
              <section className="rounded-2xl bg-white shadow-sm border border-gray-200 p-8 mb-8">
                <h2 className="text-lg font-semibold mb-6 text-gray-900">
                  Trace Transaction
                </h2>

                <div className="space-y-5">
                  {/* Transaction ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      placeholder="Enter transaction ID"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {/* Wallet Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      placeholder="Enter wallet address"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        Start Date
                      </label>
                      <input
                        type="text"
                        placeholder="dd/mm/yyyy"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        End Date
                      </label>
                      <input
                        type="text"
                        placeholder="dd/mm/yyyy"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  {/* Amount Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        Amount Range
                      </label>
                      <input
                        type="text"
                        placeholder="Min amount"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2 invisible">
                        .
                      </label>
                      <input
                        type="text"
                        placeholder="Max amount"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm font-medium shadow transition-all duration-150"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-4.35-4.35m2.85-4.15a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Start Trace
                  </button>
                </div>
              </section>
            )}

            {/* ✅ Transaction Flow Diagram */}
            {!loadingStats && (
              <div className="flex justify-center items-center w-full">
                <svg
                  width="100%"
                  height="600"
                  viewBox="0 0 1200 600"
                  xmlns="http://www.w3.org/2000/svg"
                  className="max-w-full"
                >
                  <defs>
                    <marker
                      id="arrow"
                      markerWidth="10"
                      markerHeight="10"
                      refX="8"
                      refY="3"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path d="M0,0 L0,6 L9,3 z" fill="#9E9E9E" />
                    </marker>
                  </defs>

                  <style>{`
        text { font-family: 'Inter', sans-serif; }
        .stroke { stroke: #9E9E9E; stroke-width: 2.2; fill: none; stroke-linecap: round; stroke-linejoin: round; marker-end: url(#arrow); }
        .strokeThin { stroke: #BDBDBD; stroke-width: 1.6; fill: none; stroke-linecap: round; stroke-linejoin: round; marker-end: url(#arrow); }
        .nodeCircle { fill: #fff; stroke: #9E9E9E; stroke-width: 2.2; }
        .nodeLabel { fill: #333; font-weight: 600; font-size: 14px; dominant-baseline: middle; text-anchor: middle; }
        .small { fill: #555; font-size: 12px; text-anchor: middle; }
        .tiny { fill: #777; font-size: 11px; text-anchor: middle; }
      `}</style>

                  {/* Node A (gốc) */}
                  <circle cx="120" cy="300" r="20" className="nodeCircle" />
                  <text x="120" y="300" className="nodeLabel">A</text>

                  {/* A → A giữa */}
                  <path d="M140 300 H300" className="stroke" />
                  <text x="220" y="285" className="small">0.15 TON</text>
                  <text x="220" y="315" className="tiny">0xae42e5a4</text>

                  {/* Node A giữa */}
                  <circle cx="320" cy="300" r="22" className="nodeCircle" />
                  <text x="320" y="300" className="nodeLabel">A</text>

                  {/* A giữa → B1 */}
                  <path d="M342 300 H400 V180 H520" className="stroke" />
                  <text x="450" y="165" className="small">0.05 TON</text>
                  <text x="450" y="195" className="tiny">Jetton Transfer</text>

                  {/* A giữa → B2 */}
                  <path d="M342 300 H520" className="stroke" />
                  <text x="450" y="285" className="small">0.05 TON</text>
                  <text x="450" y="315" className="tiny">Jetton Transfer</text>

                  {/* A giữa → B3 */}
                  <path d="M342 300 H400 V420 H520" className="stroke" />
                  <text x="450" y="405" className="small">0.05 TON</text>
                  <text x="450" y="435" className="tiny">Jetton Transfer</text>

                  {/* Node B */}
                  <circle cx="540" cy="180" r="18" className="nodeCircle" />
                  <text x="540" y="180" className="nodeLabel">B</text>

                  <circle cx="540" cy="300" r="18" className="nodeCircle" />
                  <text x="540" y="300" className="nodeLabel">B</text>

                  <circle cx="540" cy="420" r="18" className="nodeCircle" />
                  <text x="540" y="420" className="nodeLabel">B</text>

                  {/* B1 → D */}
                  <path d="M558 180 H640 V150 H790" className="strokeThin" />
                  <text x="715" y="135" className="small">0.04844 TON</text>
                  <text x="715" y="165" className="tiny">Jetton Internal Transfer</text>
                  <circle cx="810" cy="150" r="18" className="nodeCircle" />
                  <text x="810" y="150" className="nodeLabel">D</text>

                  {/* B1 → A */}
                  <path d="M558 180 H640 V210 H790" className="strokeThin" />
                  <text x="715" y="195" className="small">0.04844 TON</text>
                  <text x="715" y="225" className="tiny">Jetton Internal Transfer</text>
                  <circle cx="810" cy="210" r="18" className="nodeCircle" />
                  <text x="810" y="210" className="nodeLabel">A</text>

                  {/* B2 → F */}
                  <path d="M558 300 H640 V270 H790" className="strokeThin" />
                  <text x="715" y="255" className="small">0.04844 TON</text>
                  <text x="715" y="285" className="tiny">Jetton Internal Transfer</text>
                  <circle cx="810" cy="270" r="18" className="nodeCircle" />
                  <text x="810" y="270" className="nodeLabel">F</text>

                  {/* B2 → A */}
                  <path d="M558 300 H640 V330 H790" className="strokeThin" />
                  <text x="715" y="315" className="small">0.04844 TON</text>
                  <text x="715" y="345" className="tiny">Jetton Internal Transfer</text>
                  <circle cx="810" cy="330" r="18" className="nodeCircle" />
                  <text x="810" y="330" className="nodeLabel">A</text>

                  {/* B3 → H */}
                  <path d="M558 420 H640 V390 H790" className="strokeThin" />
                  <text x="715" y="375" className="small">0.04844 TON</text>
                  <text x="715" y="405" className="tiny">Jetton Internal Transfer</text>
                  <circle cx="810" cy="390" r="18" className="nodeCircle" />
                  <text x="810" y="390" className="nodeLabel">H</text>

                  {/* B3 → G */}
                  <path d="M558 420 H640 V450 H790" className="strokeThin" />
                  <text x="715" y="435" className="small">0.04844 TON</text>
                  <text x="715" y="465" className="tiny">Jetton Internal Transfer</text>
                  <circle cx="810" cy="450" r="18" className="nodeCircle" />
                  <text x="810" y="450" className="nodeLabel">G</text>
                </svg>
              </div>
            )}

            {/* ✅ Recent Transaction Flows with Pagination */}
            {loadingTraces ? (
              <TransactionTableSkeleton />
            ) : (
              <section className="rounded-2xl bg-white shadow-md border border-gray-100 p-6 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-semibold text-gray-900">
                    Recent Transaction Flows
                  </h2>
                  <div className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages} • {pagination.number_records} total
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-gray-700">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="px-5 py-3">Tx ID</th>
                        <th className="px-5 py-3">Source</th>
                        <th className="px-5 py-3">Destination</th>
                        <th className="px-5 py-3 text-right">Status</th>
                        <th className="px-5 py-3 text-right">Created</th>
                        <th className="px-5 py-3 text-right">Amount</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {traces.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-gray-400">
                            <div className="flex flex-col items-center justify-center">
                              <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              No traces found.
                            </div>
                          </td>
                        </tr>
                      ) : (
                        traces.map((item, i) => (
                          <tr key={item.trace_id || i} className="hover:bg-gray-50 transition">
                            <td className="px-5 py-4 font-medium text-gray-800">
                              #{item.transaction.transaction_id}
                            </td>
                            <td className="px-5 py-4">
                              <div>
                                <p className="font-medium text-gray-900 truncate max-w-[200px]">
                                  {item.transaction.source.wallet_address || "--"}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {item.transaction.source.email || "--"}
                                </p>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div>
                                <p className="font-medium text-gray-900 truncate max-w-[200px]">
                                  {item.transaction.destination.wallet_address ||
                                    "--"}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {item.transaction.destination.email || "--"}
                                </p>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                  item.status || item.transaction.status
                                )}`}
                              >
                                {item.status ?? item.transaction.status ?? "unknown"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right text-gray-500">
                              {item.transaction.date_created
                                ? formatDate(item.transaction.date_created)
                                : "-"}
                            </td>
                            <td className="px-5 py-4 text-right font-medium text-gray-800">
                              {typeof item.transaction.amount === "number"
                                ? `${formatNumber(
                                  item.transaction.amount
                                )} ${item.transaction.currency?.full_name ?? ""
                                }`
                                : "-"}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-3 py-2 text-sm font-medium hover:bg-blue-700 transition">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                Trace
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  {/* Previous */}
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.has_prev || loadingTraces}
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition ${!pagination.has_prev || loadingTraces
                      ? "text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed"
                      : "text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-2">
                    {/* First page */}
                    <button
                      onClick={() => setPage(1)}
                      disabled={loadingTraces}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition ${pagination.page === 1
                        ? "bg-blue-600 text-white"
                        : loadingTraces
                          ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      1
                    </button>

                    {/* Ellipsis if needed */}
                    {pagination.page > 3 && (
                      <span className="text-gray-400">...</span>
                    )}

                    {/* Middle pages */}
                    {Array.from({
                      length: Math.min(
                        5,
                        pagination.pages,
                        Math.max(0, pagination.page - 1) + Math.max(0, pagination.pages - pagination.page) + 1
                      ),
                    }).map((_, i) => {
                      let pageNum: number;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      if (pageNum === 1 || pageNum === pagination.pages) {
                        return null;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          disabled={loadingTraces}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition ${pagination.page === pageNum
                            ? "bg-blue-600 text-white"
                            : loadingTraces
                              ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* Ellipsis if needed */}
                    {pagination.page < pagination.pages - 2 && (
                      <span className="text-gray-400">...</span>
                    )}

                    {/* Last page */}
                    {pagination.pages > 1 && (
                      <button
                        onClick={() => setPage(pagination.pages)}
                        disabled={loadingTraces}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition ${pagination.page === pagination.pages
                          ? "bg-blue-600 text-white"
                          : loadingTraces
                            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {pagination.pages}
                      </button>
                    )}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={!pagination.has_next || loadingTraces}
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition ${!pagination.has_next || loadingTraces
                      ? "text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed"
                      : "text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}