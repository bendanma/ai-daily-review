"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import GoalForm from "@/components/GoalForm";
import GoalDashboard from "@/components/GoalDashboard";

interface Goal {
  id: number;
  goal: string;
  dailyMinutes: number;
  days: number;
  plan: { day: number; task: string; done: boolean }[];
  logs: { date: string; content: string; completion: number; problem: string }[];
  createdAt: string;
}

function loadGoals(): Goal[] {
  return JSON.parse(localStorage.getItem("goals") || "[]");
}

function saveGoals(goals: Goal[]) {
  localStorage.setItem("goals", JSON.stringify(goals));
}

export default function GoalPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const gs = loadGoals();
    setGoals(gs);
    if (gs.length > 0 && !activeId) setActiveId(gs[0].id);
    setLoaded(true);
  }, []);

  const handleCreated = useCallback((g: Goal) => {
    const updated = [...goals, g];
    setGoals(updated);
    saveGoals(updated);
    setActiveId(g.id);
    setShowForm(false);
  }, [goals]);

  const handleUpdate = useCallback((g: Goal) => {
    const updated = goals.map((x) => (x.id === g.id ? g : x));
    setGoals(updated);
    saveGoals(updated);
  }, [goals]);

  const handleDelete = useCallback((id: number) => {
    if (!confirm("确定要删除这个目标吗？")) return;
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    saveGoals(updated);
    setActiveId(updated.length > 0 ? updated[0].id : null);
  }, [goals]);

  const activeGoal = goals.find((g) => g.id === activeId) || null;

  if (!loaded) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-gray-400 text-sm">加载中...</p>
      </main>
    );
  }

  // 无目标时直接显示创建页
  if (goals.length === 0 && !showForm) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">设定目标</h1>
            <p className="text-sm text-gray-400 mt-2">让 AI 帮你制定学习计划</p>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← 返回
          </Link>
        </div>
        <div className="bg-white rounded-lg">
          <GoalForm onCreated={handleCreated} />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">成长教练</h1>
          <p className="text-sm text-gray-400 mt-2">
            {goals.length} 个目标进行中
          </p>
        </div>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← 返回
        </Link>
      </div>

      {/* 目标标签切换 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {goals.map((g) => (
          <button
            key={g.id}
            onClick={() => { setActiveId(g.id); setShowForm(false); }}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              activeId === g.id && !showForm
                ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                : "border border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            {g.goal.slice(0, 12)}{g.goal.length > 12 ? "…" : ""}
          </button>
        ))}
        <button
          onClick={() => { setShowForm(!showForm); setActiveId(null); }}
          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
            showForm
              ? "bg-stone-50 text-gray-700 border-gray-300"
              : "border-dashed border-gray-200 text-gray-400 hover:border-gray-300"
          }`}
        >
          + 新建
        </button>
      </div>

      {/* 新建表单 */}
      {showForm && (
        <div className="mb-8 p-5 border border-gray-100 rounded-xl">
          <GoalForm onCreated={handleCreated} />
        </div>
      )}

      {/* 当前选中目标的仪表盘 */}
      {activeGoal && !showForm && (
        <GoalDashboard
          goal={activeGoal}
          onUpdate={handleUpdate}
          onDelete={() => handleDelete(activeGoal.id)}
        />
      )}
    </main>
  );
}
