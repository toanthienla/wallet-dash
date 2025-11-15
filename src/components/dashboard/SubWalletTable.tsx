"use client"
import React, { useEffect, useState } from "react"
import axiosClient from "@/utils/axiosClient"
import { API_URL } from "@/utils/constants"
import { Download, ChevronLeft, ChevronRight } from "lucide-react"

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

export default function SubWalletTable() {
  const [rows, setRows] = useState<WalletRow[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setLoading(true)
        setError(null)

        const url = `${API_URL}/wallets/dashboard/list`
        const params = new URLSearchParams({
          page: page.toString(),
          take: "10",
        })

        const fullUrl = `${url}?${params.toString()}`
        console.log("📡 Fetching:", fullUrl)

        const res = await axiosClient.get<ApiResponse>(fullUrl)
        console.log("✅ API response:", res.data)

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
      } catch (err: any) {
        console.error("❌ Error fetching sub-wallets:", err.message)
        setError(err.message)
        setRows([])
      } finally {
        setLoading(false)
      }
    }

    fetchWallets()
  }, [page])

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

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mt-6">
        <div className="text-center py-6 text-red-600 text-sm">
          Error loading wallets: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mt-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-gray-900">
          Sub-wallet with balance
        </h3>
        <button className="flex items-center space-x-2 border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium transition">
          <Download size={16} />
          <span>Export List</span>
        </button>
      </div>

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
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500 text-sm">
                  Loading...
                </td>
              </tr>
            ) : rows.length > 0 ? (
              rows.map((r, i) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3">
                    {(page - 1) * (pagination?.take || 10) + i + 1}
                  </td>
                  <td className="py-3">{r.user}</td>
                  <td className="py-3 font-mono text-gray-600 text-xs">
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
                  <td className="py-3 font-semibold text-blue-600">
                    {r.amount}
                  </td>
                  <td className="py-3 text-right">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm shadow-sm transition">
                      Collect
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-6 text-gray-500 text-sm"
                >
                  No wallets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Records Info */}
      {pagination && (
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
            disabled={!pagination.has_prev}
            className={`flex items-center space-x-1 text-sm border px-3 py-1.5 rounded-lg transition ${!pagination.has_prev
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          {/* Page buttons - Show limited range */}
          <div className="flex items-center space-x-1">
            {pagination.pages <= 7 ? (
              // Show all pages if 7 or fewer
              Array.from({ length: pagination.pages }).map((_, i) => {
                const pageNum = i + 1
                const isCurrent = pageNum === pagination.page
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageClick(pageNum)}
                    disabled={isCurrent}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition ${isCurrent
                      ? "bg-blue-600 text-white cursor-default"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {pageNum}
                  </button>
                )
              })
            ) : (
              // Show smart page range for many pages
              <>
                {/* First page */}
                {pagination.page > 3 && (
                  <>
                    <button
                      onClick={() => handlePageClick(1)}
                      className="w-8 h-8 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      1
                    </button>
                    <span className="text-gray-400">...</span>
                  </>
                )}

                {/* Pages around current */}
                {Array.from({ length: Math.min(5, pagination.pages) }).map(
                  (_, i) => {
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
                        disabled={isCurrent}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition ${isCurrent
                          ? "bg-blue-600 text-white cursor-default"
                          : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        {pageNum}
                      </button>
                    )
                  }
                )}

                {/* Last page */}
                {pagination.page < pagination.pages - 2 && (
                  <>
                    <span className="text-gray-400">...</span>
                    <button
                      onClick={() => handlePageClick(pagination.pages)}
                      className="w-8 h-8 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
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
            disabled={!pagination.has_next}
            className={`flex items-center space-x-1 text-sm border px-3 py-1.5 rounded-lg transition ${!pagination.has_next
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