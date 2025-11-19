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
  // ISO timestamp string from the API (e.g. "2025-11-18T01:34:33.934Z")
  date: string;
  balance: number;
}

interface StatisticsChartProps {
  chartData: ChartDataPoint[];
}

export default function StatisticsChart({ chartData }: StatisticsChartProps) {
  // Format X axis ticks: time only if all points are on same day, otherwise show date + time.
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
      }
      return d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
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
      maximumFractionDigits: 6,
    })}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Statistics</h3>
        {/* Minimal header as requested */}
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