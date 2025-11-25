"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import axiosClient from "@/utils/axiosClient";
import { API_URL } from "@/utils/constants";

interface ChartDataPoint {
  date: string;
  value: number;
}

export default function VolumeChart() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [filter, setFilter] = useState({
    interval: "daily" as "daily" | "weekly" | "monthly",
    fromDate: getInitialFromDate("daily"),
    toDate: getTodayDate(),
  });
  const [loading, setLoading] = useState(false);

  // Helper functions to calculate dates
  function getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  function getInitialFromDate(interval: "daily" | "weekly" | "monthly"): string {
    const today = new Date();
    if (interval === "daily") {
      today.setDate(today.getDate() - 1);
    } else if (interval === "weekly") {
      today.setDate(today.getDate() - 7);
    } else if (interval === "monthly") {
      today.setMonth(today.getMonth() - 1);
    }
    return today.toISOString().split("T")[0];
  }

  // Update filter state when interval changes
  const handleIntervalChange = (newInterval: "daily" | "weekly" | "monthly") => {
    setFilter({
      ...filter,
      interval: newInterval,
      fromDate: getInitialFromDate(newInterval),
    });
  };

  // Fetch filtered data whenever filter changes
  useEffect(() => {
    const fetchFilteredData = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(`${API_URL}/transaction/dashboard/transaction-total-assets`, {
          params: {
            from_date: filter.fromDate,
            to_date: filter.toDate,
            interval: filter.interval,
          },
        });

        const labels: string[] = res.data?.labels || [];
        const values: number[] = res.data?.data?.[0]?.values || [];

        const newChartData = labels.map((label, i) => ({
          date: label,
          value: Number(values[i] ?? 0),
        }));

        setChartData(newChartData);
      } catch (err) {
        console.error("Error fetching filtered chart data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredData();
  }, [filter]);

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
        <h3 className="text-base font-semibold text-gray-900">Transaction Volume</h3>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="hidden sm:flex items-center bg-gray-50 rounded-lg p-1 gap-1">
            {["daily", "weekly", "monthly"].map((int) => (
              <button
                key={int}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${filter.interval === int ? "text-gray-900 bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => handleIntervalChange(int as "daily" | "weekly" | "monthly")}
              >
                {int.charAt(0).toUpperCase() + int.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <input
              className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="date"
              value={filter.fromDate}
              onChange={(e) => setFilter({ ...filter, fromDate: e.target.value })}
            />
            <span className="text-gray-400">-</span>
            <input
              className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="date"
              value={filter.toDate}
              onChange={(e) => setFilter({ ...filter, toDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="h-80">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="colorLinePrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.16} />
                  <stop offset="40%" stopColor="#2563EB" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="1 1" stroke="#F3F4F6" />
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
                dataKey="value"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
                fill="url(#colorLinePrimary)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No transaction data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}