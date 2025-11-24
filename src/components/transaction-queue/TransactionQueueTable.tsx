"use client";
import React, { useState, useEffect } from "react";
import axiosClient from "@/utils/axiosClient";
import { API_URL } from "@/utils/constants";

type Message = {
  msg_id: string;
  msg_started_at: string;
  msg_status: "pending" | "processing" | "completed" | "cancelled";
  id: number;
  date_created: string;
  transaction_type: string;
  amount: number;
  amount_assets: string;
  currency_data: {
    id: number;
    name: string;
    slug: string;
    full_name: string;
    usd_rate: string;
    link: string;
  };
  asset_type: string;
};

function StatusPill({ status }: { status: string }) {
  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: "bg-yellow-50", text: "text-yellow-700" },
    processing: { bg: "bg-blue-50", text: "text-blue-700" },
    completed: { bg: "bg-green-50", text: "text-green-700" },
    cancelled: { bg: "bg-red-50", text: "text-red-700" },
  };

  const colors = statusColors[status] || statusColors.pending;

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Table row skeleton
function TableRowSkeleton() {
  return (
    <tr className="border-b animate-pulse">
      <td className="py-4 pr-6">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="py-4 pr-6">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="py-4 pr-6">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="py-4 pr-6">
        <div className="h-4 bg-gray-200 rounded w-28"></div>
      </td>
      <td className="py-4 pr-6">
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </td>
      <td className="py-4 pr-6">
        <div className="h-8 bg-gray-200 rounded-full w-16"></div>
      </td>
    </tr>
  );
}

interface TransactionQueueTableProps {
  loading?: boolean;
  messagesData?: Message[];
}

export default function TransactionQueueTable({
  loading = false,
  messagesData = [],
}: TransactionQueueTableProps) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const perPage = 10;

  // Filter messages based on search term
  const filteredMessages = messagesData.filter(
    (msg) =>
      msg.msg_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.transaction_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.amount_assets.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pages = Math.max(1, Math.ceil(filteredMessages.length / perPage));
  const visible = filteredMessages.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > pages) {
      setPage(1);
    }
  }, [pages, page]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
            Real-time view of transaction messages and their status
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by ID, type, or amount..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
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
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="py-3 pr-6 font-medium">Message ID</th>
              <th className="py-3 pr-6 font-medium">Transaction Type</th>
              <th className="py-3 pr-6 font-medium">Amount</th>
              <th className="py-3 pr-6 font-medium">Created At</th>
              <th className="py-3 pr-6 font-medium">Status</th>
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
                      No transactions found
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              visible.map((msg, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 pr-6 font-mono text-xs text-gray-600">
                    {msg.msg_id.length > 32
                      ? `${msg.msg_id.slice(0, 32)}...`
                      : msg.msg_id}
                  </td>
                  <td className="py-4 pr-6 text-gray-700">
                    {msg.transaction_type}
                  </td>
                  <td className="py-4 pr-6 font-semibold text-gray-900">
                    {msg.amount_assets}
                  </td>
                  <td className="py-4 pr-6 text-xs text-gray-600">
                    {formatDate(msg.date_created)}
                  </td>
                  <td className="py-4 pr-6">
                    <StatusPill status={msg.msg_status} />
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