import React, { useState } from 'react'
import { Download, ChevronLeft, ChevronRight } from 'lucide-react'

type Row = {
  id: string
  user: string
  address: string
  lastActive: string
  amount: string
}

const sampleRows: Row[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `DE12432${i}`,
  user: `user@crypto.wallet`,
  address: `123123123123123`,
  lastActive: `2h ago`,
  amount: `$2,400,000`,
}))

export default function WalletTable() {
  const [page, setPage] = useState(1)
  const perPage = 5
  const pages = Math.ceil(sampleRows.length / perPage)
  const visible = sampleRows.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-gray-900">Sub-wallet with balance</h3>
        <button className="flex items-center space-x-2 border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium transition">
          <Download size={16} />
          <span>Export List</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="text-gray-500 border-b text-xs">
              <th className="pb-3 font-medium">ID</th>
              <th className="pb-3 font-medium">User</th>
              <th className="pb-3 font-medium">Wallet Address</th>
              <th className="pb-3 font-medium">Last Active</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="py-3">{r.id}</td>
                <td className="py-3">{r.user}</td>
                <td className="py-3 font-mono text-gray-600">{r.address}</td>
                <td className="py-3 text-gray-500">{r.lastActive}</td>
                <td className="py-3 font-semibold text-green-600">{r.amount}</td>
                <td className="py-3">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded-lg text-sm shadow-sm transition">
                    Collect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="flex items-center space-x-1 text-gray-600 text-sm border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: pages }).map((_, i) => {
            const pageNum = i + 1
            const isCurrent = pageNum === page
            // chỉ hiển thị vài số đầu, cuối và số hiện tại
            if (
              pageNum === 1 ||
              pageNum === pages ||
              Math.abs(pageNum - page) <= 1
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              )
            } else if (
              (pageNum === 2 && page > 3) ||
              (pageNum === pages - 1 && page < pages - 2)
            ) {
              return <span key={pageNum} className="px-2 text-gray-400">...</span>
            }
            return null
          })}
        </div>

        <button
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          disabled={page === pages}
          className="flex items-center space-x-1 text-gray-600 text-sm border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-40"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
