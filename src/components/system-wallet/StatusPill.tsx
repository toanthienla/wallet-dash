import React from "react";

interface StatusPillProps {
  status: string;
}

export default function StatusPill({ status }: StatusPillProps) {
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

