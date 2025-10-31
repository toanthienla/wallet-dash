"use client"
import React from 'react'
import Image from 'next/image'

type Props = {
  title: string
  value: string | number
  iconSrc?: string
}

export default function MetricCard({ title, value, iconSrc }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 hover:shadow-lg transition duration-150">
      <div className="flex items-center space-x-3">
        {iconSrc && (
          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
            <Image src={iconSrc} alt={`${title} icon`} width={20} height={20} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">{title}</div>
          <div className="text-xl md:text-2xl  text-gray-900 mt-2">{value}</div>
        </div>
      </div>
    </div>
  )
}
