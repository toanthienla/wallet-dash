"use client";

import React, { useEffect, useState } from "react";
import { API_URL } from "@/utils/constants";
import axiosClient from "@/utils/axiosClient";

import MetricCard from "@/components/transaction-queue/MetricCard";
import TransactionQueueTable from "@/components/transaction-queue/TransactionQueueTable";
import { Search } from "lucide-react";

export default function TransactionQueuePage() {
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
  });

  const [routingKeys, setRoutingKeys] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `${API_URL}/transaction/dashboard/queues`;
        console.log("📡 Fetching transaction queue data from:", url);

        // axios call
        const res = await axiosClient.get(url, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("✅ Transaction Queue Data:", res.data);

        const total = res.data?.data?.total_statistic?.totalStats || {};
        const routing = res.data?.data?.total_statistic?.routingKeys || {};

        setStats({
          pending: total.pending ?? 0,
          processing: total.processing ?? 0,
          completed: total.completed ?? 0,
          cancelled: total.cancelled ?? 0,
        });

        setRoutingKeys(routing);
      } catch (err: any) {
        console.error(" Error fetching transaction queue data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <main className="flex-1 p-6 lg:p-8">
      <div className="max-w-full">
        {/* === Metrics === */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <MetricCard title="Pending" value={stats.pending.toString()} iconSrc="/images/icons/TotalW.svg" />
          <MetricCard title="Processing" value={stats.processing.toString()} iconSrc="/images/icons/Critical.svg" />
          <MetricCard title="Completed" value={stats.completed.toString()} iconSrc="/images/icons/Critical.svg" />
          <MetricCard title="Cancelled" value={stats.cancelled.toString()} iconSrc="/images/icons/Last.svg" />
        </div>

        {/* === Search Bar === */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 rounded-lg px-2 py-1"
            />
          </div>
        </div>

        {/* === Data Table === */}
        <TransactionQueueTable />
      </div>
    </main>
  );
}
