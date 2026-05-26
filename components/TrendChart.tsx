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
  Area,
  ComposedChart,
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
      date: new Date(r.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
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
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-sm">暂无数据，先生成几篇复盘吧。</p>
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={{ stroke: "#f0f0f0" }}
            interval="preserveStartEnd"
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
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              fontSize: "13px",
              padding: "10px 14px",
            }}
            labelStyle={{ color: "#6b7280", fontWeight: 500, marginBottom: 4 }}
            formatter={(value: any) => [`${value} / 10`, "心情"]}
          />
          <ReferenceLine
            y={avg}
            stroke="#d4d4d8"
            strokeDasharray="4 4"
            label={{
              value: `平均 ${avg}`,
              position: "insideTopRight",
              fontSize: 11,
              fill: "#a1a1aa",
              fontWeight: 500,
            }}
          />
          <Area
            type="monotone"
            dataKey="mood"
            fill="url(#moodGradient)"
            stroke="none"
          />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 3, fill: "#ffffff", stroke: "#6366f1", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#6366f1", stroke: "#ffffff", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
