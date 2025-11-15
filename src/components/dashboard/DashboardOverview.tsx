"use client"
import React, { useEffect, useState } from "react"
import { API_URL } from "@/utils/constants"
import axiosClient from "@/utils/axiosClient"
import AppHeader from "@/layout/AppHeader"
import AppSidebar from "@/layout/AppSidebar"
import StatCard from "./StatCard"
import MoneyFlowChart from "./MoneyFlowChart"
import SubWalletTable from "./SubWalletTable"
import Image from "next/image"

// Skeleton loader for stat cards
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-40"></div>
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-lg ml-4"></div>
      </div>
    </div>
  )
}

// Skeleton loader for system wallet panel
function SystemWalletPanelSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-5 bg-gray-200 rounded-full w-16"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-40 mb-3"></div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2.5 bg-gray-200 rounded-full"></div>
              <div className="h-3 bg-gray-200 rounded w-8"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton loader for chart
function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
      <div className="h-72 bg-gray-200 rounded"></div>
    </div>
  )
}

// Skeleton loader for table
function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-3 border-b border-gray-100 last:border-b-0">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="flex-1 h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/5"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Error state component
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
      <div className="text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Unable to Load Dashboard</h3>
        <p className="text-gray-500 mb-6">
          Failed to load dashboard statistics. Please try again.
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

function SystemWalletPanel() {
  const [wallets, setWallets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await axiosClient.get(`${API_URL}/platform-config/dashboard/main-wallets`)
        const data = res.data?.data?.main_wallets || []
        setWallets(data)
      } catch (err: any) {
        console.error("❌ Error fetching main wallets:", err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchWallets()
  }, [])

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">System Wallet Status</h2>
        <button className="flex items-center gap-2 text-sm px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
          <Image src="/images/icons/settings.svg" alt="Settings" width={16} height={16} />
          Config
        </button>
      </div>

      {loading ? (
        <div className="space-y-5 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-5 bg-gray-200 rounded-full w-16"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-40 mb-3"></div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2.5 bg-gray-200 rounded-full"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {wallets.map((w, i) => {
            const status =
              w.status === "NORMAL"
                ? "Normal"
                : w.status === "WARNING"
                  ? "Warning"
                  : "Stable"

            const statusClass =
              status === "Normal"
                ? "bg-green-100 text-green-700"
                : status === "Warning"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-blue-100 text-blue-700"

            const percent = Math.min((w.current_balance / 20000) * 100, 100)

            return (
              <div key={i} className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{w.name}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusClass}`}>
                    {status}
                  </span>
                </div>

                <div className="mt-1 text-base font-semibold text-gray-900">
                  ${w.current_balance.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 mb-2">Threshold: $1B - $5B</div>

                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all
                        ${status === "Normal" ? "bg-blue-500" : ""}
                        ${status === "Warning" ? "bg-blue-400" : ""}
                        ${status === "Stable" ? "bg-blue-500" : ""}
                      `}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{percent.toFixed(0)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

type OverviewStats = {
  totalInitializedPasscode: number
  totalUninitializedPasscode: number
  totalUsers: number
  totalPendingCollection: number
  totalActiveSubWallets: number
  totalBalance: number
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<OverviewStats>({
    totalInitializedPasscode: 0,
    totalUninitializedPasscode: 0,
    totalUsers: 0,
    totalPendingCollection: 0,
    totalActiveSubWallets: 0,
    totalBalance: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchOverviewData = async () => {
    try {
      setLoading(true)
      setError(false)

      const url = `${API_URL}/wallets/dashboard/overview`
      console.log("📡 Fetching dashboard overview from:", url)

      const res = await axiosClient.get(url)
      console.log("✅ Dashboard overview data:", res.data)

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to fetch overview data")
      }

      const d = res.data?.data || {}

      setStats({
        totalInitializedPasscode: d.total_of_initialized_passcode ?? 0,
        totalUninitializedPasscode: d.total_of_uninitialized_passcode ?? 0,
        totalUsers: d.total_of_users ?? 0,
        totalPendingCollection: d.total_of_pending_collection ?? 0,
        totalActiveSubWallets: d.total_of_active_sub_wallets ?? 0,
        totalBalance: d.total_balance ?? 0,
      })
    } catch (err: any) {
      console.error("❌ Error fetching dashboard overview:", err.message)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverviewData()
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <AppHeader />
          <main className="flex-1 p-6 lg:p-8">
            <div className="max-w-full">
              <ErrorState onRetry={fetchOverviewData} />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left cards */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {loading ? (
                  <>
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                  </>
                ) : (
                  <>
                    <StatCard
                      title="Total Users"
                      value={stats.totalUsers.toLocaleString()}
                      subtitle="+11.01% from last month"
                      icon={<img src="/images/icons/Wallet.svg" alt="Wallet Icon" className="w-5 h-5" />}
                    />
                    <StatCard
                      title="Active Sub-Wallet"
                      value={stats.totalActiveSubWallets.toLocaleString()}
                      subtitle="Initialized and ready"
                      icon={<img src="/images/icons/Active.svg" alt="Active Icon" className="w-5 h-5" />}
                    />
                    <StatCard
                      title="Pending Collection"
                      value={stats.totalPendingCollection.toLocaleString()}
                      subtitle="Ready for collection"
                      icon={<img src="/images/icons/Pending.svg" alt="Pending Icon" className="w-6 h-6" />}
                    />
                    <StatCard
                      title="Total Balance"
                      value={`$${(stats.totalBalance / 1e9).toFixed(2)}B`}
                      subtitle={`${stats.totalUsers.toLocaleString()} accounts`}
                      icon={<img src="/images/icons/System.svg" alt="System Icon" className="w-6 h-6" />}
                    />
                  </>
                )}
              </div>

              {/* Right panel */}
              <div>
                {loading ? <SystemWalletPanelSkeleton /> : <SystemWalletPanel />}
              </div>
            </div>

            {!loading && (
              <>
                <div className="mt-6">
                  <MoneyFlowChart />
                </div>

                <div className="mt-6">
                  <SubWalletTable />
                </div>
              </>
            )}

            {loading && (
              <>
                <div className="mt-6">
                  <ChartSkeleton />
                </div>

                <div className="mt-6">
                  <TableSkeleton />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}