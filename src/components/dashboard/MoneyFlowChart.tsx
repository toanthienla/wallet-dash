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

export default function MoneyFlowChart() {
  const tabs = ["24H", "7 Days", "30 Days", "365 Days"]
  const [active, setActive] = useState("24H")
  const [seed, setSeed] = useState(0)
  const [chartData, setChartData] = useState<{ time: string; value: number }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  // Calculate date range based on selected tab
  const getDateRange = (tabName: string) => {
    const end = new Date()
    const start = new Date()

    switch (tabName) {
      case "24H":
        start.setHours(start.getHours() - 24)
        break
      case "7 Days":
        start.setDate(start.getDate() - 7)
        break
      case "30 Days":
        start.setDate(start.getDate() - 30)
        break
      case "365 Days":
        start.setFullYear(start.getFullYear() - 1)
        break
      default:
        break
    }

    return {
      from: start.toISOString().split("T")[0],
      to: end.toISOString().split("T")[0],
    }
  }

  const fetchExternalWalletData = async () => {
    try {
      setLoading(true)
      setError(null)

      let url = `${API_URL}/wallets/dashboard/external-wallet-total-assets`

      // Build query params
      const params = new URLSearchParams()
      if (fromDate) params.append("from_date", fromDate)
      if (toDate) params.append("to_date", toDate)

      if (params.toString()) {
        url += `?${params.toString()}`
      }

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

        setChartData(formatted)
      } else {
        throw new Error("Unexpected response format")
      }
    } catch (err: any) {
      console.error("❌ Error fetching data:", err)
      setError(err.message || "Fetch failed")
    } finally {
      setLoading(false)
    }
  }

  // Fetch when component mounts or refresh button is clicked
  useEffect(() => {
    fetchExternalWalletData()
  }, [seed, fromDate, toDate])

  // Initialize dates on component mount
  useEffect(() => {
    const { from, to } = getDateRange("24H")
    setFromDate(from)
    setToDate(to)
  }, [])

  const handleTabChange = (tab: string) => {
    setActive(tab)
    const { from, to } = getDateRange(tab)
    setFromDate(from)
    setToDate(to)
  }

  const data = useMemo(() => chartData, [chartData])

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Money Flow Visualization</h3>
          <p className="text-xs text-gray-500">Transaction flow from external wallets to system</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-gray-50 rounded-lg p-0.5">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => handleTabChange(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${active === t
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSeed((s) => s + 1)}
            disabled={loading}
            className="flex items-center space-x-1 text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-md text-xs font-medium disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>{loading ? "Loading..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <label className="text-xs font-medium text-gray-700 whitespace-nowrap">From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-xs font-medium text-gray-700 whitespace-nowrap">To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setSeed((s) => s + 1)}
          disabled={loading}
          className="ml-auto px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          Apply Filter
        </button>
      </div>

      {/* Chart */}
      <div className="h-72">
        {error ? (
          <div className="flex items-center justify-center h-full text-red-500 text-sm">
            ❌ {error}
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${(v * 1000).toFixed(0)}`}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Total Assets"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2563EB"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorFlow)"
                dot={false}
                isAnimationActive
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>


    </div>
  )
}