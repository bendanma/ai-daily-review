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
  evaluation?: Evaluation;
}

function saveEvaluation(id: number, evaluation: Evaluation) {
  const history = JSON.parse(localStorage.getItem("reviews") || "[]");
  const idx = history.findIndex((r: Review) => r.id === id);
  if (idx !== -1) {
    history[idx].evaluation = evaluation;
    localStorage.setItem("reviews", JSON.stringify(history));
  }
}

const RATING_BUTTONS = [
  { key: "accurate" as const, label: "准确" },
  { key: "useful" as const, label: "有用" },
  { key: "surprising" as const, label: "惊喜" },
  { key: "wantToShare" as const, label: "想分享" },
];

export default function ResultCard() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [review, setReview] = useState<Review | null>(null);
  const [eval_, setEval] = useState<Evaluation>({
    accurate: null,
    useful: null,
    surprising: null,
    wantToShare: null,
    notes: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("reviews") || "[]");
    const found = history.find((r: Review) => r.id === Number(id));
    setReview(found || null);
    if (found?.evaluation) {
      setEval(found.evaluation);
      setSaved(true);
    }
  }, [id]);

  function toggleEval(key: keyof Evaluation) {
    if (typeof eval_[key] === "string") return;
    const next = { ...eval_, [key]: eval_[key] === true ? false : eval_[key] === false ? null : true };
    setEval(next);
  }

  function handleSave() {
    if (!review) return;
    saveEvaluation(Number(id), eval_);
    setSaved(true);
  }

  if (!review) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">暂无复盘结果</p>
        <Link href="/" className="mt-4 inline-block text-sm text-gray-500 hover:text-gray-800 underline underline-offset-4">
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

      {/* 评价区 */}
      <div className="pt-6 border-t border-gray-100 space-y-5">
        <h3 className="text-sm font-medium text-gray-500">评价这次复盘</h3>

        {/* 四维评分 */}
        <div className="flex flex-wrap gap-2">
          {RATING_BUTTONS.map(({ key, label }) => {
            const val = eval_[key] as boolean | null;
            return (
              <button
                key={key}
                onClick={() => toggleEval(key)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  val === true
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : val === false
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "border-gray-200 text-gray-400 hover:border-gray-300"
                }`}
              >
                {val === true ? "✓" : val === false ? "✗" : ""} {label}
              </button>
            );
          })}
        </div>

        {/* 问题备注 */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">
            哪里不满意？（可选）
          </label>
          <textarea
            value={eval_.notes}
            onChange={(e) => setEval({ ...eval_, notes: e.target.value })}
            placeholder="例如：总结太笼统、建议不够具体..."
            rows={2}
            className="w-full resize-none border-0 border-b border-gray-100 bg-transparent pb-2 text-sm text-gray-600 placeholder-gray-300 outline-none focus:border-gray-300"
          />
        </div>

        <button
          onClick={handleSave}
          className={`px-4 py-1.5 text-sm rounded-lg border transition-colors ${
            saved
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-gray-200 text-gray-500 hover:border-gray-300"
          }`}
        >
          {saved ? "已保存 ✓" : "保存评价"}
        </button>
      </div>

      {/* 底部导航 */}
      <div className="pt-6 border-t border-gray-100 flex justify-between">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← 重新复盘
        </Link>
        <Link href="/history" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          历史记录 →
        </Link>
      </div>
    </div>
  );
}
