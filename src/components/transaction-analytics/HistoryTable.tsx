"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { API_URL } from "@/utils/constants";
import axiosClient from "@/utils/axiosClient";

type Row = {
  id: string;
  datetime: string;
  user: string;
  type: "Deposit" | "Withdraw" | "Redeem";
  amount: string;
  asset: string;
  status: "Processing" | "Completed" | "Failed";
};

interface PaginationMeta {
  page: number;
  pages: number;
  take: number;
  number_records: number;
  has_next: boolean;
  has_prev: boolean;
}

// Table row skeleton
function TableRowSkeleton() {
  return (
    <tr className="border-b animate-pulse">
      <td className="py-5 px-6"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="py-5 px-6"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      <td className="py-5 px-6"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
      <td className="py-5 px-6"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
      <td className="py-5 px-6"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      <td className="py-5 px-6"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
      <td className="py-5 px-6"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
      <td className="py-5 px-6"><div className="h-8 bg-gray-200 rounded w-24"></div></td>
    </tr>
  );
}

function Status({ s }: { s: Row["status"] }) {
  const map: Record<Row["status"], string> = {
    Processing: "bg-blue-50 text-blue-700",
    Completed: "bg-green-50 text-green-700",
    Failed: "bg-red-50 text-red-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${map[s]}`}>{s}</span>
  );
}

export default function HistoryTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pages: 1,
    take: 10,
    number_records: 0,
    has_next: false,
    has_prev: false,
  });

  const perPage = 10;

  // Fetch transactions with pagination
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("take", perPage.toString());

        if (searchQuery.trim()) {
          params.append("keyword", searchQuery.trim());
        }

        const res = await axiosClient.get(
          `${API_URL}/transaction/dashboard/list?${params.toString()}`
        );

        const data = res.data?.data?.transactions || [];
        const paginationData = res.data?.data?.paginated;

        // Format transactions
        const formatted: Row[] = data.map((tx: any) => ({
          id: String(tx.id || tx.hash || "—"),
          datetime: new Date(tx.date_created).toISOString(),
          user: tx.user_id ?? tx.user_created ?? "unknown",
          type:
            tx.transaction_type?.name === "Receive"
              ? "Deposit"
              : tx.transaction_type?.name === "Transfer"
                ? "Withdraw"
                : "Redeem",
          amount: tx.amount?.toString() || "0",
          asset: tx.currency_data?.name?.toUpperCase() || tx.currency?.name?.toUpperCase() || "Unknown",
          status:
            tx.transaction_status === "success"
              ? "Completed"
              : tx.transaction_status === "processing"
                ? "Processing"
                : "Failed",
        }));

        setRows(formatted);
        setPagination({
          page: paginationData?.page || 1,
          pages: paginationData?.pages || 1,
          take: paginationData?.take || perPage,
          number_records: paginationData?.number_records || formatted.length,
          has_next: paginationData?.has_next || false,
          has_prev: paginationData?.has_prev || false,
        });
      } catch (error) {
        console.error("❌ Fetch transactions failed:", error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [page, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on search
  };

  return (
    <div>
      <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-800">Transaction History</h3>
            <div className="text-sm text-gray-400">Completed transaction records</div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search..."
                disabled={loading}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm w-80 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
            <button
              disabled={loading}
              className="flex items-center px-3 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="ml-2">05 Feb - 06 March</span>
            </button>
          </div>
        </div>
      </div>

      {loading && rows.length === 0 ? (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-gray-400 bg-white border-b">
                <th className="py-3 px-6 font-medium text-left">Date/time</th>
                <th className="py-3 px-6 font-medium text-left">Transaction ID</th>
                <th className="py-3 px-6 font-medium text-left">User ID</th>
                <th className="py-3 px-6 font-medium text-left">Type</th>
                <th className="py-3 px-6 font-medium text-left">Amount</th>
                <th className="py-3 px-6 font-medium text-left">Asset Type</th>
                <th className="py-3 px-6 font-medium text-left">Status</th>
                <th className="py-3 px-6 font-medium text-left">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {Array.from({ length: perPage }).map((_, i) => (
                <TableRowSkeleton key={`skeleton-${i}`} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-gray-400 bg-white border-b">
                <th className="py-3 px-6 font-medium text-left">Date/time</th>
                <th className="py-3 px-6 font-medium text-left">Transaction ID</th>
                <th className="py-3 px-6 font-medium text-left">User ID</th>
                <th className="py-3 px-6 font-medium text-left">Type</th>
                <th className="py-3 px-6 font-medium text-left">Amount</th>
                <th className="py-3 px-6 font-medium text-left">Asset Type</th>
                <th className="py-3 px-6 font-medium text-left">Status</th>
                <th className="py-3 px-6 font-medium text-left">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900">No transactions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <tr key={r.id + idx} className="border-b hover:bg-gray-50">
                    <td className="py-5 px-6 text-sm text-gray-600">
                      {new Intl.DateTimeFormat("en-GB", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(r.datetime))}
                    </td>

                    <td className="py-5 px-6 font-mono text-sm text-gray-800">
                      {r.id.length > 20 ? `${r.id.slice(0, 20)}...` : r.id}
                    </td>
                    <td className="py-5 px-6 text-sm text-gray-700 break-words">
                      {r.user.length > 30 ? `${r.user.slice(0, 30)}...` : r.user}
                    </td>
                    <td className="py-5 px-6 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm ${r.type === "Deposit"
                          ? "bg-green-50 text-green-600"
                          : r.type === "Withdraw"
                            ? "bg-red-50 text-red-600"
                            : "bg-pink-50 text-pink-600"
                          }`}
                      >
                        {r.type}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-sm font-semibold text-gray-800">{r.amount}</td>
                    <td className="py-5 px-6 text-sm">
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm">
                        {r.asset}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-sm">
                      <Status s={r.status} />
                    </td>
                    <td className="py-5 px-6">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition">
                        View detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Info & Controls */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Page {pagination.page} of {pagination.pages} • Showing {rows.length} of {pagination.number_records} transactions
        </div>

        <div className="flex items-center space-x-3">
          {/* Previous */}
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.has_prev || loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition ${!pagination.has_prev || loading
              ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
              : "text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {/* First page */}
            <button
              onClick={() => setPage(1)}
              disabled={loading}
              className={`w-8 h-8 rounded-full text-sm font-medium transition ${pagination.page === 1
                ? "bg-blue-600 text-white"
                : loading
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
                  disabled={loading}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition ${pagination.page === pageNum
                    ? "bg-blue-600 text-white"
                    : loading
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
                disabled={loading}
                className={`w-8 h-8 rounded-full text-sm font-medium transition ${pagination.page === pagination.pages
                  ? "bg-blue-600 text-white"
                  : loading
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
            disabled={!pagination.has_next || loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition ${!pagination.has_next || loading
              ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
              : "text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}