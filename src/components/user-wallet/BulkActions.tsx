"use client"
import React from "react"
import { ArrowRight, Search, Download, CheckSquare } from "lucide-react"

export default function BulkActions() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Bulk Collection Actions</h3>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <button className="flex justify-between items-center text-left p-5 rounded-xl border border-gray-200 hover:shadow-sm transition bg-white">
          <div>
            <div className="text-sm font-medium text-gray-800">Collect Selected</div>
            <div className="text-xs text-gray-400 mt-1">3 wallets – $5,323,321</div>
          </div>
          <ArrowRight size={16} className="text-gray-400" />
        </button>

        <button className="flex justify-between items-center text-left p-5 rounded-xl border border-gray-200 hover:shadow-sm transition bg-white">
          <div>
            <div className="text-sm font-medium text-gray-800">Schedule Collection</div>
            <div className="text-xs text-gray-400 mt-1">Set Automatic timing</div>
          </div>
          <ArrowRight size={16} className="text-gray-400" />
        </button>

        <button className="flex justify-between items-center text-left p-5 rounded-xl border border-gray-200 hover:shadow-sm transition bg-white">
          <div>
            <div className="text-sm font-medium text-gray-800">Threshold Config</div>
            <div className="text-xs text-gray-400 mt-1">123123123123123</div>
          </div>
          <ArrowRight size={16} className="text-gray-400" />
        </button>
      </div>


    </div>




  )
}
