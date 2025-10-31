"use client"
import React, { useEffect, useState } from "react"
import { API_URL } from "@/utils/constants"
import axiosClient from "@/utils/axiosClient";
import AppHeader from "@/layout/AppHeader"
import AppSidebar from "@/layout/AppSidebar"
import StatCard from "./StatCard"
import MoneyFlowChart from "./MoneyFlowChart"
import SubWalletTable from "./SubWalletTable"
import Image from "next/image"

function SystemWalletPanel() {
  const wallets = [
    { name: "Main Deposit Wallet", amount: "$15.7B", status: "Normal", percent: 20, threshold: "$1B - $5B" },
    { name: "Withdraw Wallet", amount: "$892B", status: "Warning", percent: 50, threshold: "$1B - $5B" },
    { name: "Cold Storage", amount: "$24.7B", status: "Stable", percent: 90, threshold: "$1B - $5B" },
  ]

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
        {wallets.map((w) => (
          <div key={w.name} className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-800">{w.name}</span>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full
                  ${w.status === "Normal" ? "bg-green-100 text-green-700" : ""}
                  ${w.status === "Warning" ? "bg-orange-100 text-orange-700" : ""}
                  ${w.status === "Stable" ? "bg-blue-100 text-blue-700" : ""}
                `}
              >
                {w.status}
              </span>
            </div>

            <div className="mt-1 text-base font-semibold text-gray-900">{w.amount}</div>
            <div className="text-xs text-gray-400 mb-2">Threshold: {w.threshold}</div>

            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all
                    ${w.status === "Normal" ? "bg-blue-500" : ""}
                    ${w.status === "Warning" ? "bg-blue-400" : ""}
                    ${w.status === "Stable" ? "bg-blue-500" : ""}
                  `}
                  style={{ width: `${w.percent}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-8 text-right">{w.percent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubWallets: 0,
    pendingCollection: 0,
    systemAlerts: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `${API_URL}/wallets/dashboard/list`
        console.log("📡 Fetching dashboard data from:", url)

        // 🔥 Dùng axios thay fetch
        const res = await axiosClient.get(url, {
          withCredentials: true, // gửi cookie
        })

        console.log("✅ Fetched data:", res.data)

        const d = res.data?.data || {}

        setStats({
          totalUsers: d.total_of_users ?? 0,
          activeSubWallets: d.total_of_active_sub_wallets ?? 0,
          pendingCollection: d.total_of_pending_collection ?? 0,
          systemAlerts: 0, // chưa có trong API
        })
      } catch (err: any) {
        console.error("❌ Error fetching dashboard data:", err.message)
      }
    }

    fetchData()
  }, [])

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
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers.toLocaleString()}
                  subtitle="+11.01% from last month"
                  icon={<img src="/images/icons/Wallet.svg" alt="Wallet Icon" className="w-5 h-5" />}
                />
                <StatCard
                  title="Active Sub-Wallet"
                  value={stats.activeSubWallets.toLocaleString()}
                  subtitle="874 wallets with balance"
                  icon={<img src="/images/icons/Active.svg" alt="Active Icon" className="w-5 h-5" />}
                />
                <StatCard
                  title="Pending Collection"
                  value={stats.pendingCollection.toLocaleString()}
                  subtitle="23 wallets ready"
                  icon={<img src="/images/icons/Pending.svg" alt="Pending Icon" className="w-6 h-6" />}
                />
                <StatCard
                  title="System Alert"
                  value={stats.systemAlerts}
                  subtitle="2 threshold warnings"
                  icon={<img src="/images/icons/System.svg" alt="System Icon" className="w-6 h-6" />}
                />
              </div>

              {/* Right panel */}
              <div>
                <SystemWalletPanel />
              </div>
            </div>

            <div className="mt-6">
              <MoneyFlowChart />
            </div>

            <div className="mt-6">
              <SubWalletTable />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
