"use client";
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface ChartDataPoint {
  // Keep ISO timestamp string from the API (e.g. "2025-11-18T01:34:33.934Z")
  date: string;
  balance: number;
}

interface StatisticsChartProps {
  chartData: ChartDataPoint[];
}

export default function StatisticsChart({ chartData }: StatisticsChartProps) {
  // Format tick for X axis. If points span multiple days show date+time otherwise show time.
  const tickFormatter = (iso: string) => {
    try {
      const d = new Date(iso);
      if (!chartData || chartData.length === 0) return "";
      const first = new Date(chartData[0].date);
      const last = new Date(chartData[chartData.length - 1].date);
      const sameDay =
        first.getFullYear() === last.getFullYear() &&
        first.getMonth() === last.getMonth() &&
        first.getDate() === last.getDate();

      if (sameDay) {
        return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      } else {
        return d.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
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
    if (typeof value !== "number") return String(value);
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Statistics</h3>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
            {["Daily", "Weekly", "Monthly"].map((label, i) => (
              <button
                key={i}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition ${label === "Daily"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button className="flex items-center px-3 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-400 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            05 Feb – 06 March
          </button>

          <div className="flex items-center gap-6">
            <div className="flex flex-col text-right">
              <p className="text-sm text-gray-500">Avg. Deposit</p>
              <p className="text-base font-semibold text-gray-900">$212,142.12</p>
            </div>
            <div className="flex flex-col text-right">
              <p className="text-sm text-gray-500">Avg. Interest</p>
              <p className="text-base font-semibold text-gray-900">$30,321.23</p>
            </div>
          </div>
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
                  `$${Number(v).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}`
                }
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