"use client"
import React, { useState, useEffect, useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { RefreshCw } from "lucide-react"
import { API_URL } from "@/utils/constants"
import axiosClient from "@/utils/axiosClient"

// Skeleton loader for chart
function ChartSkeleton() {
  return (
    <div className="h-72 w-full animate-pulse">
      <div className="space-y-4 h-full">
        {/* Chart background */}
        <div className="h-full bg-gradient-to-b from-gray-100 to-gray-50 rounded-lg"></div>
      </div>
    </div>
  )
}

// Custom skeleton chart with animated bars
function AnimatedChartSkeleton() {
  return (
    <div className="h-72 w-full flex items-end justify-around px-6 py-8 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-2 flex-1 max-w-8"
          style={{
            animation: `shimmer 2s infinite`,
            animationDelay: `${i * 0.1}s`,
          }}
        >
          <div
            className="bg-blue-200 rounded-t opacity-60"
            style={{
              width: "100%",
              height: `${40 + Math.random() * 80}px`,
            }}
          ></div>
        </div>
      ))}
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default function MoneyFlowChart() {
  const tabs = ["24H", "7 Days", "30 Days", "365 Days"]
  const [active, setActive] = useState("24H")
  const [seed, setSeed] = useState(0)
  const [chartData, setChartData] = useState<{ time: string; value: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEmpty, setIsEmpty] = useState(false)

  const fetchExternalWalletData = async () => {
    try {
      setLoading(true)
      setError(null)
      setIsEmpty(false)

      const url = `${API_URL}/wallets/dashboard/external-wallet-total-assets`
      console.log("📡 Fetching external wallet data from:", url)

      const res = await axiosClient.get(url)

      const json = res.data
      console.log("✅ Fetched data:", json)

      if (json?.success && json?.data?.[0]?.values && json?.labels) {
        const labels: string[] = json.labels
        const values: number[] = json.data[0].values

        const formatted = labels.map((t, i) => ({
          time: new Date(t).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
          value: values[i] ?? 0,
        }))

        if (formatted.length === 0) {
          setIsEmpty(true)
        } else {
          setChartData(formatted)
        }
      } else {
        throw new Error("Unexpected response format")
      }
    } catch (err: any) {
      console.error("❌ Error fetching data:", err)
      setError(err.message || "Failed to fetch data")
      setChartData([])
    } finally {
      setLoading(false)
    }
  }

  // 🪄 Fetch khi component mount hoặc refresh
  useEffect(() => {
    fetchExternalWalletData()
  }, [seed])

  const data = useMemo(() => chartData, [chartData])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Money Flow Visualization</h3>
          <p className="text-sm text-gray-500 mt-1">Transaction flow from external wallets to system</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Tabs */}
          <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActive(t)}
                disabled={loading}
                className={`px-3 py-2 rounded-md text-xs font-semibold transition ${active === t
                  ? "bg-blue-600 text-white shadow-sm"
                  : loading
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            onClick={() => setSeed((s) => s + 1)}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition ${loading
              ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
          >
            <RefreshCw
              size={16}
              className={`${loading ? "animate-spin" : ""} transition-transform`}
            />
            <span>{loading ? "Loading..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative bg-gradient-to-b from-blue-50 to-white rounded-lg border border-gray-100 overflow-hidden">
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 backdrop-blur-sm z-10 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-sm font-medium text-gray-600">Loading chart data...</p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-72">
          {error && !loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">Unable to load chart</p>
                <p className="text-xs text-gray-500 mt-1">{error}</p>
              </div>
            </div>
          ) : isEmpty && !loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">No data available</p>
                <p className="text-xs text-gray-500 mt-1">Try selecting a different time period</p>
              </div>
            </div>
          ) : loading ? (
            <AnimatedChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e5e7eb" vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`}
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorFlow)"
                  dot={false}
                  isAnimationActive
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Footer info */}
      {data.length > 0 && !loading && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Highest</p>
            <p className="text-sm font-semibold text-gray-900">
              ${Math.max(...data.map((d) => d.value)).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Average</p>
            <p className="text-sm font-semibold text-gray-900">
              ${(data.reduce((a, c) => a + c.value, 0) / data.length).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Lowest</p>
            <p className="text-sm font-semibold text-gray-900">
              ${Math.min(...data.map((d) => d.value)).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}