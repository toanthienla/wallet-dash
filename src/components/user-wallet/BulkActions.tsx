"use client"
import React, { useState } from "react"
import { ArrowRight, Download, Clock, Settings } from "lucide-react"

type BulkActionsProps = {
  onCollectSelected?: () => void
  onSchedule?: () => void
  onConfig?: () => void
}

export default function BulkActions({
  onCollectSelected,
  onSchedule,
  onConfig,
}: BulkActionsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCollect = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      onCollectSelected?.()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900">Bulk Collection Actions</h3>
        <p className="text-sm text-gray-500 mt-1">Manage multiple wallets and collections</p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleCollect}
          disabled={isLoading}
          className="flex justify-between items-center text-left p-5 rounded-xl border border-gray-200 hover:shadow-md transition bg-white hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div>
            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition">
              Collect Selected
            </div>
            <div className="text-xs text-gray-500 mt-2">3 wallets – $5,323,321</div>
          </div>
          <div className="flex-shrink-0">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            ) : (
              <ArrowRight size={18} className="text-gray-400 group-hover:text-blue-600 transition" />
            )}
          </div>
        </button>

        <button
          onClick={onSchedule}
          className="flex justify-between items-center text-left p-5 rounded-xl border border-gray-200 hover:shadow-md transition bg-white hover:border-green-300 group"
        >
          <div>
            <div className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition flex items-center gap-2">
              <Clock size={16} />
              Schedule Collection
            </div>
            <div className="text-xs text-gray-500 mt-2">Set automatic timing</div>
          </div>
          <ArrowRight size={18} className="text-gray-400 group-hover:text-green-600 transition" />
        </button>

        <button
          onClick={onConfig}
          className="flex justify-between items-center text-left p-5 rounded-xl border border-gray-200 hover:shadow-md transition bg-white hover:border-orange-300 group"
        >
          <div>
            <div className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition flex items-center gap-2">
              <Settings size={16} />
              Threshold Config
            </div>
            <div className="text-xs text-gray-500 mt-2">Manage collection thresholds</div>
          </div>
          <ArrowRight size={18} className="text-gray-400 group-hover:text-orange-600 transition" />
        </button>
      </div>

      {/* Info bar */}
      <div className="mt-5 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700">
          <span className="font-semibold">💡 Tip:</span> Select wallets in the table above to enable bulk collection actions.
        </p>
      </div>
    </div>
  )
}