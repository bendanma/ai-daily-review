"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const TrendChart = dynamic(() => import("@/components/TrendChart"), { ssr: false });

interface Review {
  id: number;
  date: string;
  content: string;
  mood: number;
  problem: string;
  result: string;
  tags?: string[];
}

function weekSummary(reviews: Review[]) {
  if (reviews.length === 0) return null;

  const last7 = reviews.slice(0, 7);
  const moods = last7.map((r) => r.mood);
  const avg = Math.round((moods.reduce((a, b) => a + b, 0) / moods.length) * 10) / 10;

  const first = moods[moods.length - 1] ?? moods[0];
  const last = moods[0];
  let trend = "稳定";
  if (last > first + 1) trend = "上升 ↑";
  else if (last < first - 1) trend = "下降 ↓";

  const allTags = last7.flatMap((r) => r.tags || []);
  const tagFreq: Record<string, number> = {};
  allTags.forEach((t) => { tagFreq[t] = (tagFreq[t] || 0) + 1; });
  const topTags = Object.entries(tagFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([t]) => t);

  const problems = last7.filter((r) => r.problem).map((r) => r.problem);

  const suggestions: string[] = [];
  if (trend === "下降 ↓") suggestions.push("情绪正在下滑，试试每天安排一件让你开心的小事");
  if (topTags.includes("拖延")) suggestions.push("拖延频繁出现，尝试把任务拆成 25 分钟一个的小块");
  if (topTags.includes("焦虑")) suggestions.push("焦虑感较高，睡前花 5 分钟写下所有担忧");
  if (topTags.includes("摸鱼")) suggestions.push("试试番茄钟法：25 分钟专注 + 5 分钟休息");
  if (suggestions.length === 0) suggestions.push("状态不错，继续保持当前的节奏");

  return { avg, trend, topTags, problems, suggestions, count: last7.length };
}

export default function TrendPage() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    setReviews(JSON.parse(localStorage.getItem("reviews") || "[]"));
  }, []);

  const summary = weekSummary(reviews);

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">情绪趋势</h1>
          <p className="text-sm text-gray-400 mt-2">追踪你的情绪变化</p>
        </div>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          + 新增复盘
        </Link>
      </div>

      {/* 趋势图 */}
      <div className="mb-10 p-5 border border-gray-100 rounded-lg">
        <TrendChart />
      </div>

      {/* 本周总结 */}
      {summary && (
        <div className="space-y-5">
          <h2 className="text-base font-medium text-gray-700">
            最近 {summary.count} 天状态
          </h2>

          {/* 卡片组 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 border border-gray-100 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">平均情绪</p>
              <p className="text-xl font-semibold text-gray-800">{summary.avg}<span className="text-sm text-gray-400 font-normal">/10</span></p>
            </div>
            <div className="p-4 border border-gray-100 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">情绪趋势</p>
              <p className="text-xl font-semibold text-gray-800">{summary.trend}</p>
            </div>
          </div>

          {/* 高频标签 */}
          {summary.topTags.length > 0 && (
            <div className="p-4 border border-gray-100 rounded-lg">
              <p className="text-xs text-gray-400 mb-2">高频标签</p>
              <div className="flex flex-wrap gap-1.5">
                {summary.topTags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 高频问题 */}
          {summary.problems.length > 0 && (
            <div className="p-4 border border-gray-100 rounded-lg">
              <p className="text-xs text-gray-400 mb-2">近期问题</p>
              <ul className="space-y-1">
                {summary.problems.slice(0, 3).map((p, i) => (
                  <li key={i} className="text-sm text-gray-600">· {p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 建议 */}
          <div className="p-4 border border-gray-100 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">建议</p>
            <ul className="space-y-1">
              {summary.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-gray-600">· {s}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="pt-6 mt-8 border-t border-gray-100 flex justify-between">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← 返回首页
        </Link>
        <Link href="/history" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          历史记录 →
        </Link>
      </div>
    </main>
  );
}
