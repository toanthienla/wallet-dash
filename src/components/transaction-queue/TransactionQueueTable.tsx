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

export default function TransactionQueueTable() {
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
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none"
            />
            <img
              src="/images/icons/Search.svg"
              alt="Search icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />

          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
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
            {visible.map((tx, i) => (
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          className="flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          ← Previous
        </button>

        <div className="flex items-center space-x-2">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition ${page === i + 1
                  ? "bg-[#2563EB] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => setPage(p => Math.min(pages, p + 1))}
          className="flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
