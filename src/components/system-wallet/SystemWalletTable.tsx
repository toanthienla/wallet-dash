"use client";
import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import StatusPill from "./StatusPill";

type Wallet = {
  name: string;
  slug: string;
  current_balance: number;
  last_updated: string;
  status: string;
};

interface PaginationMeta {
  page: number;
  pages: number;
  take: number;
  number_records: number;
  has_next: boolean;
  has_prev: boolean;
}

interface Props {
  wallets?: Wallet[];
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  loading?: boolean;
}

// Table Row Skeleton
function TableRowSkeleton() {
  return (
    <tr className="border-b animate-pulse">
      <td className="py-4 pr-6">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="py-4 pr-6">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
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
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </td>
    </tr>
  );
}

export default function SystemWalletTable({
  wallets = [],
  pagination = {
    page: 1,
    pages: 1,
    take: 10,
    number_records: 0,
    has_next: false,
    has_prev: false,
  },
  onPageChange,
  loading = false,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const filteredWallets = wallets.filter((wallet) =>
    wallet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wallet.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            System Wallet Status
          </h3>
          <p className="text-sm text-gray-400">
            Real-time balance monitoring and threshold alerts
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search wallets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-52 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Date Filter */}
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Image
              src="/images/icons/Calendar.svg"
              alt="Calendar Icon"
              width={16}
              height={16}
            />
            <span>05 Feb - 06 March</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="py-3 pr-6">Name</th>
              <th className="py-3 pr-6">Address</th>
              <th className="py-3 pr-6">Balance</th>
              <th className="py-3 pr-6">Last Updated</th>
              <th className="py-3 pr-6">Status</th>
              <th className="py-3 pr-6">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {loading ? (
              <>
                {Array.from({ length: pagination.take || 10 }).map((_, i) => (
                  <TableRowSkeleton key={`skeleton-${i}`} />
                ))}
              </>
            ) : filteredWallets.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
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
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    No wallets found
                  </div>
                </td>
              </tr>
            ) : (
              filteredWallets.map((r, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-4 pr-6 font-medium">{r.name}</td>
                  <td className="py-4 pr-6 text-gray-500 break-all font-mono text-xs">
                    {r.slug.length > 40
                      ? `${r.slug.slice(0, 40)}...`
                      : r.slug}
                  </td>
                  <td className="py-4 pr-6 font-semibold">
                    {r.current_balance.toFixed(4)}
                  </td>
                  <td className="py-4 pr-6 text-gray-500 text-xs">
                    {new Date(r.last_updated).toLocaleString()}
                  </td>
                  <td className="py-4 pr-6">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="py-4 pr-6">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition">
                      View detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Info */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Page {pagination.page} of {pagination.pages} • Showing{" "}
          {filteredWallets.length} of {pagination.number_records} records
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center space-x-3">
          {/* Previous */}
          <button
            onClick={() =>
              handlePageChange(Math.max(1, pagination.page - 1))
            }
            disabled={!pagination.has_prev || loading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm border transition ${!pagination.has_prev || loading
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
              onClick={() => handlePageChange(1)}
              disabled={loading}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${pagination.page === 1
                ? "bg-blue-600 text-white"
                : loading
                  ? "text-gray-400 bg-gray-50 cursor-not-allowed"
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
            {Array.from({ length: Math.min(5, pagination.pages) }).map(
              (_, i) => {
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
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition ${pagination.page === pageNum
                      ? "bg-blue-600 text-white"
                      : loading
                        ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}

            {/* Ellipsis if needed */}
            {pagination.page < pagination.pages - 2 && (
              <span className="text-gray-400">...</span>
            )}

            {/* Last page */}
            {pagination.pages > 1 && (
              <button
                onClick={() => handlePageChange(pagination.pages)}
                disabled={loading}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${pagination.page === pagination.pages
                  ? "bg-blue-600 text-white"
                  : loading
                    ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {pagination.pages}
              </button>
            )}
          </div>

          {/* Next */}
          <button
            onClick={() =>
              handlePageChange(
                Math.min(pagination.pages, pagination.page + 1)
              )
            }
            disabled={!pagination.has_next || loading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm border transition ${!pagination.has_next || loading
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