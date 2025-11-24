"use client";
import React, { useState, useEffect } from "react";
import axiosClient from "@/utils/axiosClient";
import { API_URL } from "@/utils/constants";

type RoutingKey = {
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
};

type TransactionItem = {
  routingKey: string;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
};

type PaginationData = {
  page: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
  number_records: number;
  take: number;
};

function StatusPill({ status }: { status: number }) {
  return (
    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
      {status}
    </span>
  );
}

// Table row skeleton
function TableRowSkeleton() {
  return (
    <tr className="border-b animate-pulse">
      <td className="py-4 pr-6">
        <div className="h-4 bg-gray-200 rounded w-48"></div>
      </td>
      <td className="py-4 pr-6">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </td>
      <td className="py-4 pr-6">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </td>
      <td className="py-4 pr-6">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </td>
      <td className="py-4 pr-6">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </td>
      <td className="py-4 pr-6">
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded-full w-24"></div>
          <div className="h-8 bg-gray-200 rounded-full w-20"></div>
        </div>
      </td>
    </tr>
  );
}

interface TransactionQueueTableProps {
  loading?: boolean;
  routingKeysData?: Record<string, RoutingKey>;
  paginationData?: PaginationData;
}

export default function TransactionQueueTable({
  loading = false,
  routingKeysData = {},
  paginationData = {
    page: 1,
    pages: 1,
    has_next: false,
    has_prev: false,
    number_records: 0,
    take: 10,
  },
}: TransactionQueueTableProps) {
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Use pagination data from props
  const currentPage = paginationData.page || 1;
  const totalPages = paginationData.pages || 1;
  const hasNext = paginationData.has_next || false;
  const hasPrev = paginationData.has_prev || false;
  const recordCount = paginationData.number_records || 0;
  const perPage = paginationData.take || 10;

  // Convert routing keys object to array
  const transactions: TransactionItem[] = Object.entries(
    routingKeysData
  ).map(([key, stats]) => ({
    routingKey: key,
    pending: stats.pending || 0,
    processing: stats.processing || 0,
    completed: stats.completed || 0,
    cancelled: stats.cancelled || 0,
  }));

  const handleFilterChange = () => {
    setPage(1);
    const params = new URLSearchParams();
    if (fromDate) params.append("from_date", fromDate);
    if (toDate) params.append("to_date", toDate);

    const queryString = params.toString();
    console.log("Filter applied:", queryString);
    // Call API endpoint with params
    // axiosClient.get(`${API_URL}/transactions?${queryString}`)
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      {/* Header inside card */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            Action Transaction Queue
          </h3>
          <p className="text-sm text-gray-400">
            Real-time view of transaction routing keys and their status
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              handleFilterChange();
            }}
            disabled={loading}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              handleFilterChange();
            }}
            disabled={loading}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          <button
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="py-3 pr-6 font-medium">Routing Key</th>
              <th className="py-3 pr-6 font-medium">Pending</th>
              <th className="py-3 pr-6 font-medium">Processing</th>
              <th className="py-3 pr-6 font-medium">Completed</th>
              <th className="py-3 pr-6 font-medium">Cancelled</th>
              <th className="py-3 pr-6 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {loading ? (
              <>
                {Array.from({ length: perPage }).map((_, i) => (
                  <TableRowSkeleton key={`skeleton-${i}`} />
                ))}
              </>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="h-12 w-12 text-gray-400 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-sm font-medium text-gray-900">
                      No routing keys found
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((tx, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 pr-6 font-mono text-xs">
                    {tx.routingKey.length > 50
                      ? `${tx.routingKey.slice(0, 50)}...`
                      : tx.routingKey}
                  </td>
                  <td className="py-4 pr-6">
                    <StatusPill status={tx.pending} />
                  </td>
                  <td className="py-4 pr-6">
                    <StatusPill status={tx.processing} />
                  </td>
                  <td className="py-4 pr-6">
                    <StatusPill status={tx.completed} />
                  </td>
                  <td className="py-4 pr-6">
                    <StatusPill status={tx.cancelled} />
                  </td>
                  <td className="py-4 pr-6 flex items-center gap-2">
                    <button className="bg-[#2563EB] hover:bg-[#1E4FDB] text-white px-4 py-2 rounded-full text-sm transition-all">
                      View
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
        <div className="text-sm text-gray-500">
          Showing {recordCount} records on page {currentPage} of {totalPages}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!hasPrev || loading}
            className={`flex items-center px-4 py-2 rounded-full transition ${!hasPrev || loading
              ? "bg-gray-50 text-gray-400 cursor-not-allowed opacity-50"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            ← Previous
          </button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                disabled={loading}
                className={`w-8 h-8 rounded-full text-sm font-medium transition ${currentPage === i + 1
                  ? "bg-[#2563EB] text-white"
                  : loading
                    ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={!hasNext || loading}
            className={`flex items-center px-4 py-2 rounded-full transition ${!hasNext || loading
              ? "bg-gray-50 text-gray-400 cursor-not-allowed opacity-50"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}