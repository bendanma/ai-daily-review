"use client";

import { useState, FormEvent } from "react";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

interface GoalLog {
  date: string;
  content: string;
  completion: number;
  problem: string;
}

interface Goal {
  id: number;
  goal: string;
  dailyMinutes: number;
  days: number;
  plan: { day: number; task: string; done: boolean }[];
  logs: GoalLog[];
  createdAt: string;
}

export default function GoalDashboard({
  goal,
  onUpdate,
  onDelete,
}: {
  goal: Goal;
  onUpdate: (g: Goal) => void;
  onDelete: () => void;
}) {
  const [logContent, setLogContent] = useState("");
  const [logCompletion, setLogCompletion] = useState(7);
  const [logProblem, setLogProblem] = useState("");
  const [logLoading, setLogLoading] = useState(false);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coaching, setCoaching] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState(false);
  const [editMinutes, setEditMinutes] = useState(goal.dailyMinutes);

  const doneCount = goal.plan.filter((p) => p.done).length;
  const progress = goal.plan.length > 0 ? Math.round((doneCount / goal.plan.length) * 100) : 0;

  function save(g: Goal) {
    onUpdate(g);
  }

  function toggleDay(day: number) {
    const updated = goal.plan.map((p) => (p.day === day ? { ...p, done: !p.done } : p));
    save({ ...goal, plan: updated });
  }

  function handleSaveTime() {
    save({ ...goal, dailyMinutes: editMinutes });
    setEditingTime(false);
  }

  async function handleAddLog(e: FormEvent) {
    e.preventDefault();
    if (!logContent.trim()) return;

    const newLog: GoalLog = {
      date: new Date().toISOString(),
      content: logContent.trim(),
      completion: logCompletion,
      problem: logProblem.trim(),
    };

    const todayIndex = goal.logs.length;
    const updatedPlan = goal.plan.map((p, i) =>
      i === todayIndex ? { ...p, done: true } : p
    );

    save({ ...goal, logs: [...goal.logs, newLog], plan: updatedPlan });
    setLogContent("");
    setLogProblem("");
    setLogCompletion(7);
  }

  async function getCoaching() {
    const apiKey = localStorage.getItem("user-api-key") || "";
    if (!apiKey || goal.logs.length === 0) return;

    setCoachLoading(true);
    try {
      const logsText = goal.logs
        .slice(-7)
        .map(
          (l, i) =>
            `Day ${i + 1}：${l.content}\n完成度：${l.completion}/10\n问题：${l.problem || "无"}`
        )
        .join("\n\n");

      const sysPrompt = `你是一个专业的学习教练。根据用户最近的学习记录，给出针对性成长建议。

输出简洁，1-3条建议，每条必须具体可执行。不要说空话。只输出建议内容，不要解释。`;

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
            {
              role: "user",
              content: `目标：${goal.goal}\n每天${goal.dailyMinutes}分钟\n最近记录：\n${logsText}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      const data = await res.json();
      if (res.ok) setCoaching(data.choices[0].message.content);
    } catch {
      setCoaching("无法获取建议，请稍后重试");
    } finally {
      setCoachLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* 目标信息 */}
      <div>
        <h2 className="text-lg font-medium text-gray-800">{goal.goal}</h2>
        <div className="flex items-center gap-3 mt-1">
          {editingTime ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editMinutes}
                onChange={(e) => setEditMinutes(Math.max(1, Number(e.target.value)))}
                className="w-16 border-b border-gray-300 bg-transparent text-sm text-gray-800 outline-none"
              />
              <span className="text-sm text-gray-400">分钟/天</span>
              <button
                onClick={handleSaveTime}
                className="text-xs text-indigo-500 hover:text-indigo-600"
              >
                保存
              </button>
              <button
                onClick={() => setEditingTime(false)}
                className="text-xs text-gray-300 hover:text-gray-500"
              >
                取消
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400">
                每天 {goal.dailyMinutes} 分钟 · {goal.days} 天计划 · 已坚持 {goal.logs.length} 天
              </p>
              <button
                onClick={() => { setEditMinutes(goal.dailyMinutes); setEditingTime(true); }}
                className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
              >
                修改时长
              </button>
            </>
          )}
        </div>
      </div>

      {/* 进度条 */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>总进度</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-400 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 每日计划列表 */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-3">学习计划</h3>
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {goal.plan.map((p) => (
            <button
              key={p.day}
              onClick={() => toggleDay(p.day)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                p.done ? "bg-stone-50 text-gray-400 line-through" : "hover:bg-stone-50 text-gray-600"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs shrink-0 ${
                  p.done ? "border-indigo-300 bg-indigo-50 text-indigo-500" : "border-gray-200"
                }`}
              >
                {p.done ? "✓" : ""}
              </span>
              <span className="text-gray-300 w-10 shrink-0">D{p.day}</span>
              <span>{p.task}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 每日反馈 */}
      <div className="pt-6 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-500 mb-4">今日学习反馈</h3>
        <form onSubmit={handleAddLog} className="space-y-4">
          <textarea
            value={logContent}
            onChange={(e) => setLogContent(e.target.value)}
            placeholder="今天学了什么？感觉怎么样？"
            rows={2}
            className="w-full resize-none border-0 border-b border-gray-200 bg-transparent pb-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-gray-400"
          />
          <div className="flex items-center gap-4">
            <label className="text-xs text-gray-400">完成度</label>
            <input
              type="range"
              min={1}
              max={10}
              value={logCompletion}
              onChange={(e) => setLogCompletion(Number(e.target.value))}
              className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
            <span className="text-xs text-gray-500 w-6">{logCompletion}</span>
          </div>
          <input
            type="text"
            value={logProblem}
            onChange={(e) => setLogProblem(e.target.value)}
            placeholder="遇到的问题（可选）"
            className="w-full border-0 border-b border-gray-200 bg-transparent pb-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-gray-400"
          />
          <button
            type="submit"
            disabled={logLoading}
            className="w-full py-2 text-sm font-medium text-gray-500 bg-stone-50 border border-gray-200 rounded-lg hover:bg-stone-100 transition-colors"
          >
            记录今日学习
          </button>
        </form>
      </div>

      {/* 历史日志 */}
      {goal.logs.length > 0 && (
        <div className="pt-6 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            学习记录（{goal.logs.length} 天）
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {[...goal.logs].reverse().map((log, i) => (
              <div key={i} className="p-3 bg-stone-50 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm text-gray-600">{log.content}</p>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">
                    完成度 {log.completion}/10
                  </span>
                </div>
                {log.problem && (
                  <p className="text-xs text-gray-400 mt-1">问题：{log.problem}</p>
                )}
                <p className="text-xs text-gray-300 mt-1">
                  {new Date(log.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI 教练建议 */}
      <div className="pt-6 border-t border-gray-100">
        <button
          onClick={getCoaching}
          disabled={coachLoading || goal.logs.length === 0}
          className="w-full py-2 text-sm font-medium text-indigo-500 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
        >
          {coachLoading ? "AI 分析中..." : "获取 AI 成长建议"}
        </button>

        {coaching && (
          <div className="mt-4 p-4 bg-stone-50 rounded-xl">
            <p className="text-xs text-gray-300 mb-2 uppercase tracking-wider">AI 教练建议</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{coaching}</p>
          </div>
        )}
      </div>

      {/* 删除 */}
      <button onClick={onDelete} className="text-xs text-gray-300 hover:text-red-400 transition-colors">
        删除目标
      </button>
    </div>
  );
}
