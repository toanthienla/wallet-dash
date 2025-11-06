"use client";

import React, { useEffect, useState } from "react";
import AppSidebar from "@/layout/AppSidebar";
import AppHeader from "@/layout/AppHeader";
import { ChevronRight } from "lucide-react";
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

type TraceStats = {
  total_transactions: number;
  volume_traced: number;
  suspicious_pattems: number;
};

export default function TransactionTracePage() {
  const [stats, setStats] = useState<TraceStats>({
    total_transactions: 0,
    volume_traced: 0,
    suspicious_pattems: 0,
  });

  const [traces, setTraces] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTraces, setLoadingTraces] = useState(true);

  useEffect(() => {
    const fetchTraces = async () => {
      try {
        const response = await axiosClient.get(
          `${API_URL}/transaction/dashboard/traces`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        const data = response.data?.data || {};
        setTraces(data.traces || []);
        const s = data.stats || data;
        setStats({
          total_transactions: s.total_transactions ?? 0,
          volume_traced: s.volume_traced ?? 0,
          suspicious_pattems: s.suspicious_pattems ?? 0,
        });
      } catch (error) {
        console.error("❌ Error fetching traces:", error);
      } finally {
        setLoadingTraces(false);
        setLoadingStats(false);
      }
    };

    fetchTraces();
  }, []);

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
              <StatCard
                title="Total Transactions"
                value={
                  loadingStats
                    ? "Loading..."
                    : formatNumber(stats.total_transactions)
                }
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
                value={
                  loadingStats ? "Loading..." : formatNumber(stats.volume_traced)
                }
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
                value={
                  loadingStats
                    ? "Loading..."
                    : formatNumber(stats.suspicious_pattems)
                }
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
            </section>

            {/* ✅ Trace Transaction Form */}
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

           
           {/* ✅ Transaction Flow Diagram */} 
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


          
           {/* ✅ Recent Transaction Flows (đã fix API) */}
            <section className="rounded-2xl bg-white shadow-md border border-gray-100 p-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-gray-900">
                  Recent Transaction Flows
                </h2>
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
                    {loadingTraces ? (
                      <tr>
                        <td colSpan={7} className="text-center py-6 text-gray-500">
                          Loading transaction traces...
                        </td>
                      </tr>
                    ) : traces.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-6 text-gray-400">
                          No traces found.
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
                                )} ${
                                  item.transaction.currency?.full_name ?? ""
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

            {/* Pagination — luôn hiển thị kể cả chỉ có 1 trang */}
<div className="flex items-center justify-between mt-6">
  {/* Previous */}
  <button
    disabled
    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
  >
    ← Previous
  </button>

  {/* Page numbers */}
  <div className="flex items-center gap-2">
    <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-medium">
      1
    </button>
  </div>

  {/* Next */}
  <button
    disabled
    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
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
