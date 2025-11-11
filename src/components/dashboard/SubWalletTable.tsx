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

// Skeleton loader for table rows
function TableRowSkeleton() {
  return (
    <tr className="border-t border-gray-100 animate-pulse">
      <td className="py-3"><div className="h-4 bg-gray-200 rounded w-6"></div></td>
      <td className="py-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="py-3"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
      <td className="py-3"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
      <td className="py-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      <td className="py-3 text-right"><div className="h-8 bg-gray-200 rounded w-20 ml-auto"></div></td>
    </tr>
  )
}

export default function SubWalletTable() {
  const [rows, setRows] = useState<WalletRow[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const perPage = 10

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setLoading(true)
        const url = `${API_URL}/wallets/dashboard/list`
        console.log("📡 Fetching:", url)

        const res = await axiosClient.get(url)
        console.log("✅ API raw data:", res.data)

        const data = res.data?.data || {}
        const walletList =
          data.wallets ||
          data.list ||
          data.items ||
          (Array.isArray(data) ? data : [])

        const wallets = walletList.map((w: any, i: number) => ({
          id: w.id || i.toString(),
          user: w.user?.username || w.username || "N/A",
          address: w.address || "-",
          status: w.is_initialized_passcode ? "Active" : "Inactive",
          amount: `$${Number(w.assets || w.balance || 0).toLocaleString()}`,
        }))

        setRows(wallets)

        const total = data.paginated?.total || walletList.length
        const totalPages = Math.max(1, Math.ceil(total / perPage))
        setPages(totalPages)

        if (page > totalPages) setPage(totalPages)
      } catch (err: any) {
        console.error("❌ Error fetching sub-wallets:", err.message)
        setRows([])
      } finally {
        setLoading(false)
      }
    }

    fetchWallets()
  }, [page])

  const visible = rows.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mt-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-gray-900">
          Sub-wallet with balance
        </h3>
        <button className="flex items-center space-x-2 border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
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
              // Loading state - show 10 skeleton rows
              <>
                {Array.from({ length: perPage }).map((_, i) => (
                  <TableRowSkeleton key={`skeleton-${i}`} />
                ))}
              </>
            ) : visible.length > 0 ? (
              // Loaded state - show actual data
              visible.map((r, i) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 text-gray-600">{(page - 1) * perPage + i + 1}</td>
                  <td className="py-3 font-medium text-gray-900">{r.user}</td>
                  <td className="py-3 font-mono text-xs text-gray-500">
                    {r.address.length > 30 ? `${r.address.slice(0, 30)}...` : r.address}
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
              // Empty state
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-8 text-gray-500 text-sm"
                >
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="h-12 w-12 text-gray-400 mb-2"
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
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination */}
      <div className="flex items-center justify-between mt-5">
        {/* Previous */}
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className={`flex items-center space-x-1 text-sm border px-3 py-1.5 rounded-lg transition ${page === 1 || loading
            ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
            : "text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        {/* Page buttons */}
        <div className="flex items-center space-x-1">
          {Array.from({ length: pages }).map((_, i) => {
            const pageNum = i + 1
            const isCurrent = pageNum === page
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                disabled={isCurrent || loading}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${isCurrent
                  ? "bg-blue-600 text-white cursor-default"
                  : loading
                    ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        {/* Next */}
        <button
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          disabled={page === pages || loading}
          className={`flex items-center space-x-1 text-sm border px-3 py-1.5 rounded-lg transition ${page === pages || loading
            ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
            : "text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}