import ResultCard from "@/components/ResultCard";

export default function ResultPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      {/* 标题 */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-gray-800">复盘结果</h1>
        <p className="text-sm text-gray-400 mt-2">
          AI 为你生成的结构化分析
        </p>
      </div>

      {/* 结果卡片 */}
      <div className="bg-white rounded-lg">
        <ResultCard />
      </div>
    </main>
  );
}
