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

function TypeTag({ type }: { type: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-600",
    processing: "bg-blue-50 text-blue-600",
    completed: "bg-green-50 text-green-600",
    cancelled: "bg-red-50 text-red-500",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${styles[type] || "bg-gray-100 text-gray-700"
        }`}
    >
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

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
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
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
}

export default function TransactionQueueTable({
  loading = false,
  routingKeysData = {},
}: TransactionQueueTableProps) {
  const [page, setPage] = useState(1);
  const perPage = 10;

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

  const pages = Math.max(1, Math.ceil(transactions.length / perPage));
  const visible = transactions.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > pages) {
      setPage(1);
    }
  }, [pages]);

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
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              disabled={loading}
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
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
            <span>05 Feb - 06 March</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="py-3 pr-6 font-medium">Routing Key</th>
              <th className="py-3 pr-6 font-medium">Type</th>
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
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500">
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
              visible.map((tx, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 pr-6 font-mono text-xs">
                    {tx.routingKey.length > 50
                      ? `${tx.routingKey.slice(0, 50)}...`
                      : tx.routingKey}
                  </td>
                  <td className="py-4 pr-6">
                    <TypeTag type="queue" />
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
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className={`flex items-center px-4 py-2 rounded-full transition ${page === 1 || loading
            ? "bg-gray-50 text-gray-400 cursor-not-allowed opacity-50"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          ← Previous
        </button>

        <div className="flex items-center space-x-2">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              disabled={loading}
              className={`w-8 h-8 rounded-full text-sm font-medium transition ${page === i + 1
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
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          disabled={page === pages || loading}
          className={`flex items-center px-4 py-2 rounded-full transition ${page === pages || loading
            ? "bg-gray-50 text-gray-400 cursor-not-allowed opacity-50"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}