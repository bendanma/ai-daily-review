"use client";

import { useEffect, useState } from "react";
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

export default function GoalPage() {
  const [goal, setGoal] = useState<Goal | null | undefined>(undefined);

  useEffect(() => {
    const stored = localStorage.getItem("current-goal");
    setGoal(stored ? JSON.parse(stored) : null);
  }, []);

  if (goal === undefined) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-gray-400 text-sm">加载中...</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {goal ? "成长教练" : "设定目标"}
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            {goal ? "AI 帮你追踪学习进度" : "让 AI 帮你制定学习计划"}
          </p>
        </div>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← 返回
        </Link>
      </div>

      {goal ? (
        <GoalDashboard goal={goal} onUpdate={setGoal} />
      ) : (
        <div className="bg-white rounded-lg">
          <GoalForm onCreated={setGoal} />
        </div>
      )}
    </main>
  );
}
