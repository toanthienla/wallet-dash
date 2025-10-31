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
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex flex-col space-y-3">
        {/* icon + title nằm cùng hàng */}
        <div className="flex items-center space-x-2">
          {iconSrc && (
            <Image
              src={iconSrc}
              alt={`${title} icon`}
              width={20}
              height={20}
              className="object-contain"
            />
          )}
          <span className="text-sm text-black-600 font-medium">{title}</span>
        </div>

        {/* value nằm phía dưới */}
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  )
}
