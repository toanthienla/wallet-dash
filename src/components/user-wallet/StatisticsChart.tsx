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
  date: string;
  balance: number;
}

interface StatisticsChartProps {
  chartData: ChartDataPoint[];
}

export default function StatisticsChart({ chartData }: StatisticsChartProps) {
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
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={false}
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