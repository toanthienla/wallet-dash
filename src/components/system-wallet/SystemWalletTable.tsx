"use client";
import React, { useState } from "react";
import { Search } from "lucide-react";
import Image from "next/image";

type Wallet = {
  name: string;
  slug: string;
  current_balance: number;
  last_updated: string;
  status: string;
};

interface Props {
  wallets?: Wallet[];
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    NORMAL: "bg-[#E0F2FE] text-blue-700",
    WARNING: "bg-[#FEF3C7] text-yellow-700",
    ERROR: "bg-[#FFEDD5] text-orange-600",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${map[status] || "bg-gray-100 text-gray-700"
        }`}
    >
      {status}
    </span>
  );
}

export default function SystemWalletTable({ wallets = [] }: Props) {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const pages = Math.ceil(wallets.length / perPage);
  const visible = wallets.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            System Wallet Status
          </h3>
          <p className="text-sm text-gray-400">
            Real-time balance monitoring and threshold alerts
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-52 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Date Filter */}
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Image
              src="/images/icons/Calendar.svg"
              alt="Calendar Icon"
              width={16}
              height={16}
            />
            <span>05 Feb - 06 March</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="py-3 pr-6">Name</th>
              <th className="py-3 pr-6">Address</th>
              <th className="py-3 pr-6">Balance</th>
              <th className="py-3 pr-6">Last Updated</th>
              <th className="py-3 pr-6">Status</th>
              <th className="py-3 pr-6">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {visible.map((r, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="py-4 pr-6 font-medium">{r.name}</td>
                <td className="py-4 pr-6 text-gray-500 break-all">{r.slug}</td>
                <td className="py-4 pr-6 font-semibold">
                  {r.current_balance.toFixed(4)}
                </td>
                <td className="py-4 pr-6 text-gray-500">
                  {new Date(r.last_updated).toLocaleString()}
                </td>
                <td className="py-4 pr-6">
                  <StatusPill status={r.status} />
                </td>
                <td className="py-4 pr-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition">
                    View detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination — luôn hiển thị, kể cả khi chỉ có 1 trang */}
      <div className="flex items-center justify-between mt-6">
        {/* Previous */}
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm border transition ${page === 1
              ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
              : "text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
        >
          <span>←</span>
          <span>Previous</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {Array.from({ length: pages || 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              disabled={page === i + 1}
              className={`w-8 h-8 rounded-full text-sm font-medium transition ${page === i + 1
                  ? "bg-blue-600 text-white cursor-default"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Next */}
        <button
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          disabled={page === pages}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm border transition ${page === pages
              ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
              : "text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
        >
          <span>Next</span>
          <span>→</span>
        </button>
      </div>


    </div>
  );
}
