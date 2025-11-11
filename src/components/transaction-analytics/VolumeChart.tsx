"use client"

import React, { useEffect, useState } from "react"
import { API_URL } from "@/utils/constants";
import axiosClient from "@/utils/axiosClient";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export default function VolumeChart() {
  const [chartData, setChartData] = useState<any[]>([])
  const [pnlPercent, setPnlPercent] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `${API_URL}/transaction/dashboard/transaction-total-assets`
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
        }
      } catch (err: any) {
        console.error("❌ Error fetching total assets:", err.response?.data || err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading chart...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
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
          {pnlPercent}%
        </div>
      </div>

      <div style={{ width: "100%", height: 320 }}>
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
      </div>
    </div>
  )
}
