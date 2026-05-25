"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Evaluation {
  accurate: boolean | null;
  useful: boolean | null;
  surprising: boolean | null;
  wantToShare: boolean | null;
  notes: string;
}

interface Review {
  id: number;
  date: string;
  content: string;
  mood: number;
  problem: string;
  result: string;
  tags?: string[];
  evaluation?: Evaluation;
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

const BADGE_LABELS: { key: keyof Evaluation; label: string }[] = [
  { key: "accurate", label: "准确" },
  { key: "useful", label: "有用" },
  { key: "surprising", label: "惊喜" },
  { key: "wantToShare", label: "想分享" },
];

export default function HistoryPage() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("reviews") || "[]");
    setReviews(data);
  }, []);

  function deleteReview(id: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    localStorage.setItem("reviews", JSON.stringify(updated));
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">历史记录</h1>
          <p className="text-sm text-gray-400 mt-2">
            {reviews.length === 0 ? "暂无复盘记录" : `共 ${reviews.length} 次复盘`}
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/trend" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            情绪趋势
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            + 新增
          </Link>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400">还没有复盘记录</p>
          <Link href="/" className="mt-4 inline-block text-sm text-gray-500 hover:text-gray-800 underline underline-offset-4">
            去写第一篇复盘
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => {
            const ev = review.evaluation;

            return (
              <Link
                key={review.id}
                href={`/result?id=${review.id}`}
                className="block p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">
                    {new Date(review.date).toLocaleString("zh-CN", {
                      month: "long",
                      day: "numeric",
                      weekday: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      心情 {review.mood}/10
                    </span>
                    <button
                      onClick={(e) => deleteReview(review.id, e)}
                      className="text-xs text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      删除
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {review.content}
                </p>

                {/* 标签 */}
                {review.tags && review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs px-2 py-0.5 rounded-full ${TAG_COLORS[tag] || "bg-gray-50 text-gray-500"}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 评价标签 */}
                {ev && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {BADGE_LABELS.map(({ key, label }) =>
                      ev[key] === true ? (
                        <span key={key} className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">
                          {label}
                        </span>
                      ) : ev[key] === false ? (
                        <span key={key} className="text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-400">
                          ✗{label}
                        </span>
                      ) : null
                    )}
                    {ev.notes && (
                      <span className="text-xs text-gray-400 truncate max-w-[200px]">
                        {ev.notes}
                      </span>
                    )}
                  </div>
                )}

                {!ev && !review.tags?.length && (
                  <span className="text-xs text-gray-300 mt-1 inline-block">未评价</span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      <div className="pt-6 mt-8 border-t border-gray-100">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← 返回首页
        </Link>
      </div>
    </main>
  );
}
