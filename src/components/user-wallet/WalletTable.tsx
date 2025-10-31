"use client"
import React, { useState } from "react"
import { Search, Download, CheckSquare } from "lucide-react"
import Link from "next/link"

type Row = {
  id: string
  name: string
  initials: string
  status: "Active" | "Medium" | "High Value" | "VIP"
  transactions: string
  amount: string
}

const mockRows: Row[] = [
  { id: "DE124321", name: "John Doe", initials: "JD", status: "Active", transactions: "3 transactions today", amount: "$2,400,000" },
  { id: "DE124322", name: "Kierra Franci", initials: "KF", status: "Medium", transactions: "1 transaction today", amount: "$1,800,000" },
  { id: "DE124323", name: "Emerson Workman", initials: "EW", status: "High Value", transactions: "5 transactions this week", amount: "$5,200,000" },
  { id: "DE124324", name: "Chance Philips", initials: "CP", status: "VIP", transactions: "Large holder", amount: "$8,500,000" },
  { id: "DE124325", name: "Terry Geidt", initials: "TG", status: "Medium", transactions: "Active trader", amount: "$3,100,000" },
  { id: "DE124326", name: "Sarah Wilson", initials: "SW", status: "Active", transactions: "2 transactions today", amount: "$1,200,000" },
  { id: "DE124327", name: "Mike Johnson", initials: "MJ", status: "High Value", transactions: "4 transactions this week", amount: "$4,800,000" },
  { id: "DE124328", name: "Lisa Davis", initials: "LD", status: "VIP", transactions: "Large holder", amount: "$12,000,000" },
  { id: "DE124329", name: "David Brown", initials: "DB", status: "Medium", transactions: "Active trader", amount: "$2,300,000" },
  { id: "DE124330", name: "Emma Taylor", initials: "ET", status: "Active", transactions: "1 transaction today", amount: "$950,000" },
]

function StatusPill({ status }: { status: Row["status"] }) {
  const map: Record<Row["status"], string> = {
    Active: "bg-green-100 text-green-700",
    Medium: "bg-pink-100 text-pink-600",
    "High Value": "bg-orange-100 text-orange-600",
    VIP: "bg-blue-100 text-blue-600",
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  )
}

export default function WalletTable() {
  const [page, setPage] = useState(1)
  const perPage = 10
  const pages = Math.ceil(mockRows.length / perPage)
  const visible = mockRows.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
        <h3 className="text-sm font-semibold text-gray-800">
          Wallet Selection & Control
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm w-60 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Search..."
            />
          </div>

          <button className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm text-gray-700">
            <CheckSquare size={16} />
            <span>Select All High Balance</span>
          </button>

          <button className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-black-50 text-black-600 hover:bg-black-100 text-sm">
            <Download size={16} />
            <span>Export List</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b text-left">
              <th className="py-3 pr-6 font-medium">ID</th>
              <th className="py-3 pr-6 font-medium">User</th>
              <th className="py-3 pr-6 font-medium">Status</th>
              <th className="py-3 pr-6 font-medium">Transactions</th>
              <th className="py-3 pr-6 font-medium">Amount</th>
              <th className="py-3 pr-6 font-medium"></th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {visible.map((r, i) => (
              <tr key={i} className="border-b hover:bg-gray-50 transition">
                <td className="py-4 pr-6 font-mono text-xs text-gray-500">
                  {r.id}
                </td>
                <td className="py-4 pr-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                      {r.initials}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {r.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        123123123123123
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 pr-6">
                  <StatusPill status={r.status} />
                </td>
                <td className="py-4 pr-6 text-gray-700">{r.transactions}</td>
                <td className="py-4 pr-6 font-medium">{r.amount}</td>
                <td className="py-4 pr-6">
                  <Link href={`/wallet-detail/${r.id}`}>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition">
                      View detail
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-5 gap-3">
        {/* Left side: Previous */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center space-x-1 px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            ← <span>Previous</span>
          </button>
        </div>

        {/* Center: Page numbers */}
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                page === num
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Right side: Next */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className="flex items-center space-x-1 px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            <span>Next</span> →
          </button>
        </div>
      </div>
    </div>
  )
}
