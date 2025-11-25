"use client";
import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import axiosClient from "@/utils/axiosClient";
import { API_URL } from "@/utils/constants";

interface ChartDataPoint {
  date: string;
  balance: number;
}

interface StatisticsChartProps {
  chartData: ChartDataPoint[];
  walletAddress: string;
}

export default function StatisticsChart({ chartData: initialChartData, walletAddress }: StatisticsChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>(initialChartData);
  const [interval, setInterval] = useState<"daily" | "weekly" | "monthly">("daily");
  const [fromDate, setFromDate] = useState("2025-11-24");
  const [toDate, setToDate] = useState("2025-11-25");
  const [loading, setLoading] = useState(false);

  const fetchFilteredData = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`${API_URL}/wallets/dashboard/statistic-total-assets/${walletAddress}`, {
        params: {
          from_date: fromDate,
          to_date: toDate,
          interval,
        },
      });

      const labels: string[] = res.data?.labels || [];
      const values: number[] = res.data?.data?.[0]?.values || [];

      const newChartData = labels.map((label, i) => ({
        date: label,
        balance: Number(values[i] ?? 0),
      }));

      setChartData(newChartData);
    } catch (err) {
      console.error("Error fetching filtered chart data:", err);
    } finally {
      setLoading(false);
    }
  };

  const tickFormatter = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return iso;
    }
  };

  const tooltipLabelFormatter = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  const tooltipValueFormatter = (value: number) => {
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Statistics</h3>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="hidden sm:flex items-center bg-gray-50 rounded-lg p-1 gap-1">
            {["daily", "weekly", "monthly"].map((int) => (
              <button
                key={int}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${interval === int ? "text-gray-900 bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setInterval(int as "daily" | "weekly" | "monthly")}
              >
                {int.charAt(0).toUpperCase() + int.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <input
              className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <span className="text-gray-400">-</span>
            <input
              className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <button
            className="flex items-center px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition"
            onClick={fetchFilteredData}
            disabled={loading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-refresh-cw"
              aria-hidden="true"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M8 16H3v5"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="h-80">
        {chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                tickFormatter={tickFormatter}
                minTickGap={20}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="#9CA3AF"
                tickFormatter={(v) =>
                  `$${Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                }
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={tooltipValueFormatter} labelFormatter={tooltipLabelFormatter} />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No statistical data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}