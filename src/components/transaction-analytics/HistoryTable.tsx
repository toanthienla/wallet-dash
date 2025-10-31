"use client";

import React, { useEffect, useMemo, useState } from "react";

import { API_URL } from "@/utils/constants";
import axiosClient from "@/utils/axiosClient";

type Row = {
  id: string;
  datetime: string;
  user: string;
  type: "Deposit" | "Withdraw" | "Redeem";
  amount: string;
  asset: string;
  status: "Processing" | "Completed" | "Failed";
};

// ✅ Dùng axios thay fetch
async function fetchTransactions(page = 1): Promise<Row[]> {
  try {
    const res = await axiosClient.get(
      `${API_URL}/transaction/dashboard/0xe39a611233c237ea006E5406dc1DEAce1ED38368`,
      {
        params: { page, take: 10 },
        withCredentials: true, // 👈 gửi cookie/token theo session
      }
    );

    const data = res.data;

    // ✅ Map dữ liệu API → format Row
    const rows: Row[] = (data?.data?.transactions || []).map((tx: any) => ({
      id: String(tx.id),
      // ✅ FIX hydration: dùng ISO string (SSR và client giống nhau)
      datetime: new Date(tx.date_created).toISOString(),
      user: tx.user_id ?? tx.user_created ?? "unknown",
      type:
        tx.transaction_type?.name === "Receive"
          ? "Deposit"
          : tx.transaction_type?.name === "Transfer"
            ? "Withdraw"
            : "Redeem",
      amount: tx.amount,
      // ✅ FIX 1: Asset Type — dùng currency_data thay vì asset_type
      asset: tx.currency_data?.name?.toUpperCase() || "Unknown",
      // ✅ FIX 2: Status — map đúng với dữ liệu thật (success/processing/failed)
      status:
        tx.transaction_status === "success"
          ? "Completed"
          : tx.transaction_status === "processing"
            ? "Processing"
            : "Failed",
    }));

    return rows;
  } catch (error) {
    console.error("❌ Fetch transactions failed:", error);
    throw error;
  }
}

function Status({ s }: { s: Row["status"] }) {
  const map: Record<Row["status"], string> = {
    Processing: "bg-blue-50 text-blue-700",
    Completed: "bg-green-50 text-green-700",
    Failed: "bg-red-50 text-red-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${map[s]}`}>{s}</span>
  );
}

export default function HistoryTable() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const perPage = 10;

  useEffect(() => {
    setLoading(true);
    fetchTransactions(page)
      .then(setRows)
      .catch((err) => console.error("Transaction fetch error:", err))
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = useMemo(() => {
    if (!query) return rows;
    return rows.filter((r) => r.id.includes(query) || r.user.includes(query));
  }, [query, rows]);

  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-800">Transaction History</h3>
            <div className="text-sm text-gray-400">Completed transaction records</div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm w-80 shadow-sm"
              />
              <img
                src="/images/icons/Search.svg"
                alt="Search icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              />
            </div>
            <button className="flex items-center px-3 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50">
              <img src="/images/icons/Calendar.svg" alt="calendar" width={16} height={16} />
              <span className="ml-2">05 Feb - 06 March</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading transactions...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-gray-400 bg-white border-b">
                <th className="py-3 px-6 font-medium text-left">Date/time</th>
                <th className="py-3 px-6 font-medium text-left">Transaction ID</th>
                <th className="py-3 px-6 font-medium text-left">User ID</th>
                <th className="py-3 px-6 font-medium text-left">Type</th>
                <th className="py-3 px-6 font-medium text-left">Amount</th>
                <th className="py-3 px-6 font-medium text-left">Asset Type</th>
                <th className="py-3 px-6 font-medium text-left">Status</th>
                <th className="py-3 px-6 font-medium text-left">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {visible.map((r, idx) => (
                <tr key={r.id + idx} className="border-b hover:bg-gray-50">
                  {/* ✅ FIX hydration: render datetime bằng formatter client-side */}
                  <td className="py-5 px-6 text-sm text-gray-600">
                    {new Intl.DateTimeFormat("en-GB", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(r.datetime))}
                  </td>

                  <td className="py-5 px-6 font-mono text-sm text-gray-800">{r.id}</td>
                  <td className="py-5 px-6 text-sm text-gray-700 break-words">{r.user}</td>
                  <td className="py-5 px-6 text-sm">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm ${r.type === "Deposit"
                          ? "bg-green-50 text-green-600"
                          : r.type === "Withdraw"
                            ? "bg-red-50 text-red-600"
                            : "bg-pink-50 text-pink-600"
                        }`}
                    >
                      {r.type}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-sm font-semibold text-gray-800">{r.amount}</td>
                  <td className="py-5 px-6 text-sm">
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm">
                      {r.asset}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-sm">
                    <Status s={r.status} />
                  </td>
                  <td className="py-5 px-6">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                      View detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200"
        >
          <span>←</span>
          <span>Previous</span>
        </button>

        <button
          onClick={() => setPage((p) => p + 1)}
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200"
        >
          <span>Next</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
