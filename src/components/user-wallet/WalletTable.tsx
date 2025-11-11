"use client"
import React, { useState, useEffect } from "react"
import { Search, Download, CheckSquare } from "lucide-react"
import Link from "next/link"
import { API_URL } from "@/utils/constants"
import axiosClient from "@/utils/axiosClient"

type Wallet = {
  id: string
  user: {
    first_name: string | null
    last_name: string | null
    email: string | null
  }
  assets: number
  address: string
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

// Helper function to generate user info with full name and initials
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

export default function WalletTable() {
  const [wallets, setWallets] = useState<Row[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await axiosClient.get(`${API_URL}/wallets/dashboard/list`)
        const data = res.data.data.wallets

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
          }
        })

        setWallets(rows)
      } catch (err) {
        console.error("Error fetching wallets:", err)
        setWallets([])
      } finally {
        setLoading(false)
      }
    }

    fetchWallets()
  }, [])

  const perPage = 10

  // Filter wallets based on search query
  const filteredWallets = wallets.filter((wallet) =>
    wallet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wallet.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wallet.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pages = Math.ceil(filteredWallets.length / perPage)
  const visible = filteredWallets.slice((page - 1) * perPage, page * perPage)

  // Reset page when search query changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1)
  }

  // Handle select all high balance
  const handleSelectAllHighBalance = () => {
    const highBalanceWallets = wallets.filter(
      (w) => w.status === "High Value" || w.status === "VIP"
    )
    console.log("Selected high balance wallets:", highBalanceWallets)
    // You can implement actual selection logic here
  }

  // Handle export list
  const handleExportList = () => {
    const csvContent = [
      ["ID", "Name", "Status", "Transactions", "Amount", "Address"],
      ...visible.map((r) => [
        r.id,
        r.name,
        r.status,
        r.transactions,
        r.amount,
        r.address,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `wallets_${Date.now()}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">Loading wallets...</p>
        </div>
      </div>
    )
  }

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
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm w-60 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Search by name, address..."
            />
          </div>

          <button
            onClick={handleSelectAllHighBalance}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm text-gray-700 transition"
          >
            <CheckSquare size={16} />
            <span>Select All High Balance</span>
          </button>

          <button
            onClick={handleExportList}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm transition"
          >
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
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No wallets found
                </td>
              </tr>
            ) : (
              visible.map((r, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 transition">
                  <td className="py-4 pr-6 font-mono text-xs text-gray-500">
                    {r.id.length > 20 ? `${r.id.slice(0, 20)}...` : r.id}
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
                          {r.address.length > 30
                            ? `${r.address.slice(0, 30)}...`
                            : r.address}
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
                    <Link href={`/wallet-detail/${r.address}`}>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition">
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
      <div className="flex flex-col md:flex-row items-center justify-between mt-5 gap-3">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`flex items-center space-x-1 px-4 py-2 rounded-full border text-sm transition ${page === 1
            ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
            : "text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
        >
          ← <span>Previous</span>
        </button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: pages || 1 }).map((_, i) => {
            const num = i + 1
            return (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition ${page === num
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {num}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, pages))}
          disabled={page === pages}
          className={`flex items-center space-x-1 px-4 py-2 rounded-full border text-sm transition ${page === pages
            ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
            : "text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
        >
          <span>Next</span> →
        </button>
      </div>
    </div>
  )
}