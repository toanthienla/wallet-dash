import React from 'react'

type StatCardProps = {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
}

export default function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex items-start space-x-4">
     <div className="flex items-center justify-center">
  {icon}
</div>

      <div className="flex-1">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-semibold text-black mt-1">{value}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-2">{subtitle}</div>}
      </div>
    </div>
  )
}
