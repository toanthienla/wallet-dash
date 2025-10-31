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
import { RefreshCw, AlertCircle } from "lucide-react"
import { API_URL } from "@/utils/constants"
import axiosClient from "@/utils/axiosClient"

interface ChartDataPoint {
  time: string
  value: number
}

export default function MoneyFlowChart() {
  const tabs = ["24H", "7 Days", "30 Days", "365 Days"]
  const [active, setActive] = useState("24H")
  const [seed, setSeed] = useState(0)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchExternalWalletData = async () => {
    try {
      setLoading(true)
      setError(null)

      const url = `${API_URL}/wallets/dashboard/external-wallet-total-assets`
      console.log("📡 Fetching external wallet data from:", url)
      console.log("🔗 Origin:", window.location.origin)

      // Call API with axios instance (already configured with auth headers)
      const res = await axiosClient.get(url)

      const json = res.data
      console.log("✅ Fetched data successfully:", {
        success: json?.success,
        dataLength: json?.data?.[0]?.values?.length,
        labelsLength: json?.labels?.length,
      })

      if (json?.success && json?.data?.[0]?.values && json?.labels) {
        const labels: string[] = json.labels
        const values: number[] = json.data[0].values

        const formatted: ChartDataPoint[] = labels.map((t, i) => ({
          time: new Date(t).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
          value: values[i] ?? 0,
        }))

        setChartData(formatted)
        setRetryCount(0) // Reset retry count on success
      } else {
        throw new Error(
          `Unexpected response format: ${JSON.stringify({
            hasSuccess: !!json?.success,
            hasData: !!json?.data?.[0]?.values,
            hasLabels: !!json?.labels,
          })}`
        )
      }
    } catch (err: any) {
      console.error("❌ Error fetching data:", {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        statusText: err.response?.statusText,
      })

      // Build user-friendly error message
      let errorMessage = "Failed to load wallet data"

      if (err.response?.status === 502) {
        errorMessage = "Gateway error - the server is temporarily unavailable. Retrying..."
      } else if (err.response?.status === 503) {
        errorMessage = "Service temporarily unavailable. Please try again shortly."
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = "Authentication failed. Please log in again."
      } else if (err.code === "ECONNABORTED") {
        errorMessage = "Request timeout. The server took too long to respond."
      } else if (err.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your connection."
      } else if (err.message === "Unexpected response format") {
        errorMessage = err.message
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Fetch when component mounts or refresh is triggered
  useEffect(() => {
    fetchExternalWalletData()
  }, [seed])

  const data = useMemo(() => chartData, [chartData])

  const handleRetry = () => {
    setRetryCount((c) => c + 1)
    setSeed((s) => s + 1)
  }

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
            onClick={handleRetry}
            disabled={loading}
            className="flex items-center space-x-1 text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 px-3 py-1.5 rounded-md text-xs font-medium transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>{loading ? "Loading..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-red-700 font-medium">{error}</p>
            {retryCount > 0 && (
              <p className="text-xs text-red-600 mt-1">Retry attempt: {retryCount}</p>
            )}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-72">
        {error && chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <AlertCircle size={32} className="text-red-400 mb-2" />
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={handleRetry}
              disabled={loading}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-xs font-medium rounded-md transition"
            >
              {loading ? "Retrying..." : "Retry"}
            </button>
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