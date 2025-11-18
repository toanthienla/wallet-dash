"use client";
import React, { useEffect, useState } from "react";

import { API_URL } from "@/utils/constants";
import axiosClient from "@/utils/axiosClient";

type Props = { variant: "fiat" | "crypto" | "points" };

type TransactionItem = {
  amount: number;
  assets: number;
  transaction_type: {
    id: number;
    name: string;
  };
  number_of_transaction: number;
};

type AssetData = {
  transactions: TransactionItem[];
  asset_type: "fiat" | "crypto" | "points";
  currency: string;
};

type ApiResponse = {
  success: boolean;
  data: AssetData[];
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-sm text-gray-500">{value}</div>
    </div>
  );
}

export default function TopStats({ variant }: Props) {
  const [data, setData] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🧠 Fetch dữ liệu bằng axios
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axiosClient.get<ApiResponse>(
          `${API_URL}/transaction/dashboard/volume-statistics`
        );

        const json = res.data;

        // ✅ Lọc dữ liệu theo loại asset
        const filtered = json.data.find(
          (d) => d.asset_type.toLowerCase() === variant.toLowerCase()
        );
        setData(filtered || null);
      } catch (err: any) {
        console.error("❌ Fetch error:", err);
        setError(err.message || "Request failed");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [variant]);

  const cardClass = "bg-white rounded-md border border-gray-100 p-4";

  if (loading) return <div className={cardClass}>Loading...</div>;
  if (error) return <div className={cardClass}>Error: {error}</div>;
  if (!data) return <div className={cardClass}>No data available</div>;

  // 🧩 Lấy Deposit / Withdraw / Redeem (nếu có)
  const deposit = data.transactions.find((t) => t.transaction_type.name === "Deposit");
  const withdraw = data.transactions.find((t) => t.transaction_type.name === "Withdrawn");
  const redeem = data.transactions.find((t) => t.transaction_type.name === "Redeem");

  // 🧮 Tính toán Net flow
  const net =
    (deposit?.assets || 0) - (withdraw?.assets || 0) - (redeem?.assets || 0);

  const format = (v: number) =>
    v.toLocaleString("en-US", { style: "currency", currency: "USD" });

  // 🏷️ Tên hiển thị & nhãn theo loại
  const labels =
    variant === "fiat"
      ? { title: "Fiat currency", code: "VND", rows: ["Deposit", "Withdrawals", "Net flow"] }
      : variant === "crypto"
        ? { title: "Crypto currency", code: data.currency, rows: ["Deposit", "Withdrawals", "Net flow"] }
        : { title: "Reward Points", code: "PTS", rows: ["Earned", "Redeemed", "Net Balance"] };

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-700">{labels.title}</div>
        <div className="text-sm font-semibold text-gray-700">{labels.code}</div>
      </div>

      <div className="divide-y divide-gray-100">
        <Row label={labels.rows[0]} value={format(deposit?.assets || 0)} />
        <Row label={labels.rows[1]} value={format(withdraw?.assets || 0)} />
        <Row label={labels.rows[2]} value={format(net)} />
      </div>
    </div>
  );
}
