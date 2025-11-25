"use client"
import React, { useState, useEffect } from 'react'
import { API_URL } from "@/utils/constants"
import axiosClient from "@/utils/axiosClient"
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { RefreshCw } from "lucide-react"
import TopStats from '@/components/transaction-analytics/TopStats'
import HistoryTable from '@/components/transaction-analytics/HistoryTable'

// Skeleton loader for TopStats
function TopStatsSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="flex items-end gap-2">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-3 bg-gray-200 rounded w-12"></div>
      </div>
    </div>
  )
}

// Skeleton loader for VolumeChart
function VolumeChartSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-96 bg-gray-200 rounded-lg"></div>
    </div>
  )
}

// Skeleton loader for HistoryTable
function HistoryTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>

      <div className="flex gap-4 pb-4 border-b border-gray-100 mb-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>

      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 py-4 border-b border-gray-100 last:border-b-0">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      ))}
    </div>
  )
}

// Skeleton loader for Header Section
function HeaderSectionSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm animate-pulse">
      <div className="mb-4">
        <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TopStatsSkeleton />
        <TopStatsSkeleton />
        <TopStatsSkeleton />
      </div>
    </div>
  )
}

// Volume Chart Component with Filters
function VolumeChart() {
  const timeRanges = ["Daily", "Weekly", "Monthly"]

  const [chartData, setChartData] = useState<any[]>([])
  const [pnlPercent, setPnlPercent] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [activeRange, setActiveRange] = useState("Daily")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [seed, setSeed] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Calculate date range based on selected time range
  const getDateRange = (rangeType: string) => {
    const end = new Date()
    const start = new Date()

    switch (rangeType) {
      case "Daily":
        start.setDate(start.getDate() - 1)
        break
      case "Weekly":
        start.setDate(start.getDate() - 7)
        break
      case "Monthly":
        start.setMonth(start.getMonth() - 1)
        break
      default:
        break
    }

    return {
      from: start.toISOString().split("T")[0],
      to: end.toISOString().split("T")[0],
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      let url = `${API_URL}/transaction/dashboard/transaction-total-assets`

      // Build query params
      const params = new URLSearchParams()
      if (fromDate) params.append("from_date", fromDate)
      if (toDate) params.append("to_date", toDate)

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      console.log("📡 Fetching total assets from:", url)

      const res = await axiosClient.get(url)

      console.log("✅ Fetched total assets:", res.data)
      const json = res.data

      if (json?.success && json?.data?.[0]?.values?.length) {
        const formatted = json.labels.map((label: string, i: number) => ({
          time: new Date(label).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          value: json.data[0].values[i],
        }))

        setChartData(formatted)
        setPnlPercent(json.pnl_percent || 0)
      }
    } catch (err: any) {
      console.error("❌ Error fetching total assets:", err.response?.data || err.message)
      setError(err.message || "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  // Fetch on component mount
  useEffect(() => {
    const { from, to } = getDateRange("Daily")
    setFromDate(from)
    setToDate(to)
  }, [])

  // Fetch when dates or seed changes
  useEffect(() => {
    if (fromDate && toDate) {
      fetchData()
    }
  }, [seed, fromDate, toDate])

  const handleRangeChange = (range: string) => {
    setActiveRange(range)
    const { from, to } = getDateRange(range)
    setFromDate(from)
    setToDate(to)
  }

  if (loading && chartData.length === 0) {
    return <VolumeChartSkeleton />
  }

  return (
    <div>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex justify-between items-center w-full sm:w-auto">
          <div className="text-sm text-gray-500">Total Assets Over Time</div>
          <div
            className={`text-sm font-medium ${pnlPercent > 0
              ? "text-green-600"
              : pnlPercent < 0
                ? "text-red-600"
                : "text-gray-500"
              }`}
          >
            {pnlPercent >= 0 ? "+" : ""}
            {pnlPercent.toFixed(2)}%
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Time Range Buttons */}
          <div className="hidden sm:flex items-center bg-gray-50 rounded-lg p-1 gap-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => handleRangeChange(range)}
                disabled={loading}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition disabled:opacity-50 ${activeRange === range
                  ? "text-gray-900 bg-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center space-x-2 text-xs">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              disabled={loading}
              className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              disabled={loading}
              className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => setSeed((s) => s + 1)}
            disabled={loading}
            className="flex items-center px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          ❌ {error}
        </div>
      )}

      {/* Chart */}
      <div style={{ width: "100%", height: 320 }}>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorLinePrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.16} />
                  <stop offset="40%" stopColor="#2563EB" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="1 1" stroke="#F1F5F9" />
              <XAxis
                dataKey="time"
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                axisLine={false}
                domain={["auto", "auto"]}
              />
              <Tooltip
                wrapperStyle={{ borderRadius: 8 }}
                contentStyle={{ borderRadius: 8 }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Volume"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563EB"
                strokeWidth={3}
                dot={false}
                strokeLinecap="round"
                fill="url(#colorLinePrimary)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default function TransactionAnalyticsAltPage({ loading = false }: { loading?: boolean }) {
  const [statsData, setStatsData] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        setLoadingStats(true);
        const res = await axiosClient.get(`${API_URL}/transaction/dashboard/volume-statistics`);
        if (res.data?.success) {
          setStatsData(res.data.data || []);
        } else {
          setStatsData([]);
        }
      } catch (err) {
        console.error("❌ Error fetching stats data:", err);
        setStatsData([]);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStatsData();
  }, []);

  return (
    <div className="p-6">
      {/* Transaction Volume Statistics Section */}
      {loading ? (
        <HeaderSectionSkeleton />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-800">Transaction Volume Statistics</h2>
            <div className="text-sm text-gray-400">Total volume by asset type - Last 24 hours</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {statsData.map((stat) => (
              <TopStats key={stat.asset_type} variant={stat.asset_type} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {/* Volume Chart Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {loading ? (
            <VolumeChartSkeleton />
          ) : (
            <VolumeChart />
          )}
        </div>

        {/* History Table Section */}
        <div>
          {loading ? <HistoryTableSkeleton /> : <HistoryTable />}
        </div>
      </div>
    </div>
  )
}