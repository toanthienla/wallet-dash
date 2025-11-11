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

export default function SubWalletTable() {
  const [rows, setRows] = useState<WalletRow[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const perPage = 10

  useEffect(() => {
    const fetchWallets = async () => {
      try {
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
            {visible.length > 0 ? (
              visible.map((r, i) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="py-3">{(page - 1) * perPage + i + 1}</td>
                  <td className="py-3">{r.user}</td>
                  <td className="py-3 font-mono text-gray-600">{r.address}</td>
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

      {/* ✅ Pagination luôn hiện, kể cả khi chỉ có 1 trang */}
      <div className="flex items-center justify-between mt-5">
        {/* Previous */}
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`flex items-center space-x-1 text-sm border px-3 py-1.5 rounded-lg transition ${page === 1
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
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
                disabled={isCurrent}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${isCurrent
                    ? "bg-blue-600 text-white cursor-default"
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
          disabled={page === pages}
          className={`flex items-center space-x-1 text-sm border px-3 py-1.5 rounded-lg transition ${page === pages
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
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
