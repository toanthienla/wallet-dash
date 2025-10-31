"use client"
import React from 'react'
import { Users, PlusCircle, Settings, Download } from 'lucide-react'

export default function BulkActions() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-md font-semibold text-gray-900">Bulk Collection Actions</h4>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg">
            <Users size={16} />
            <span className="text-sm">Collect Selected</span>
          </button>
          <button className="flex items-center space-x-2 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg">
            <PlusCircle size={16} />
            <span className="text-sm">Schedule Collection</span>
          </button>
          <button className="flex items-center space-x-2 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg">
            <Settings size={16} />
            <span className="text-sm">Threshold Config</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input placeholder="Search wallets..." className="py-2 px-3 border border-gray-200 rounded-lg text-sm" />
          <button className="px-3 py-2 bg-gray-100 rounded-lg text-sm">Select All High Balance</button>
        </div>
        <div>
          <button className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg">
            <Download size={16} />
            <span className="text-sm">Export List</span>
          </button>
        </div>
      </div>
    </div>
  )
}
