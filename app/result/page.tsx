import { Suspense } from "react";
import ResultCard from "@/components/ResultCard";

export default function ResultPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-gray-800">复盘结果</h1>
        <p className="text-sm text-gray-400 mt-2">
          AI 为你生成的结构化分析
        </p>
      </div>

      <div className="bg-white rounded-lg">
        <Suspense fallback={<p className="text-gray-400 text-sm">加载中...</p>}>
          <ResultCard />
        </Suspense>
      </div>
    </main>
  );
}
