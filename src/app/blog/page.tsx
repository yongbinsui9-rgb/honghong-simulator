"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Sparkles, Loader2 } from "lucide-react";

interface Article {
  id: number;
  title: string;
  summary: string;
  created_at: string;
}

export default function BlogListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/blog");
      const data = await res.json();
      if (Array.isArray(data)) {
        if (data.length === 0) {
          // 没有文章，触发种子生成
          await seedArticles();
        } else {
          setArticles(data);
        }
      }
    } catch {
      // 静默失败
    } finally {
      setLoading(false);
    }
  };

  const seedArticles = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/blog/seed", { method: "POST" });
      const data = await res.json();
      if (data.articles) {
        setArticles(data.articles);
      } else {
        // 生成后重新拉取
        const retry = await fetch("/api/blog");
        const list = await retry.json();
        if (Array.isArray(list)) setArticles(list);
      }
    } catch {
      // 静默
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="min-h-dvh bg-[#f5f5f7] dark:bg-black">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-[980px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7] hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[13px] font-medium tracking-tight">返回首页</span>
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#ff6b6b]" />
            <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              恋爱攻略
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-[980px] mx-auto px-6 py-16">
        {/* 头部 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff6b6b]/10 dark:bg-[#ff6b6b]/20 text-[#ff6b6b] text-[12px] font-medium mb-6">
            <Sparkles className="w-3 h-3" />
            恋爱沟通技巧
          </div>
          <h1 className="text-[40px] md:text-[52px] font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] leading-[1.1] mb-4">
            恋爱攻略
          </h1>
          <p className="text-[17px] text-[#86868b] dark:text-[#a1a1a6] max-w-[600px] mx-auto">
            科学又实用的恋爱沟通技巧，帮你把每段关系经营得更好
          </p>
        </div>

        {/* 加载中 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 text-[#ff6b6b] animate-spin" />
            <p className="text-[14px] text-[#86868b]">加载文章中...</p>
          </div>
        )}

        {/* 种子生成中 */}
        {seeding && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 text-[#ff6b6b] animate-spin" />
            <p className="text-[14px] text-[#86868b]">AI 正在生成文章...</p>
            <p className="text-[12px] text-[#a1a1a6]">首次加载约 10-15 秒</p>
          </div>
        )}

        {/* 文章列表 */}
        {!loading && !seeding && (
          <div className="grid gap-5">
            {articles.map((article, index) => (
              <Link
                key={article.id}
                href={`/blog/${article.id}`}
                className="group block bg-white dark:bg-[#1c1c1e] rounded-[20px] p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#ff6b6b] to-[#ee5a24] flex items-center justify-center text-white text-[15px] font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2 group-hover:text-[#ff6b6b] transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-[14px] text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                  <div className="flex-shrink-0 self-center text-[#86868b] group-hover:text-[#ff6b6b] transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!loading && !seeding && articles.length === 0 && (
          <div className="text-center py-32">
            <p className="text-[17px] text-[#86868b] mb-4">暂无文章</p>
            <button
              onClick={seedArticles}
              className="px-5 py-2.5 rounded-full bg-[#ff6b6b] text-white text-[14px] font-medium hover:bg-[#ee5a24] transition-colors"
            >
              生成文章
            </button>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="border-t border-gray-200/60 dark:border-gray-800/60 py-8">
        <div className="max-w-[980px] mx-auto px-6 text-center">
          <p className="text-[12px] text-[#86868b]">
            © 2026 哄哄模拟器 · 用理解和幽默经营每一段关系
          </p>
        </div>
      </footer>
    </div>
  );
}