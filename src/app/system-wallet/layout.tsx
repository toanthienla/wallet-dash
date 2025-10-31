"use client"
import React from 'react'
import AppHeader from '@/layout/AppHeader'
import AppSidebar from '@/layout/AppSidebar'

export default function SystemWalletLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AppSidebar />
        <div className="flex-1 min-h-screen">
          <AppHeader />
          <div className="px-8 py-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
