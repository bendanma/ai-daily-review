"use client";

import { useEffect, useState } from "react";
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

export default function ResultCard() {
  const [result, setResult] = useState<string | null>(null);
  const [input, setInput] = useState<{
    content: string;
    mood: number;
    problem: string;
  } | null>(null);

  useEffect(() => {
    const storedResult = localStorage.getItem("review-result");
    const storedInput = localStorage.getItem("review-input");

    if (storedResult) {
      setResult(storedResult);
    }
    if (storedInput) {
      setInput(JSON.parse(storedInput));
    }
  }, []);

  if (!result) {
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

  const sections = parseResult(result);

  return (
    <div className="space-y-8">
      {/* 输入摘要 */}
      {input && (
        <div className="text-sm text-gray-400 space-y-1 pb-6 border-b border-gray-100">
          <p>
            今日记录了 {input.content.length} 字 · 心情 {input.mood}/10
            {input.problem ? ` · 记录了问题` : ""}
          </p>
        </div>
      )}

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

      {/* 返回按钮 */}
      <div className="pt-6 border-t border-gray-100">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← 重新复盘
        </Link>
      </div>
    </div>
  );
}
