"use client"

import React, { useEffect, useState } from "react"
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

export default function VolumeChart() {
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
        // ✅ Chuẩn hóa dữ liệu để hiển thị trên biểu đồ
        const formatted = json.labels.map((label: string, i: number) => ({
          time: new Date(label).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          value: json.data[0].values[i],
        }))

        setChartData(formatted)
        setPnlPercent(json.pnl_percent || 0)
      } else {
        throw new Error("Unexpected response format")
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

  if (loading && chartData.length === 0) return <div className="p-4 text-gray-500">Loading chart...</div>

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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