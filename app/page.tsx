import ReviewForm from "@/components/ReviewForm";

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      {/* 标题区 */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-gray-800">每日复盘</h1>
        <p className="text-sm text-gray-400 mt-2">
          记录今天，让明天更好
        </p>
      </div>

      {/* 输入表单 */}
      <div className="bg-white rounded-lg">
        <ReviewForm />
      </div>
    </main>
  );
}
