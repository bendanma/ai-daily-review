import Link from "next/link";
import ReviewForm from "@/components/ReviewForm";

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">每日复盘</h1>
          <p className="text-sm text-gray-400 mt-2">
            记录今天，让明天更好
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/trend"
            className="text-sm text-gray-300 hover:text-gray-500 transition-colors"
          >
            情绪趋势
          </Link>
          <Link
            href="/history"
            className="text-sm text-gray-300 hover:text-gray-500 transition-colors"
          >
            历史记录 →
          </Link>
        </div>
      </div>

      {/* 输入表单 */}
      <div className="bg-white rounded-lg">
        <ReviewForm />
      </div>
    </main>
  );
}
