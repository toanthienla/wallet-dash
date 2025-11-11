"use client"
import React from 'react'

type Props = {
  title: string
  value: string | number
  desc?: string
  icon?: React.ReactNode
}

export default function MetricCard({ title, value, desc, icon }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
      {/* Icon + Title */}
      <div className="flex items-center space-x-2 mb-3">
        {icon && (
          <div className="w-5 h-5 flex items-center justify-center text-blue-600">
            {icon}
          </div>
        )}
        <div className="text-sm font-semibold text-gray-700">{title}</div>
      </div>

      {/* Value */}
      <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{value}</div>

      {/* Description */}
      {desc && (
        <div className="text-xs text-gray-500">{desc}</div>
      )}
    </div>
  )
}