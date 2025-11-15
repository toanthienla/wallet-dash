"use client"
import React, { useState, useEffect } from "react"
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { API_URL } from "@/utils/constants"
import axiosClient from "@/utils/axiosClient"

type Wallet = {
  id: string;
  user: {
    first_name: string | null
    last_name: string | null
    email: string | null
  }
  assets: number
  wallet_address: string // Renamed for clarity
  is_initialized_passcode: boolean
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
}

type PaginationState = {
  page: number
  pages: number
  has_next: boolean
  has_prev: boolean
  number_records: number
}

// ... (StatusPill, generateUserInfo, TableRowSkeleton components remain the same)
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

function generateUserInfo(userData: { first_name: string | null; last_name: string | null }) {
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
  const [loading, setLoading] = useState(initialLoading)

  // State for filters
  const [searchQuery, setSearchQuery] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  // State for pagination
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pages: 1,
    has_next: false,
    has_prev: false,
    number_records: 0,
  })
  const take = 10;

  useEffect(() => {
    const fetchWallets = async () => {
      setLoading(true)
      try {
        const params: any = {
          page: pagination.page,
          take,
          keyword: searchQuery,
          from_date: fromDate,
          to_date: toDate,
        }

        // Remove empty params
        Object.keys(params).forEach(key => (params[key] === '' || params[key] === null) && delete params[key]);

        const res = await axiosClient.get(`${API_URL}/wallets/dashboard/list`, { params })
        const data = res.data.data
        const walletList = data.wallets || data.list || []

        const rows = walletList.map((w: Wallet) => {
          const { fullName, initials } = generateUserInfo(w.user)

          let status: Row["status"] = "Medium"
          if (w.is_initialized_passcode) status = "Active"
          if (w.assets > 5000000) status = "High Value"
          if (w.assets > 10000000) status = "VIP"

          return {
            id: w.id,
            name: fullName,
            initials,
            address: w.wallet_address,
            status,
            transactions: w.total_transactions_today
              ? `${w.total_transactions_today} transactions today`
              : "No transactions",
            amount: `$${w.assets.toLocaleString()}`,
          }
        })

        setWallets(rows)

        if (data.paginated) {
          setPagination({
            page: data.paginated.page || 1,
            pages: data.paginated.pages || 1,
            has_next: data.paginated.has_next || false,
            has_prev: data.paginated.has_prev || false,
            number_records: data.paginated.number_records || 0
          });
        }

      } catch (err) {
        console.error("Error fetching wallets:", err)
        setWallets([])
      } finally {
        setLoading(false)
      }
    }

    const handler = setTimeout(() => {
      fetchWallets()
    }, 500); // Debounce search query

    return () => clearTimeout(handler);

  }, [pagination.page, searchQuery, fromDate, toDate])

  const setPage = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1) // Reset to first page on new search
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h3 className="text-base font-semibold text-gray-900">Wallet List</h3>

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
          {/* You can add date inputs here if needed */}
          {/* <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /> */}
          {/* <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /> */}

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
                {Array.from({ length: take }).map((_, i) => (
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
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                        {r.initials}
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
        <button
          onClick={() => setPage(pagination.page - 1)}
          disabled={!pagination.has_prev || loading}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg border text-sm font-medium transition disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed enabled:hover:bg-gray-50`}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: pagination.pages || 1 }).map((_, i) => {
            const num = i + 1
            return (
              <button
                key={num}
                onClick={() => setPage(num)}
                disabled={loading}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${pagination.page === num
                  ? "bg-blue-600 text-white"
                  : loading
                    ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {num}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setPage(pagination.page + 1)}
          disabled={!pagination.has_next || loading}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg border text-sm font-medium transition disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed enabled:hover:bg-gray-50`}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}