"use client";

import React, { useEffect, useState } from "react";
import { API_URL } from "@/utils/constants";
import axiosClient from "@/utils/axiosClient";
import { Search } from "lucide-react";

type Row = {
  id: string;
  datetime: string;
  user: string;
  type: "Deposit" | "Withdraw" | "Redeem";
  amount: string;
  asset: string;
  status: "Processing" | "Completed" | "Failed";
};

type PaginationState = {
  page: number
  pages: number
  has_next: boolean
  has_prev: boolean
  number_records: number
}

type FilterState = {
  transaction_id: string;
  wallet_address: string;
  from_date: string;
  to_date: string;
  min_range: string;
  max_range: string;
}

// ... (Status component remains the same)
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
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  // State for pagination
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pages: 1,
    has_next: false,
    has_prev: false,
    number_records: 0
  });
  const take = 10;

  // State for filters
  const [filters, setFilters] = useState<FilterState>({
    transaction_id: '',
    wallet_address: '',
    from_date: '',
    to_date: '',
    min_range: '',
    max_range: ''
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: pagination.page,
          take,
          ...filters
        };
        // Remove empty params to keep URL clean
        Object.keys(params).forEach(key => (params[key] === '' || params[key] === null) && delete params[key]);

        const res = await axiosClient.get(`${API_URL}/transaction/dashboard/list`, { params });
        const data = res.data.data;

        const newRows: Row[] = (data?.transactions || []).map((tx: any) => ({
          id: String(tx.id),
          datetime: new Date(tx.date_created).toISOString(),
          user: tx.user_id ?? tx.user_created ?? "unknown",
          type: tx.transaction_type?.name === "Receive" ? "Deposit" : tx.transaction_type?.name === "Transfer" ? "Withdraw" : "Redeem",
          amount: tx.amount,
          asset: tx.currency?.name?.toUpperCase() || "Unknown",
          status: tx.transaction_status === "success" ? "Completed" : tx.transaction_status === "processing" ? "Processing" : "Failed",
        }));

        setRows(newRows);

        if (data.paginated) {
          setPagination({
            page: data.paginated.page || 1,
            pages: data.paginated.pages || 1,
            has_next: data.paginated.has_next || false,
            has_prev: data.paginated.has_prev || false,
            number_records: data.paginated.number_records || 0
          });
        }
      } catch (error) {
        console.error("❌ Fetch transactions failed:", error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    }

    const handler = setTimeout(() => {
      fetchTransactions();
    }, 500); // Debounce filter changes

    return () => clearTimeout(handler);

  }, [pagination.page, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
  };

  const setPage = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }

  return (
    <div>
      <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4">
        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <input name="transaction_id" value={filters.transaction_id} onChange={handleFilterChange} placeholder="Transaction ID" className="px-4 py-2 border rounded-lg text-sm" />
          <input name="wallet_address" value={filters.wallet_address} onChange={handleFilterChange} placeholder="Wallet Address" className="px-4 py-2 border rounded-lg text-sm" />
          <input name="from_date" type="date" value={filters.from_date} onChange={handleFilterChange} className="px-4 py-2 border rounded-lg text-sm text-gray-500" />
          <input name="to_date" type="date" value={filters.to_date} onChange={handleFilterChange} className="px-4 py-2 border rounded-lg text-sm text-gray-500" />
          <input name="min_range" type="number" value={filters.min_range} onChange={handleFilterChange} placeholder="Min Amount" className="px-4 py-2 border rounded-lg text-sm" />
          <input name="max_range" type="number" value={filters.max_range} onChange={handleFilterChange} placeholder="Max Amount" className="px-4 py-2 border rounded-lg text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading transactions...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-gray-400 bg-white border-b">
                <th className="py-3 px-6 font-medium">Date/time</th>
                <th className="py-3 px-6 font-medium">Transaction ID</th>
                <th className="py-3 px-6 font-medium">User ID</th>
                <th className="py-3 px-6 font-medium">Type</th>
                <th className="py-3 px-6 font-medium">Amount</th>
                <th className="py-3 px-6 font-medium">Asset Type</th>
                <th className="py-3 px-6 font-medium">Status</th>
                <th className="py-3 px-6 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {rows.map((r, idx) => (
                <tr key={r.id + idx} className="border-b hover:bg-gray-50">
                  <td className="py-5 px-6">{new Date(r.datetime).toLocaleString()}</td>
                  <td className="py-5 px-6 font-mono">{r.id}</td>
                  <td className="py-5 px-6 break-words">{r.user}</td>
                  <td className="py-5 px-6"><span className={`inline-block px-3 py-1 rounded-full ${r.type === "Deposit" ? "bg-green-50 text-green-600" : r.type === "Withdraw" ? "bg-red-50 text-red-600" : "bg-pink-50 text-pink-600"}`}>{r.type}</span></td>
                  <td className="py-5 px-6 font-semibold">{r.amount}</td>
                  <td className="py-5 px-6"><span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600">{r.asset}</span></td>
                  <td className="py-5 px-6"><Status s={r.status} /></td>
                  <td className="py-5 px-6"><button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">View detail</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <button onClick={() => setPage(pagination.page - 1)} disabled={!pagination.has_prev || loading} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition disabled:text-gray-400 disabled:cursor-not-allowed`}><span>←</span> Previous</button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: pagination.pages }).map((_, i) => (<button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-full text-sm font-medium transition ${pagination.page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}>{i + 1}</button>))}
        </div>
        <button onClick={() => setPage(pagination.page + 1)} disabled={!pagination.has_next || loading} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition disabled:text-gray-400 disabled:cursor-not-allowed`}>Next <span>→</span></button>
      </div>
    </div>
  );
}