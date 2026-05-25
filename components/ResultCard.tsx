"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function parseResult(text: string) {
  const sections: { title: string; content: string }[] = [];
  const regex = /【(.+?)】\s*([\s\S]*?)(?=【|$)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    sections.push({
      title: match[1].trim(),
      content: match[2].trim(),
    });
  }

  return sections;
}

const EMOJI_MAP: Record<string, string> = {
  "今日总结": "📋",
  "情绪分析": "🎭",
  "问题识别": "🔍",
  "明日建议": "💡",
};

interface Review {
  id: number;
  date: string;
  content: string;
  mood: number;
  problem: string;
  result: string;
}

export default function ResultCard() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [review, setReview] = useState<Review | null>(null);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("reviews") || "[]");
    const found = history.find((r: Review) => r.id === Number(id));
    setReview(found || null);
  }, [id]);

  if (!review) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">暂无复盘结果</p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-gray-500 hover:text-gray-800 underline underline-offset-4"
        >
          返回首页生成复盘
        </Link>
      </div>
    );
  }

  const sections = parseResult(review.result);

  return (
    <div className="space-y-8">
      {/* 日期和摘要 */}
      <div className="text-sm text-gray-400 space-y-1 pb-6 border-b border-gray-100">
        <p>
          {new Date(review.date).toLocaleString("zh-CN", {
            month: "long",
            day: "numeric",
            weekday: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p>
          记录了 {review.content.length} 字 · 心情 {review.mood}/10
          {review.problem ? " · 记录了问题" : ""}
        </p>
      </div>

      {/* 结构化结果卡片 */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-base font-medium text-gray-800 mb-2">
              {EMOJI_MAP[section.title] || ""} {section.title}
            </h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      {/* 底部 */}
      <div className="pt-6 border-t border-gray-100 flex justify-between">
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← 重新复盘
        </Link>
        <Link
          href="/history"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          历史记录 →
        </Link>
      </div>
    </div>
  );
}
