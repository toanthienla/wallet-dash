"use client";

import React, { useEffect, useState } from "react";
import { API_URL } from "@/utils/constants";
import axiosClient from "@/utils/axiosClient";

import MetricCard from "@/components/transaction-queue/MetricCard";
import TransactionQueueTable from "@/components/transaction-queue/TransactionQueueTable";

type Message = {
  msg_id: string;
  msg_started_at: string;
  msg_status: "pending" | "processing" | "completed" | "cancelled";
  id: number;
  date_created: string;
  transaction_type: string;
  amount: number;
  amount_assets: string;
  currency_data: {
    id: number;
    name: string;
    slug: string;
    full_name: string;
    usd_rate: string;
    link: string;
  };
  asset_type: string;
};

interface TotalStats {
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    messages: Message[];
    total_statistic: {
      routingKeys: Record<string, any>;
      totalStats: TotalStats;
    };
    paginated: {
      keyword: string;
      page: number;
      take: number;
      sort: string;
      sorted: string;
      from_date: string;
      to_date: string;
      number_records: number;
      pages: number;
      has_prev: boolean;
      has_next: boolean;
    };
  };
  timestamp: string;
}

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
  const [stats, setStats] = useState<TotalStats>({
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `${API_URL}/transaction/dashboard/queues`;
        console.log("📡 Fetching transaction queue data from:", url);

        const res = await axiosClient.get<ApiResponse>(url);

        console.log("✅ Transaction Queue Data:", res.data);

        const messagesData = res.data?.data?.messages || [];
        const totalStats = res.data?.data?.total_statistic?.totalStats || {};

        // Calculate stats from messages
        const calculatedStats = {
          pending: messagesData.filter((m) => m.msg_status === "pending").length,
          processing: messagesData.filter(
            (m) => m.msg_status === "processing"
          ).length,
          completed: messagesData.filter(
            (m) => m.msg_status === "completed"
          ).length,
          cancelled: messagesData.filter(
            (m) => m.msg_status === "cancelled"
          ).length,
        };

        setMessages(messagesData);
        setStats(calculatedStats);
      } catch (err: any) {
        console.error("❌ Error fetching transaction queue data:", err);
        setError(
          err.response?.data?.message || "Failed to fetch transaction data"
        );
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
              <MetricCard
                title="Pending"
                value={stats.pending.toString()}
                iconSrc="/images/icons/TotalW.svg"
              />
              <MetricCard
                title="Processing"
                value={stats.processing.toString()}
                iconSrc="/images/icons/Critical.svg"
              />
              <MetricCard
                title="Completed"
                value={stats.completed.toString()}
                iconSrc="/images/icons/Critical.svg"
              />
              <MetricCard
                title="Cancelled"
                value={stats.cancelled.toString()}
                iconSrc="/images/icons/Last.svg"
              />
            </>
          )}
        </div>

        {/* === Error Message === */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* === Data Table === */}
        <TransactionQueueTable loading={loading} messagesData={messages} />
      </div>
    </main>
  );
}