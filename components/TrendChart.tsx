"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface Review {
  id: number;
  date: string;
  mood: number;
  tags?: string[];
}

export default function TrendChart() {
  const [data, setData] = useState<{ date: string; mood: number; label: string }[]>([]);
  const [avg, setAvg] = useState(0);

  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem("reviews") || "[]") as Review[];
    const last30 = raw.slice(0, 30).reverse();

    const chartData = last30.map((r) => ({
      date: new Date(r.date).toLocaleDateString("zh-CN", {
        month: "short",
        day: "numeric",
      }),
      mood: r.mood,
      label: r.tags?.join(" · ") || "",
    }));

    setData(chartData);
    if (chartData.length > 0) {
      const sum = chartData.reduce((a, b) => a + b.mood, 0);
      setAvg(Math.round((sum / chartData.length) * 10) / 10);
    }
  }, []);

  if (data.length === 0) {
    return <p className="text-gray-400 text-sm">暂无数据，先生成几篇复盘吧。</p>;
  }

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-sm text-gray-500">平均情绪</span>
        <span className="text-lg font-semibold text-gray-800">
          {avg} <span className="text-xs text-gray-400">/ 10</span>
        </span>
        <span className="text-xs text-gray-400">
          （{data.length} 条记录）
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                fontSize: "13px",
              }}
              labelStyle={{ color: "#6b7280" }}
              formatter={(value: any) => [`${value} / 10`, "心情"]}
            />
            <ReferenceLine
              y={avg}
              stroke="#e5e7eb"
              strokeDasharray="5 5"
              label={{
                value: `均 ${avg}`,
                position: "right",
                fontSize: 11,
                fill: "#9ca3af",
              }}
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="#374151"
              strokeWidth={1.5}
              dot={{ r: 3, fill: "#374151", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#374151", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
