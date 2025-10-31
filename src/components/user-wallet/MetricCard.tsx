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
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
  {/* icon + title (ngang hàng) */}
  <div className="flex items-center space-x-2">
    {icon && <div className="flex-shrink-0">{icon}</div>}
    <div className="text-sm font-semibold text-gray-700">{title}</div>
  </div>

  {/* value */}
  <div className="text-2xl font-semibold text-black mt-3">{value}</div>

  {/* desc */}
  {desc && <div className="text-xs text-black-400 mt-1">{desc}</div>}
</div>

  )
}
