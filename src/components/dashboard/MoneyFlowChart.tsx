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
import axiosClient from "@/utils/axiosClient";

export default function MoneyFlowChart() {
  const tabs = ["24H", "7 Days", "30 Days", "365 Days"]
  const [active, setActive] = useState("24H")
  const [seed, setSeed] = useState(0)
  const [chartData, setChartData] = useState<{ time: string; value: number }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchExternalWalletData = async () => {
    try {
      setLoading(true)
      setError(null)

      const url = `${API_URL}/wallets/dashboard/external-wallet-total-assets`
      console.log("📡 Fetching external wallet data from:", url)

      // 🔥 Gọi API bằng axios instance (đã có base config)
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

  // 🪄 Fetch khi component mount hoặc refresh
  useEffect(() => {
    fetchExternalWalletData()
  }, [seed])

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
                onClick={() => setActive(t)}
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
            className="flex items-center space-x-1 text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-md text-xs font-medium"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>{loading ? "Loading..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        {error ? (
          <div className="flex items-center justify-center h-full text-red-500 text-sm">
            {error}
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
