"use client"
import React, { useEffect, useState, useCallback } from "react"
import axiosClient from "@/utils/axiosClient"
import { API_URL } from "@/utils/constants"
import { Download, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"

type WalletRow = {
  id: string
  user: string
  address: string
  status: string
  amount: string
}

type PaginationData = {
  keyword: string
  page: number
  take: number
  sort: string
  sorted: string
  to_date: string
  number_records: number
  pages: number
  has_prev: boolean
  has_next: boolean
}

type ApiResponse = {
  success: boolean
  message: string
  data: {
    number_of_balance: number
    wallets: any[]
    paginated: PaginationData
  }
  timestamp: string
}

// ============================================================================
// SKELETON LOADER - SubWalletTable specific
// ============================================================================

function TableRowSkeleton() {
  return (
    <tr className="border-t border-gray-100 animate-pulse">
      <td className="py-3"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
      <td className="py-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="py-3"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
      <td className="py-3"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
      <td className="py-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      <td className="py-3 text-right"><div className="h-8 bg-gray-200 rounded w-20 ml-auto"></div></td>
    </tr>
  )
}

function SubWalletTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mt-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-5">
        <div className="h-5 bg-gray-200 rounded w-40"></div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded w-8"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="overflow-x-auto mb-5">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="pb-3"><div className="h-4 bg-gray-200 rounded w-6"></div></th>
              <th className="pb-3"><div className="h-4 bg-gray-200 rounded w-16"></div></th>
              <th className="pb-3"><div className="h-4 bg-gray-200 rounded w-32"></div></th>
              <th className="pb-3"><div className="h-4 bg-gray-200 rounded w-12"></div></th>
              <th className="pb-3"><div className="h-4 bg-gray-200 rounded w-16"></div></th>
              <th className="pb-3"><div className="h-4 bg-gray-200 rounded w-12"></div></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between mt-5">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-8 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  )
}

// ============================================================================
// SUB WALLET TABLE - Independent Component
// ============================================================================

