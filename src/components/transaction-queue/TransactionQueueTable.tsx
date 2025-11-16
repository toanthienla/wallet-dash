"use client"
import React, { useState } from "react"

type Tx = {
  id: string
  datetime: string
  queued: string
  type: "Deposit" | "Withdraw" | "Redeem"
  amount: string
  asset: "Fiat" | "Crypto" | "Point"
  status: "Processing" | "Waiting" | "Pending"
}

const mock: Tx[] = [
  { id: "DE124321", datetime: "2025-01-01 14:30", queued: "45 seconds ago", type: "Deposit", amount: "$123,323", asset: "Fiat", status: "Processing" },
  { id: "DE124321", datetime: "2025-01-01 14:30", queued: "1 minute ago", type: "Withdraw", amount: "100 BTC", asset: "Crypto", status: "Waiting" },
  { id: "DE124321", datetime: "2025-01-01 14:30", queued: "2 minutes ago", type: "Redeem", amount: "1,000 XP", asset: "Point", status: "Waiting" },
  { id: "DE124321", datetime: "2025-01-01 14:30", queued: "5 minutes ago", type: "Deposit", amount: "50 ETH", asset: "Crypto", status: "Waiting" },
  ...Array.from({ length: 10 }).map((): Tx => ({
    id: "DE124321",
    datetime: "2025-01-01 14:30",
    queued: "10 minutes ago",
    type: "Withdraw",
    amount: "100 USDT",
    asset: "Crypto",
    status: "Pending",
  })),
]

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
  return <span className={`font-medium text-sm`}>{asset}</span>
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

export default function TransactionQueueTable({ loading = false }: { loading?: boolean }) {
  const [page, setPage] = useState(1)
  const perPage = 10
  const pages = Math.ceil(mock.length / perPage)
  const visible = mock.slice((page - 1) * perPage, page * perPage)

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
            <input
              type="text"
              placeholder="Search..."
              disabled={loading}
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            <img
              src="/images/icons/Search.svg"
              alt="Search icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />

          </div>
          <button
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <img src="/images/icons/Calendar.svg" alt="calendar" width={16} height={16} />
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
            ) : visible.length === 0 ? (
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
              visible.map((tx, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 pr-6 font-mono">{tx.id}</td>
                  <td className="py-4 pr-6">{tx.datetime}</td>
                  <td className="py-4 pr-6">{tx.queued}</td>
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

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
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
          onClick={() => setPage(p => Math.min(pages, p + 1))}
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
  )
}