"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Review {
  id: number;
  date: string;
  content: string;
  mood: number;
  problem: string;
  result: string;
}

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
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          + 新增复盘
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400">还没有复盘记录</p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-gray-500 hover:text-gray-800 underline underline-offset-4"
          >
            去写第一篇复盘
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
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
              {review.result && (
                <p className="text-xs text-gray-300 mt-2 line-clamp-1">
                  {review.result.slice(0, 80)}...
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="pt-6 mt-8 border-t border-gray-100">
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← 返回首页
        </Link>
      </div>
    </main>
  );
}
