"use client";

import { useEffect, useState, useRef } from "react";

interface Review {
  id: number;
  date: string;
  content: string;
  mood: number;
  problem: string;
  tags?: string[];
}

const TAG_COLORS: Record<string, string> = {
  "高效": "bg-emerald-100 text-emerald-700",
  "拖延": "bg-orange-100 text-orange-700",
  "焦虑": "bg-red-100 text-red-600",
  "学习": "bg-blue-100 text-blue-700",
  "摸鱼": "bg-gray-100 text-gray-600",
  "高压": "bg-purple-100 text-purple-700",
  "稳定": "bg-teal-100 text-teal-700",
  "混乱": "bg-pink-100 text-pink-700",
  "充实": "bg-green-100 text-green-700",
  "疲惫": "bg-amber-100 text-amber-700",
};

interface MoodDot {
  date: string;
  mood: number;
}

function MiniTrend({ data }: { data: MoodDot[] }) {
  if (data.length === 0) return null;
  const maxMood = 10;
  const h = 80;
  const w = Math.min(data.length * 28, 320);
  const stepX = w / (data.length - 1 || 1);

  const points = data
    .map((d, i) => `${i * stepX},${h - (d.mood / maxMood) * h}`)
    .join(" ");

  return (
    <svg width={w} height={h} className="mx-auto">
      {/* grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((p) => (
        <line
          key={p}
          x1={0} y1={h - p * h} x2={w} y2={h - p * h}
          stroke="#f0f0f0" strokeWidth="0.5"
        />
      ))}
      {/* line */}
      <polyline
        points={points}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* dots */}
      {data.map((d, i) => (
        <circle
          key={i}
          cx={i * stepX}
          cy={h - (d.mood / maxMood) * h}
          r="3"
          fill="white"
          stroke="#6366f1"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

export default function ShareCard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setReviews(JSON.parse(localStorage.getItem("reviews") || "[]"));
    }
  }, [open]);

  if (!open) return null;

  const last7 = reviews.slice(0, 7);
  const moods = last7.map((r) => r.mood);
  const avg = moods.length > 0
    ? Math.round((moods.reduce((a, b) => a + b, 0) / moods.length) * 10) / 10
    : 0;

  const allTags = reviews.flatMap((r) => r.tags || []);
  const tagFreq: Record<string, number> = {};
  allTags.forEach((t) => { tagFreq[t] = (tagFreq[t] || 0) + 1; });
  const tagList = Object.entries(tagFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  const moodData: MoodDot[] = [...last7].reverse().map((r) => ({
    date: new Date(r.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
    mood: r.mood,
  }));

  const today = new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* 卡片内容 */}
        <div ref={cardRef} className="p-8" style={{ background: "linear-gradient(135deg, #fafafa 0%, #f5f3ff 100%)" }}>
          {/* 头部 */}
          <div className="text-center mb-6">
            <p className="text-xs text-gray-400 mb-1">{today}</p>
            <h2 className="text-xl font-semibold text-gray-800">我的 AI 成长周报</h2>
          </div>

          {/* 数据卡片 */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/80 rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-indigo-500">{avg}</p>
              <p className="text-xs text-gray-400 mt-1">周均心情</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-800">{reviews.length}</p>
              <p className="text-xs text-gray-400 mt-1">累计复盘</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-emerald-500">{tagList.length}</p>
              <p className="text-xs text-gray-400 mt-1">状态标签</p>
            </div>
          </div>

          {/* 迷你趋势图 */}
          {moodData.length >= 2 && (
            <div className="bg-white/80 rounded-xl p-4 mb-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-2 text-center">近 7 天情绪趋势</p>
              <MiniTrend data={moodData} />
            </div>
          )}

          {/* 标签云 */}
          {tagList.length > 0 && (
            <div className="bg-white/80 rounded-xl p-4 mb-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-2 text-center">标签统计</p>
              <div className="flex flex-wrap justify-center gap-2">
                {tagList.map(([tag, count]) => (
                  <span
                    key={tag}
                    className={`text-sm px-3 py-1 rounded-full font-medium ${TAG_COLORS[tag] || "bg-gray-100 text-gray-600"}`}
                  >
                    {tag} ×{count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 底部 */}
          <div className="text-center pt-4 border-t border-gray-200/60">
            <p className="text-xs text-gray-400">
              AI 每日复盘 · 持续成长
            </p>
            <p className="text-xs text-gray-300 mt-0.5">
              bendanma.github.io/ai-daily-review
            </p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="px-8 pb-6 pt-2 flex gap-3 bg-white">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            关闭
          </button>
          <button
            onClick={() => {
              window.print();
            }}
            className="flex-1 py-2 text-sm text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            打印/保存 PDF
          </button>
        </div>

        <p className="text-center text-xs text-gray-300 pb-4 bg-white">
          截图保存，分享到小红书 / 朋友圈
        </p>
      </div>
    </div>
  );
}
