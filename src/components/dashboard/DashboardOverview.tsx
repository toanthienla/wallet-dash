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

// ============================================================================
// SKELETON LOADERS - Each component has its own
// ============================================================================

// StatCard Skeleton
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

// SystemWalletPanel Skeleton
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

// ============================================================================
// ERROR STATE COMPONENTS
// ============================================================================

function StatCardsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-center py-4">
            <p className="text-red-600 text-xs mb-2">Failed to load</p>
            <button
              onClick={onRetry}
              className="text-blue-600 hover:text-blue-700 text-xs font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function SystemWalletErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <div className="text-center py-4">
        <p className="text-red-600 text-xs mb-2">Failed to load system wallets</p>
        <button
          onClick={onRetry}
          className="text-blue-600 hover:text-blue-700 text-xs font-medium"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// SYSTEM WALLET PANEL - Independent Component
// ============================================================================

type WalletStatus = "NORMAL" | "WARNING" | "STABLE"

type SystemWallet = {
  name: string
  status: WalletStatus
  current_balance: number
}

function getStatusDisplay(status: WalletStatus): { label: string; className: string; barColor: string } {
  const statusMap: Record<WalletStatus, { label: string; className: string; barColor: string }> = {
    NORMAL: {
      label: "Normal",
      className: "bg-green-100 text-green-700",
      barColor: "bg-green-500",
    },
    WARNING: {
      label: "Warning",
      className: "bg-orange-100 text-orange-700",
      barColor: "bg-orange-400",
    },
    STABLE: {
      label: "Stable",
      className: "bg-blue-100 text-blue-700",
      barColor: "bg-blue-500",
    },
  }
  return statusMap[status]
}

function SystemWalletPanel() {
  const [wallets, setWallets] = useState<SystemWallet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchWallets = async () => {
    try {
      setLoading(true)
      setError(false)

      const url = `${API_URL}/platform-config/dashboard/main-wallets`
      console.log("📡 [SystemWalletPanel] Fetching:", url)

      const res = await axiosClient.get(url)
      console.log("✅ [SystemWalletPanel] Data:", res.data)

      const data = res.data?.data?.main_wallets || []
      setWallets(data)
    } catch (err: any) {
      console.error("❌ [SystemWalletPanel] Error:", err.message)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWallets()
  }, [])

  if (loading) {
    return <SystemWalletPanelSkeleton />
  }

  if (error) {
    return <SystemWalletErrorState onRetry={fetchWallets} />
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">System Wallet Status</h2>
        <button className="flex items-center gap-2 text-sm px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
          <Image src="/images/icons/settings.svg" alt="Settings" width={16} height={16} />
          Config
        </button>
      </div>

      <div className="space-y-5">
        {wallets.length > 0 ? (
          wallets.map((w, i) => {
            const { label, className, barColor } = getStatusDisplay(w.status)
            const percent = Math.min((w.current_balance / 20000) * 100, 100)

            return (
              <div key={i} className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{w.name}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${className}`}>
                    {label}
                  </span>
                </div>

                <div className="mt-1 text-base font-semibold text-gray-900">
                  ${w.current_balance.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 mb-2">Threshold: $1B - $5B</div>

                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all ${barColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{percent.toFixed(0)}%</span>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">No wallets available</div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// STAT CARDS SECTION - Independent Component
// ============================================================================

type OverviewStats = {
  totalInitializedPasscode: number
  totalUninitializedPasscode: number
  totalUsers: number
  totalPendingCollection: number
  totalActiveSubWallets: number
  totalBalance: number
}

function StatCardsSection() {
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

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(false)

      const url = `${API_URL}/wallets/dashboard/overview`
      console.log("📡 [StatCardsSection] Fetching:", url)

      const res = await axiosClient.get(url)
      console.log("✅ [StatCardsSection] Data:", res.data)

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
      console.error("❌ [StatCardsSection] Error:", err.message)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </>
    )
  }

  if (error) {
    return <StatCardsErrorState onRetry={fetchStats} />
  }

  return (
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
  )
}

// ============================================================================
// MAIN DASHBOARD OVERVIEW
// ============================================================================

export default function DashboardOverview() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-full">
            {/* Stats and System Wallet in Grid - Load independently */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left cards - StatCardsSection loads independently */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCardsSection />
              </div>

              {/* Right panel - SystemWalletPanel loads independently */}
              <div>
                <SystemWalletPanel />
              </div>
            </div>

            {/* Chart - Loads independently */}
            <div className="mt-6">
              <MoneyFlowChart />
            </div>

            {/* Table - Loads independently */}
            <div className="mt-6">
              <SubWalletTable />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}