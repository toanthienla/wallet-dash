"use client"
import React from 'react'
import TopStats from '@/components/transaction-analytics/TopStats'
import VolumeChart from '@/components/transaction-analytics/VolumeChart'
import HistoryTable from '@/components/transaction-analytics/HistoryTable'
export default function TransactionAnalyticsAltPage() {
  return (
    <div className="p-6">


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

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Transaction Volume Chart</h2>
            <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center bg-gray-50 rounded-lg p-1">
  <button className="px-3 py-1.5 text-sm font-semibold text-gray-900 bg-white rounded-md shadow-sm">
    Daily
  </button>
  <button className="px-3 py-1.5 text-sm font-medium text-gray-500 rounded-md hover:text-gray-700">
    Monthly
  </button>
  <button className="px-3 py-1.5 text-sm font-medium text-gray-500 rounded-md hover:text-gray-700">
    Weekly
  </button>
</div>

              <div>
                <button className="flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  <img src="/images/icons/Calendar.svg" alt="calendar" width={16} height={16} />
                  <span className="ml-2">05 Feb - 06 March</span>
                </button>
              </div>
            </div>
          </div>
          <VolumeChart />
        </div>

        <div>
          <HistoryTable />
        </div>
      </div>
    </div>
  )
}
