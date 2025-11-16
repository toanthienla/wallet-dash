"use client"
import React, { useState, useEffect } from "react"
import { Search, Download, CheckSquare, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { API_URL } from "@/utils/constants"
import axiosClient from "@/utils/axiosClient"

type Wallet = {
  id: string
  address: string
  user_created: string
  is_initialized_passcode: boolean
  app_slug: string[]
  assets: number
  user: {
    id: string | null
    username: string | null
    first_name: string | null
    last_name: string | null
    email: string | null
  }
  total_transactions_today: number
}

type Row = {
  id: string
  name: string
  initials: string
  status: "Active" | "Medium" | "High Value" | "VIP"
  transactions: string
  amount: string
  address: string
  userId: string | null
}

type PaginationMeta = {
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

// --- Dynamic Color Generation ---
const COLORS = [
  "#10b981", // green-500
  "#f97316", // orange-500
  "#3b82f6", // blue-500
  "#a855f7", // purple-500
  "#ef4444", // red-500
  "#f59e0b", // amber-500
]

function getAssetColor(index: number) {
  return COLORS[index % COLORS.length]
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

function getUserColor(userId: string | null): string {
  if (!userId) {
    return getAssetColor(0) // Default green for no user
  }
  const hash = hashCode(userId)
  return getAssetColor(hash)
}

function StatusPill({ status }: { status: Row["status"] }) {
  const map: Record<Row["status"], string> = {
    Active: "bg-green-100 text-green-700 border border-green-200",
    Medium: "bg-pink-100 text-pink-700 border border-pink-200",
    "High Value": "bg-orange-100 text-orange-700 border border-orange-200",
    VIP: "bg-blue-100 text-blue-700 border border-blue-200",
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
      {status}
    </span>
  )
}

function generateUserInfo(userData: Wallet["user"]) {
  const fullName = [userData.first_name, userData.last_name]
    .filter(Boolean)
    .join(" ") || "No user info"

  const initials = fullName
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .join("")
    .slice(0, 2)

  return { fullName, initials }
}

// Table row skeleton
function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </td>
      <td className="py-4 px-6"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
      <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
      <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      <td className="py-4 px-6"><div className="h-8 bg-gray-200 rounded w-24"></div></td>
    </tr>
  )
}

export default function WalletTable({ loading: initialLoading = false }) {
  const [wallets, setWallets] = useState<Row[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(initialLoading)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState<PaginationMeta>({
    keyword: "",
    page: 1,
    take: 10,
    sort: "date_created",
    sorted: "desc",
    to_date: "",
    number_records: 0,
    pages: 1,
    has_prev: false,
    has_next: false,
  })

  const perPage = 10

  useEffect(() => {
    const fetchWallets = async () => {
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
          `${API_URL}/wallets/dashboard/list?${params.toString()}`
        )

        const data = res.data.data.wallets || []
        const paginationData = res.data.data.paginated

        const rows = data.map((w: Wallet) => {
          const { fullName, initials } = generateUserInfo(w.user)

          let status: Row["status"] = "Medium"
          if (w.is_initialized_passcode) status = "Active"
          if (w.assets > 5000000) status = "High Value"
          if (w.assets > 10000000) status = "VIP"

          return {
            id: w.id,
            name: fullName,
            initials,
            address: w.address,
            status,
            transactions: w.total_transactions_today
              ? `${w.total_transactions_today} transactions today`
              : "No transactions",
            amount: `$${w.assets.toLocaleString()}`,
            userId: w.user.id,
          }
        })

        setWallets(rows)
        setPagination({
          keyword: paginationData.keyword || "",
          page: paginationData.page || 1,
          take: paginationData.take || perPage,
          sort: paginationData.sort || "date_created",
          sorted: paginationData.sorted || "desc",
          to_date: paginationData.to_date || "",
          number_records: paginationData.number_records || 0,
          pages: paginationData.pages || 1,
          has_prev: paginationData.has_prev || false,
          has_next: paginationData.has_next || false,
        })
      } catch (err) {
        console.error("Error fetching wallets:", err)
        setWallets([])
      } finally {
        setLoading(false)
      }
    }

    fetchWallets()
  }, [page, searchQuery])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1) // Reset to first page on search
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Wallet List</h3>
          <p className="text-sm text-gray-500 mt-1">
            Total wallets: {pagination.number_records.toLocaleString()}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm w-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Search by name, address..."
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm text-gray-700 transition whitespace-nowrap">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-600 border-b text-xs font-semibold">
              <th className="py-3 px-6 text-left">ID</th>
              <th className="py-3 px-6 text-left">User</th>
              <th className="py-3 px-6 text-left">Status</th>
              <th className="py-3 px-6 text-left">Transactions</th>
              <th className="py-3 px-6 text-left">Amount</th>
              <th className="py-3 px-6 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {loading ? (
              <>
                {Array.from({ length: perPage }).map((_, i) => (
                  <TableRowSkeleton key={`skeleton-${i}`} />
                ))}
              </>
            ) : wallets.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    No wallets found
                  </div>
                </td>
              </tr>
            ) : (
              wallets.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-4 px-6 font-mono text-xs text-gray-500">
                    {r.id.length > 20 ? `${r.id.slice(0, 20)}...` : r.id}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-sm"
                        style={{ backgroundColor: getUserColor(r.userId) }}
                      >
                        {r.initials || "?"}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{r.name}</div>
                        <div className="text-xs text-gray-500">
                          {r.address.length > 30
                            ? `${r.address.slice(0, 30)}...`
                            : r.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="py-4 px-6 text-gray-600 text-sm">{r.transactions}</td>
                  <td className="py-4 px-6 font-semibold text-gray-900">{r.amount}</td>
                  <td className="py-4 px-6">
                    <Link href={`/wallet-detail/${r.address}`}>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
                        View detail
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-4">
        <div className="text-sm text-gray-600">
          Page {pagination.page} of {pagination.pages} • Showing {wallets.length} of {pagination.number_records.toLocaleString()} records
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.has_prev || loading}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg border text-sm font-medium transition ${!pagination.has_prev || loading
              ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
              : "text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {/* Show first page */}
            <button
              onClick={() => setPage(1)}
              disabled={loading}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === 1
                ? "bg-blue-600 text-white"
                : loading
                  ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              1
            </button>

            {/* Show ellipsis if there are hidden pages */}
            {page > 3 && (
              <span className="text-gray-400">...</span>
            )}

            {/* Show pages around current page */}
            {Array.from({
              length: Math.min(
                5,
                pagination.pages,
                Math.max(0, page - 1) + Math.max(0, pagination.pages - page) + 1
              ),
            }).map((_, i) => {
              let pageNum: number
              if (pagination.pages <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i
              } else {
                pageNum = page - 2 + i
              }

              if (pageNum === 1 || pageNum === pagination.pages) {
                return null
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  disabled={loading}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === pageNum
                    ? "bg-blue-600 text-white"
                    : loading
                      ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {pageNum}
                </button>
              )
            })}

            {/* Show ellipsis if there are hidden pages */}
            {page < pagination.pages - 2 && (
              <span className="text-gray-400">...</span>
            )}

            {/* Show last page if more than 1 page */}
            {pagination.pages > 1 && (
              <button
                onClick={() => setPage(pagination.pages)}
                disabled={loading}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === pagination.pages
                  ? "bg-blue-600 text-white"
                  : loading
                    ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {pagination.pages}
              </button>
            )}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
            disabled={!pagination.has_next || loading}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg border text-sm font-medium transition ${!pagination.has_next || loading
              ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
              : "text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}