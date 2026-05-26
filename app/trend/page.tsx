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

const TAG_COLORS: Record<string, string> = {
  "高效": "bg-emerald-50 text-emerald-600",
  "拖延": "bg-orange-50 text-orange-600",
  "焦虑": "bg-red-50 text-red-500",
  "学习": "bg-blue-50 text-blue-600",
  "摸鱼": "bg-gray-50 text-gray-500",
  "高压": "bg-purple-50 text-purple-600",
  "稳定": "bg-teal-50 text-teal-600",
  "混乱": "bg-pink-50 text-pink-600",
  "充实": "bg-green-50 text-green-600",
  "疲惫": "bg-amber-50 text-amber-600",
};

const TAG_BAR_COLORS: Record<string, string> = {
  "高效": "bg-emerald-400",
  "拖延": "bg-orange-400",
  "焦虑": "bg-red-400",
  "学习": "bg-blue-400",
  "摸鱼": "bg-gray-400",
  "高压": "bg-purple-400",
  "稳定": "bg-teal-400",
  "混乱": "bg-pink-400",
  "充实": "bg-green-400",
  "疲惫": "bg-amber-400",
};

function analyze(reviews: Review[]) {
  if (reviews.length === 0) return null;
  const last7 = reviews.slice(0, 7);
  const moods = last7.map((r) => r.mood);
  const avg = Math.round((moods.reduce((a, b) => a + b, 0) / moods.length) * 10) / 10;
  const first = moods[moods.length - 1] ?? moods[0];
  const last = moods[0];
  let trend = "稳定";
  if (last > first + 1) trend = "上升";
  else if (last < first - 1) trend = "下降";

  const allTags = last7.flatMap((r) => r.tags || []);
  const tagFreq: Record<string, number> = {};
  allTags.forEach((t) => { tagFreq[t] = (tagFreq[t] || 0) + 1; });
  const tagList = Object.entries(tagFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const maxFreq = tagList[0]?.[1] || 1;

  const problems = last7.filter((r) => r.problem).map((r) => r.problem);

  const suggestions: string[] = [];
  if (trend === "下降") suggestions.push("情绪正在下滑，试试每天安排一件让你开心的小事");
  if (tagFreq["拖延"]) suggestions.push("拖延频繁出现，尝试把任务拆成 25 分钟一个小块");
  if (tagFreq["焦虑"]) suggestions.push("焦虑感较高，睡前花 5 分钟写下所有担忧");
  if (tagFreq["摸鱼"]) suggestions.push("试试番茄钟法：25 分钟专注 + 5 分钟休息");
  if (suggestions.length === 0) suggestions.push("状态不错，继续保持当前的节奏");

  return { avg, trend, tagList, maxFreq, problems, suggestions, count: last7.length };
}

export default function TrendPage() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    setReviews(JSON.parse(localStorage.getItem("reviews") || "[]"));
  }, []);

  const a = analyze(reviews);

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

      {/* 折线图 */}
      <div className="mb-8 p-5 border border-gray-100 rounded-xl">
        <TrendChart />
      </div>

      {a && (
        <>
          {/* hero 数据卡片 */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="p-4 bg-stone-50 rounded-xl text-center">
              <p className="text-2xl font-semibold text-gray-800">{a.avg}</p>
              <p className="text-xs text-gray-400 mt-1">每周均分 /10</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl text-center">
              <p className="text-2xl font-semibold text-gray-800">{a.count}</p>
              <p className="text-xs text-gray-400 mt-1">记录次数</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl text-center">
              <p className="text-2xl font-semibold text-gray-800">
                {a.trend === "上升" ? "↑" : a.trend === "下降" ? "↓" : "→"}
              </p>
              <p className="text-xs text-gray-400 mt-1">情绪趋势</p>
            </div>
          </div>

          {/* 标签统计 — 频率条 */}
          {a.tagList.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-500 mb-3">本周标签分布</h3>
              <div className="space-y-2">
                {a.tagList.map(([tag, count]) => (
                  <div key={tag} className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full w-12 text-center ${TAG_COLORS[tag] || "bg-gray-50 text-gray-500"}`}>
                      {tag}
                    </span>
                    <div className="flex-1 h-5 bg-gray-50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${TAG_BAR_COLORS[tag] || "bg-gray-400"}`}
                        style={{ width: `${(count / a.maxFreq) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-5 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 近期问题 */}
          {a.problems.length > 0 && (
            <div className="mb-8 p-4 border border-gray-100 rounded-xl">
              <p className="text-xs text-gray-400 mb-2">近期记录的问题</p>
              <ul className="space-y-1">
                {a.problems.slice(0, 3).map((p, i) => (
                  <li key={i} className="text-sm text-gray-600">· {p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* AI 洞察 */}
          <div className="mb-8 p-5 bg-stone-50 rounded-xl">
            <p className="text-xs text-gray-300 mb-3 uppercase tracking-wider">
              AI 帮你发现的规律
            </p>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                最近 {a.count} 天你的心情均分 <strong className="text-gray-800">{a.avg}/10</strong>，
                整体趋势
                <strong className="text-gray-800">
                  {a.trend === "上升" ? " 向好 ↑" : a.trend === "下降" ? " 下滑 ↓" : " 平稳"}
                </strong>。
              </p>
              {a.tagList.length > 0 && (
                <p>
                  出现最多的状态标签是
                  <strong className="text-gray-800">「{a.tagList[0][0]}」</strong>
                  {a.tagList[1] ? <>和 <strong className="text-gray-800">「{a.tagList[1][0]}」</strong></> : ""}。
                </p>
              )}
              <p className="text-gray-400 text-xs">
                AI 最厉害的不是聊天，而是开始帮你做长期数据分析。
              </p>
            </div>
          </div>

          {/* 建议 */}
          <div className="p-4 border border-gray-100 rounded-xl">
            <p className="text-xs text-gray-400 mb-2">本周建议</p>
            <ul className="space-y-1">
              {a.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-gray-600">· {s}</li>
              ))}
            </ul>
          </div>
        </>
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
