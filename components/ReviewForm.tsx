"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

const SYSTEM_PROMPT = `你是一个专业的个人成长分析助手，专注于帮助中国大学生和研究生进行每日复盘分析。

你的任务是根据用户输入内容，生成结构化复盘。

输出必须严格按照以下格式：

【今日总结】
对用户一天行为进行结构化总结

【情绪分析】
分析用户当前心理状态，用中文表达，不要说教

【问题识别】
指出核心问题，如果没有问题则输出"暂无明显问题"

【明日建议】
给出1-3条可执行建议，必须具体、可执行，不要空话

要求：
- 全部中文输出
- 语气自然
- 不要使用英文术语
- 不要扩展无关内容
- 不要输出多余标题或解释`;

export default function ReviewForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(5);
  const [problem, setProblem] = useState("");
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("user-api-key") || "";
    }
    return "";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("请填写今日做了什么");
      return;
    }
    if (!apiKey.trim()) {
      setError("请填写 DeepSeek API Key");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const userMessage = `今日做了：\n${content}\n\n情绪评分：\n${mood}/10\n\n当前问题：\n${problem || "无"}`;

      const res = await fetch(DEEPSEEK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || `API 调用失败 (${res.status})`);
      }

      const result = data.choices[0].message.content;

      const review = {
        id: Date.now(),
        date: new Date().toISOString(),
        content,
        mood,
        problem,
        result,
      };
      const history = JSON.parse(localStorage.getItem("reviews") || "[]");
      history.unshift(review);
      localStorage.setItem("reviews", JSON.stringify(history));
      localStorage.setItem("user-api-key", apiKey);

      router.push(`/result?id=${review.id}`);
    } catch (err: any) {
      setError(err.message || "生成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">
          今日做了什么
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="今天完成了哪些任务？学到了什么？"
          rows={5}
          className="w-full resize-none border-0 border-b border-gray-200 bg-transparent pb-2 text-lg text-gray-800 placeholder-gray-300 outline-none transition-colors focus:border-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-500 mb-3">
          心情评分：<span className="text-gray-800 font-semibold">{mood} / 10</span>
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={mood}
          onChange={(e) => setMood(Number(e.target.value))}
          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-800"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1</span>
          <span>10</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">
          当前问题 <span className="text-gray-300">（可选）</span>
        </label>
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="目前遇到了什么困难或困惑？"
          rows={3}
          className="w-full resize-none border-0 border-b border-gray-200 bg-transparent pb-2 text-lg text-gray-800 placeholder-gray-300 outline-none transition-colors focus:border-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">
          DeepSeek API Key <span className="text-red-300">*</span>
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="w-full border-0 border-b border-gray-200 bg-transparent pb-2 text-sm text-gray-800 placeholder-gray-300 outline-none transition-colors focus:border-gray-400"
        />
        <p className="text-xs text-gray-300 mt-1">
          <a href="https://platform.deepseek.com/api_keys" target="_blank" className="underline underline-offset-2 hover:text-gray-400">获取 Key</a>（新用户免费送额度）
          {apiKey && <span className="text-green-400"> · 已记住</span>}
        </p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-base font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "AI 正在生成复盘..." : "生成复盘"}
      </button>
    </form>
  );
}
