"use client";

import React, { useEffect, useState } from "react";
import MetricCard from "@/components/system-wallet/MetricCard";
import SystemWalletTable from "@/components/system-wallet/SystemWalletTable";
import { API_URL } from "@/utils/constants";
import axiosClient from "@/utils/axiosClient";

interface Wallet {
  name: string;
  slug: string;
  current_balance: number;
  last_updated: string;
  status: string;
}

interface WalletData {
  total_wallets: number;
  total_balance: number;
  last_updated: string;
  main_wallets: Wallet[];
}

export default function SystemWalletPage() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  //  Fetch API bằng axios (có cookie)
  async function fetchSystemWallets() {
    try {
      const res = await axiosClient.get(
        `${API_URL}/platform-config/dashboard/main-wallets`
      );

      return res.data;
    } catch (error) {
      console.error(" Fetch system wallets failed:", error);
      return null;
    }
  }

  useEffect(() => {
    async function loadData() {
      const data = await fetchSystemWallets();
      if (data?.success) {
        setWalletData(data.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Đang tải dữ liệu ví...</div>;
  }

  if (!walletData) {
    return <div className="p-4 text-center text-red-500">Không thể tải dữ liệu ví</div>;
  }

  const { total_wallets, total_balance, last_updated, main_wallets } = walletData;

  const formatNumber = (num?: number) =>
    typeof num === "number"
      ? num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "0.00";

  return (
    <div>
      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Wallet" value={total_wallets} iconSrc="/images/icons/TotalW.svg" />
        <MetricCard title="Critical Alerts" value={2} iconSrc="/images/icons/Critical.svg" />
        <MetricCard
          title="Total Balance (USD)"
          value={formatNumber(total_balance)}
          iconSrc="/images/icons/TotalBVND.svg"
        />
        <MetricCard
          title="Last Update"
          value={new Date(last_updated).toLocaleString()}
          iconSrc="/images/icons/Last.svg"
        />
      </div>

      {/*  Truyền đúng prop cho bảng */}
      <SystemWalletTable wallets={main_wallets} />
    </div>
  );
}
