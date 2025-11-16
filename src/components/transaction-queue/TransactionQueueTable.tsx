"use client"
import React, { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { API_URL } from "@/utils/constants"
import axiosClient from "@/utils/axiosClient"

type Tx = {
  id: string
  datetime: string
  queued: string
  type: "Deposit" | "Withdraw" | "Redeem"
  amount: string
  asset: "Fiat" | "Crypto" | "Point"
  status: "Processing" | "Waiting" | "Pending"
}

interface PaginationMeta {
  page: number
  pages: number
  take: number
  number_records: number
  has_next: boolean
  has_prev: boolean
}

function TypeTag({ type }: { type: Tx["type"] }) {
  const styles: Record<Tx["type"], string> = {
    Deposit: "bg-green-50 text-green-600",
    Withdraw: "bg-red-50 text-red-500",
    Redeem: "bg-orange-50 text-orange-600",
  }
  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[type]}`}>{type}</span>
}

function AssetTag({ asset }: { asset: Tx["asset"] }) {
  const styles: Record<Tx["asset"], string> = {
    Fiat: "text-blue-600",
    Crypto: "text-blue-600",
    Point: "text-indigo-600",
  }
  return <span className={`font-medium text-sm ${styles[asset]}`}>{asset}</span>
}

function StatusPill({ status }: { status: Tx["status"] }) {
  const styles: Record<Tx["status"], string> = {
    Processing: "bg-blue-50 text-blue-700",
    Waiting: "bg-yellow-50 text-yellow-700",
    Pending: "bg-orange-50 text-orange-600",
  }
  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>{status}</span>
}

// Table row skeleton
function TableRowSkeleton() {
  return (
    <tr className="border-b animate-pulse">
      <td className="py-4 pr-6"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      <td className="py-4 pr-6"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="py-4 pr-6"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      <td className="py-4 pr-6"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
      <td className="py-4 pr-6"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      <td className="py-4 pr-6"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
      <td className="py-4 pr-6"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
      <td className="py-4 pr-6">
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded-full w-24"></div>
          <div className="h-8 bg-gray-200 rounded-full w-20"></div>
        </div>
      </td>
    </tr>
  )
}

export default function TransactionQueueTable({ loading: initialLoading = false }: { loading?: boolean }) {
  const [transactions, setTransactions] = useState<Tx[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(initialLoading)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pages: 1,
    take: 10,
    number_records: 0,
    has_next: false,
    has_prev: false,
  })

  const perPage = 10

  // Fetch transactions with pagination
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)

        // Build query parameters
        const params = new URLSearchParams()
        params.append("page", page.toString())
        params.append("take", perPage.toString())

        if (searchQuery.trim()) {
          params.append("keyword", searchQuery.trim())
        }

        const res = await axiosClient.get(
          `${API_URL}/transaction/queue?${params.toString()}`
        )

        const data = res.data?.data?.transactions || []
        const paginationData = res.data?.data?.paginated

        // Format transactions
        const formatted = data.map((tx: any) => ({
          id: tx.id || tx.hash || "—",
          datetime: new Date(tx.date_created).toLocaleString(),
          queued: getTimeAgo(tx.date_created),
          type: (tx.transaction_type?.name || "Deposit") as Tx["type"],
          amount: `${tx.amount} ${tx.currency_slug?.toUpperCase() || ""}`.trim(),
          asset: getAssetType(tx),
          status: (tx.transaction_status?.toUpperCase() || "Pending") as Tx["status"],
        }))

        setTransactions(formatted)
        setPagination({
          page: paginationData?.page || 1,
          pages: paginationData?.pages || 1,
          take: paginationData?.take || perPage,
          number_records: paginationData?.number_records || formatted.length,
          has_next: paginationData?.has_next || false,
          has_prev: paginationData?.has_prev || false,
        })
      } catch (err) {
        console.error("Error fetching transactions:", err)
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [page, searchQuery])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1) // Reset to first page on search
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      {/* Header inside card */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Action Transaction Queue</h3>
          <p className="text-sm text-gray-400">Real-time view of pending transaction awaiting processing</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={loading}
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>
          <button
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>05 Feb - 06 March</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="py-3 pr-6 font-medium">Transaction ID</th>
              <th className="py-3 pr-6 font-medium">Date/Time</th>
              <th className="py-3 pr-6 font-medium">Queued</th>
              <th className="py-3 pr-6 font-medium">Type</th>
              <th className="py-3 pr-6 font-medium">Amount</th>
              <th className="py-3 pr-6 font-medium">Asset Type</th>
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
            ) : transactions.length === 0 ? (
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
              transactions.map((tx, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 pr-6 font-mono text-xs">{tx.id.length > 20 ? `${tx.id.slice(0, 20)}...` : tx.id}</td>
                  <td className="py-4 pr-6 text-sm">{tx.datetime}</td>
                  <td className="py-4 pr-6 text-sm text-gray-600">{tx.queued}</td>
                  <td className="py-4 pr-6"><TypeTag type={tx.type} /></td>
                  <td className="py-4 pr-6 font-semibold">{tx.amount}</td>
                  <td className="py-4 pr-6"><AssetTag asset={tx.asset} /></td>
                  <td className="py-4 pr-6"><StatusPill status={tx.status} /></td>
                  <td className="py-4 pr-6 flex items-center gap-2">
                    <button className="bg-[#2563EB] hover:bg-[#1E4FDB] text-white px-4 py-2 rounded-full text-sm transition-all">View detail</button>
                    <button className="border border-gray-300 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-full text-sm transition-all">Cancel</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Info & Controls */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Page {pagination.page} of {pagination.pages} • Showing {transactions.length} of {pagination.number_records} transactions
        </div>

        <div className="flex items-center space-x-3">
          {/* Previous */}
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.has_prev || loading}
            className={`flex items-center px-4 py-2 rounded-full transition ${!pagination.has_prev || loading
              ? "bg-gray-50 text-gray-400 cursor-not-allowed opacity-50"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            <ChevronLeft size={16} className="mr-2" />
            Previous
          </button>

          {/* Page numbers */}
          <div className="flex items-center space-x-2">
            {/* First page */}
            <button
              onClick={() => setPage(1)}
              disabled={loading}
              className={`w-8 h-8 rounded-full text-sm font-medium transition ${pagination.page === 1
                ? "bg-[#2563EB] text-white"
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
              let pageNum: number
              if (pagination.pages <= 5) {
                pageNum = i + 1
              } else if (pagination.page <= 3) {
                pageNum = i + 1
              } else if (pagination.page >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i
              } else {
                pageNum = pagination.page - 2 + i
              }

              if (pageNum === 1 || pageNum === pagination.pages) {
                return null
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  disabled={loading}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition ${pagination.page === pageNum
                    ? "bg-[#2563EB] text-white"
                    : loading
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {pageNum}
                </button>
              )
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
                  ? "bg-[#2563EB] text-white"
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
            className={`flex items-center px-4 py-2 rounded-full transition ${!pagination.has_next || loading
              ? "bg-gray-50 text-gray-400 cursor-not-allowed opacity-50"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Next
            <ChevronRight size={16} className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getTimeAgo(dateString: string): string {
  const now = new Date()
  const past = new Date(dateString)
  const diffMs = now.getTime() - past.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return `${diffSecs} seconds ago`
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
}

function getAssetType(tx: any): Tx["asset"] {
  if (tx.is_fiat_token) return "Fiat"
  if (tx.is_crypto_token) return "Crypto"
  if (tx.is_point_token) return "Point"
  return "Crypto"
}