"use client"
import React, { useState } from 'react'
import TopStats from '@/components/transaction-analytics/TopStats'
import VolumeChart from '@/components/transaction-analytics/VolumeChart'
import HistoryTable from '@/components/transaction-analytics/HistoryTable'

// Skeleton loader for TopStats
function TopStatsSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="flex items-end gap-2">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-3 bg-gray-200 rounded w-12"></div>
      </div>
    </div>
  )
}

// Skeleton loader for VolumeChart
function VolumeChartSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-96 bg-gray-200 rounded-lg"></div>
    </div>
  )
}

// Skeleton loader for HistoryTable
function HistoryTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>

      <div className="flex gap-4 pb-4 border-b border-gray-100 mb-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>

      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 py-4 border-b border-gray-100 last:border-b-0">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      ))}
    </div>
  )
}

// Skeleton loader for Header Section
function HeaderSectionSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm animate-pulse">
      <div className="mb-4">
        <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TopStatsSkeleton />
        <TopStatsSkeleton />
        <TopStatsSkeleton />
      </div>
    </div>
  )
}

// Skeleton loader for Chart Section Header
function ChartSectionHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48"></div>
      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center gap-1">
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-40"></div>
      </div>
    </div>
  )
}

export default function TransactionAnalyticsAltPage({ loading = false }: { loading?: boolean }) {
  return (
    <div className="p-6">
      {/* Transaction Volume Statistics Section */}
      {loading ? (
        <HeaderSectionSkeleton />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-800">Transaction Volume Statistics</h2>
            <div className="text-sm text-gray-400">Total volume by asset type - Last 24 hours</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <TopStats variant="fiat" />
            <TopStats variant="crypto" />
            <TopStats variant="points" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {/* Volume Chart Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {loading ? (
            <>
              <ChartSectionHeaderSkeleton />
              <VolumeChartSkeleton />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-800">Transaction Volume Chart</h2>
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex items-center bg-gray-50 rounded-lg p-1">
                    <button disabled={loading} className="px-3 py-1.5 text-sm font-semibold text-gray-900 bg-white rounded-md shadow-sm disabled:opacity-50 transition">
                      Daily
                    </button>
                    <button disabled={loading} className="px-3 py-1.5 text-sm font-medium text-gray-500 rounded-md hover:text-gray-700 disabled:opacity-50 transition">
                      Monthly
                    </button>
                    <button disabled={loading} className="px-3 py-1.5 text-sm font-medium text-gray-500 rounded-md hover:text-gray-700 disabled:opacity-50 transition">
                      Weekly
                    </button>
                  </div>

                  <div>
                    <button disabled={loading} className="flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
                      <img src="/images/icons/Calendar.svg" alt="calendar" width={16} height={16} />
                      <span className="ml-2">05 Feb - 06 March</span>
                    </button>
                  </div>
                </div>
              </div>
              <VolumeChart />
            </>
          )}
        </div>

        {/* History Table Section */}
        <div>
          {loading ? <HistoryTableSkeleton /> : <HistoryTable />}
        </div>
      </div>
    </div>
  )
}