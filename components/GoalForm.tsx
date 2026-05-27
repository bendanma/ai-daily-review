"use client";

import { useState, FormEvent } from "react";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

interface Goal {
  id: number;
  goal: string;
  dailyMinutes: number;
  days: number;
  plan: { day: number; task: string; done: boolean }[];
  logs: { date: string; content: string; completion: number; problem: string }[];
  createdAt: string;
}

export default function GoalForm({ onCreated }: { onCreated: (goal: Goal) => void }) {
  const [goal, setGoal] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [days, setDays] = useState(14);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!goal.trim()) return;

    const apiKey = localStorage.getItem("user-api-key") || "";
    if (!apiKey) {
      setError("请先回首页填写 DeepSeek API Key");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const sysPrompt = `你是一个专业的学习教练，帮助用户制定可执行的学习计划。

根据用户提供的学习目标、每天可用时间、总天数，生成一个每日学习计划。

输出格式：

【学习计划】
Day 1：具体任务
Day 2：具体任务
...

要求：
- 每一天的任务必须具体、可执行
- 每天任务量不能超过用户时间限制
- 循序渐进，前后衔接
- 只输出计划，不要解释
- 不要输出多余内容`;

      const userPrompt = `学习目标：${goal}\n每天可用时间：${dailyMinutes} 分钟\n总天数：${days} 天`;

      const res = await fetch(DEEPSEEK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: sysPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "生成失败");

      const raw = data.choices[0].message.content;
      const plan = parsePlan(raw, days);

      const newGoal: Goal = {
        id: Date.now(),
        goal: goal.trim(),
        dailyMinutes,
        days,
        plan,
        logs: [],
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("current-goal", JSON.stringify(newGoal));
      onCreated(newGoal);
    } catch (err: any) {
      setError(err.message || "创建失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleCreate} className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">
          学习目标
        </label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="例如：学会 Python 基础、通过英语六级、掌握数据分析..."
          rows={2}
          className="w-full resize-none border-0 border-b border-gray-200 bg-transparent pb-2 text-lg text-gray-800 placeholder-gray-300 outline-none focus:border-gray-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            每天可用时间（分钟）
          </label>
          <input
            type="number"
            value={dailyMinutes}
            onChange={(e) => setDailyMinutes(Math.max(1, Number(e.target.value)))}
            placeholder="30"
            className="w-full border-0 border-b border-gray-200 bg-transparent pb-2 text-gray-800 placeholder-gray-300 outline-none focus:border-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            学习周期（天）
          </label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
            placeholder="14"
            className="w-full border-0 border-b border-gray-200 bg-transparent pb-2 text-gray-800 placeholder-gray-300 outline-none focus:border-gray-400"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-base font-medium text-gray-600 bg-stone-50 border border-gray-200 rounded-lg hover:bg-stone-100 hover:text-gray-800 transition-colors disabled:opacity-50"
      >
        {loading ? "AI 正在生成学习计划..." : "生成学习计划"}
      </button>
    </form>
  );
}

function parsePlan(raw: string, totalDays: number): { day: number; task: string; done: boolean }[] {
  const plan: { day: number; task: string; done: boolean }[] = [];
  const lines = raw.split("\n");
  for (const line of lines) {
    const m = line.match(/Day\s*(\d+)[：:]\s*(.+)/i);
    if (m) {
      const day = parseInt(m[1]);
      const task = m[2].trim();
      if (day > 0 && task) plan.push({ day, task, done: false });
    }
  }
  if (plan.length === 0) {
    for (let i = 1; i <= totalDays; i++) {
      plan.push({ day: i, task: `第 ${i} 天学习任务`, done: false });
    }
  }
  return plan;
}