export default function SubWalletTable() {
  const [rows, setRows] = useState<WalletRow[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWallets = useCallback(
    async (pageNum: number = 1) => {
      try {
        setLoading(true)
        setError(null)

        const url = `${API_URL}/wallets/dashboard/list`
        const params = new URLSearchParams({
          page: pageNum.toString(),
          take: "10",
        })

        const fullUrl = `${url}?${params.toString()}`
        console.log("📡 [SubWalletTable] Fetching:", fullUrl)

        const res = await axiosClient.get<ApiResponse>(fullUrl)
        console.log("✅ [SubWalletTable] API response:", res.data)

        if (!res.data.success) {
          throw new Error(res.data.message || "API request failed")
        }

        const apiData = res.data.data
        const walletList = apiData.wallets || []

        // Map wallet data
        const wallets = walletList.map((w: any, i: number) => {
          const username = w.user?.username || w.username
          const userDisplay =
            username && username.trim() !== ""
              ? username
              : `${w.user?.first_name || ""} ${w.user?.last_name || ""}`.trim() || "N/A"

          return {
            id: w.id || i.toString(),
            user: userDisplay,
            address: w.address || "-",
            status: w.is_initialized_passcode ? "Active" : "Inactive",
            amount: `$${Number(w.assets || 0).toLocaleString()}`,
          }
        })

        setRows(wallets)
        setPagination(apiData.paginated)
        setPage(apiData.paginated.page)
      } catch (err: any) {
        console.error("❌ [SubWalletTable] Error:", err.message)
        setError(err.message)
        setRows([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    fetchWallets(page)
  }, [page, fetchWallets])

  const handlePrevious = () => {
    if (pagination?.has_prev) {
      setPage((p) => Math.max(1, p - 1))
    }
  }

  const handleNext = () => {
    if (pagination?.has_next) {
      setPage((p) => p + 1)
    }
  }

  const handlePageClick = (pageNum: number) => {
    setPage(pageNum)
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const csvContent = [
        ["#", "User", "Wallet Address", "Status", "Amount"],
        ...rows.map((r, i) => [
          ((page - 1) * (pagination?.take || 10) + i + 1).toString(),
          r.user,
          r.address,
          r.status,
          r.amount,
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `wallets-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Export failed:", err)
    } finally {
      setExporting(false)
    }
  }

  const handleRefresh = () => {
    setPage(1)
    fetchWallets(1)
  }

  if (loading && rows.length === 0) {
    return <SubWalletTableSkeleton />
  }

  if (error && rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mt-6">
        <div className="text-center py-6">
          <p className="text-red-600 text-sm mb-4">Error loading wallets: {error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            <RotateCcw size={16} />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-gray-900">Sub-wallet with balance</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
            title="Refresh"
          >
            <RotateCcw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleExport}
            disabled={loading || exporting || rows.length === 0}
            className="flex items-center space-x-2 border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            <Download size={16} />
            <span>{exporting ? "Exporting..." : "Export"}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="text-gray-500 border-b text-xs">
              <th className="pb-3 font-medium">#</th>
              <th className="pb-3 font-medium">User</th>
              <th className="pb-3 font-medium">Wallet Address</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((r, i) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3">{(page - 1) * (pagination?.take || 10) + i + 1}</td>
                  <td className="py-3">{r.user}</td>
                  <td className="py-3 font-mono text-gray-600 text-xs truncate max-w-xs" title={r.address}>
                    {r.address}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-medium ${r.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-blue-600">{r.amount}</td>
                  <td className="py-3 text-right">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm shadow-sm transition">
                      Collect
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500 text-sm">
                  No wallets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Records Info */}
      {pagination && rows.length > 0 && (
        <div className="text-xs text-gray-600 mt-4">
          Showing {rows.length} of {pagination.number_records} records (Page{" "}
          {pagination.page} of {pagination.pages})
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-5">
          {/* Previous */}
          <button
            onClick={handlePrevious}
            disabled={!pagination.has_prev || loading}
            className={`flex items-center space-x-1 text-sm border px-3 py-1.5 rounded-lg transition ${!pagination.has_prev || loading
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          {/* Page buttons */}
          <div className="flex items-center space-x-1">
            {pagination.pages <= 7 ? (
              Array.from({ length: pagination.pages }).map((_, i) => {
                const pageNum = i + 1
                const isCurrent = pageNum === pagination.page
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageClick(pageNum)}
                    disabled={isCurrent || loading}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition ${isCurrent
                      ? "bg-blue-600 text-white cursor-default"
                      : "text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed"
                      }`}
                  >
                    {pageNum}
                  </button>
                )
              })
            ) : (
              <>
                {pagination.page > 3 && (
                  <>
                    <button
                      onClick={() => handlePageClick(1)}
                      disabled={loading}
                      className="w-8 h-8 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      1
                    </button>
                    <span className="text-gray-400">...</span>
                  </>
                )}

                {Array.from({ length: Math.min(5, pagination.pages) }).map((_, i) => {
                  let pageNum
                  if (pagination.page <= 3) {
                    pageNum = i + 1
                  } else if (pagination.page > pagination.pages - 3) {
                    pageNum = pagination.pages - 4 + i
                  } else {
                    pageNum = pagination.page - 2 + i
                  }

                  if (pageNum < 1 || pageNum > pagination.pages) return null

                  const isCurrent = pageNum === pagination.page
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageClick(pageNum)}
                      disabled={isCurrent || loading}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition ${isCurrent
                        ? "bg-blue-600 text-white cursor-default"
                        : "text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed"
                        }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                {pagination.page < pagination.pages - 2 && (
                  <>
                    <span className="text-gray-400">...</span>
                    <button
                      onClick={() => handlePageClick(pagination.pages)}
                      disabled={loading}
                      className="w-8 h-8 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      {pagination.pages}
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Next */}
          <button
            onClick={handleNext}
            disabled={!pagination.has_next || loading}
            className={`flex items-center space-x-1 text-sm border px-3 py-1.5 rounded-lg transition ${!pagination.has_next || loading
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}