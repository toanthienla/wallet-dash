"use client";

import React, { useEffect, useState } from "react";
import { API_URL } from "@/utils/constants";
import axiosClient from "@/utils/axiosClient";

import MetricCard from "@/components/transaction-queue/MetricCard";
import TransactionQueueTable from "@/components/transaction-queue/TransactionQueueTable";
import { Search } from "lucide-react";

// Skeleton loader for metric card
function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-lg ml-4 flex-shrink-0"></div>
      </div>
    </div>
  );
}

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
        const res = await axiosClient.get(url);

        console.log("Transaction Queue Data:", res.data);

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

  return (
    <main className="flex-1 p-6 lg:p-8">
      <div className="max-w-full">
        {/* === Metrics === */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {loading ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            <>
              <MetricCard title="Pending" value={stats.pending.toString()} iconSrc="/images/icons/TotalW.svg" />
              <MetricCard title="Processing" value={stats.processing.toString()} iconSrc="/images/icons/Critical.svg" />
              <MetricCard title="Completed" value={stats.completed.toString()} iconSrc="/images/icons/Critical.svg" />
              <MetricCard title="Cancelled" value={stats.cancelled.toString()} iconSrc="/images/icons/Last.svg" />
            </>
          )}
        </div>

        {/* === Data Table === */}
        <TransactionQueueTable loading={loading} />
      </div>
    </main>
  );
}