"use client";
import React, { useEffect, useState } from "react";
import MetricCard from "@/components/user-wallet/MetricCard";
import BulkActions from "@/components/user-wallet/BulkActions";
import WalletTable from "@/components/user-wallet/WalletTable";
import Image from "next/image";
import { API_URL } from "@/utils/constants";
import axiosClient from "@/utils/axiosClient";

type Stats = {
  totalUsers: number;
  activeSubWallets: number;
  pendingCollection: number;
  totalBalance: number;
  uninitializedPasscodes: number;
  initializedPasscodes: number;
};

export default function UserWalletPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeSubWallets: 0,
    pendingCollection: 0,
    totalBalance: 0,
    uninitializedPasscodes: 0,
    initializedPasscodes: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosClient.get(
          `${API_URL}/wallets/dashboard/list`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        console.log("🔥 Dashboard result:", response.data);
        const d = response.data?.data || {};

        setStats({
          totalUsers: d.total_of_users ?? 0,
          activeSubWallets: d.total_of_active_sub_wallets ?? 0,
          pendingCollection: d.total_of_pending_collection ?? 0,
          totalBalance: d.total_balance ?? 0,
          uninitializedPasscodes: d.total_of_uninitialized_passcode ?? 0,
          initializedPasscodes: d.total_of_initialized_passcode ?? 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return <div className="p-6 text-gray-500">Loading dashboard...</div>;

  const formatNumber = (num: number) => new Intl.NumberFormat("en-US").format(num);
  const formatCurrency = (num: number) =>
    "$" + new Intl.NumberFormat("en-US").format(num);

  return (
    <div className="">
      {/* 🧩 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Sub-wallets"
          value={formatNumber(stats.activeSubWallets)}
          desc={`Users: ${formatNumber(stats.totalUsers)}`}
          icon={
            <Image
              src="/images/icons/TotalS.svg"
              alt="Total Sub-wallet icon"
              width={20}
              height={20}
            />
          }
        />

        <MetricCard
          title="Total Balance"
          value={formatCurrency(stats.totalBalance)}
          desc={`Pending: ${formatNumber(stats.pendingCollection)} wallets`}
          icon={
            <Image
              src="/images/icons/TotalB.svg"
              alt="Total Balance icon"
              width={20}
              height={20}
            />
          }
        />

        <MetricCard
          title="Uninitialized Passcodes"
          value={formatNumber(stats.uninitializedPasscodes)}
          desc={`Initialized: ${formatNumber(stats.initializedPasscodes)}`}
          icon={
            <Image
              src="/images/icons/Selected.svg"
              alt="Selected for Collection icon"
              width={20}
              height={20}
            />
          }
        />
      </div>

      {/*  Bulk Actions */}
      <div className="mt-6">
        <BulkActions />
      </div>

      {/*  Wallet Table */}
      <div className="mt-6">
        <WalletTable />
      </div>
    </div>
  );
}
