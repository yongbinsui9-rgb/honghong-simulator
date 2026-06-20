"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Heart, Loader2 } from "lucide-react";

interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  created_at: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/blog?id=${params.id}`);
        const data = await res.json();
        if (data && data.title) {
          setArticle(data);
        }
      } catch {
        // 静默
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#f5f5f7] dark:bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ff6b6b] animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-dvh bg-[#f5f5f7] dark:bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-[17px] text-[#86868b]">文章不存在</p>
        <Link
          href="/blog"
          className="text-[14px] text-[#ff6b6b] hover:underline"
        >
          返回文章列表
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#f5f5f7] dark:bg-black">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-[680px] mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7] hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[13px] font-medium tracking-tight">返回</span>
          </button>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#ff6b6b]" />
            <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              恋爱攻略
            </span>
          </div>
        </div>
      </nav>

      <article className="max-w-[680px] mx-auto px-6 py-16">
        {/* 文章头部 */}
        <header className="mb-10">
          <div className="flex items-center gap-2 text-[12px] text-[#86868b] mb-4">
            <Link
              href="/blog"
              className="hover:text-[#ff6b6b] transition-colors"
            >
              恋爱攻略
            </Link>
            <span>·</span>
            <span>第 {article.id} 篇</span>
          </div>
          <h1 className="text-[32px] md:text-[40px] font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] leading-[1.15] mb-4">
            {article.title}
          </h1>
          <p className="text-[17px] text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
            {article.summary}
          </p>
        </header>

        {/* 文章正文 */}
        <div className="text-[16px] text-[#1d1d1f] dark:text-[#e5e5e7] leading-[1.75] space-y-5">
          {article.content.split("\n").map((paragraph, i) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return <br key={i} />;
            return (
              <p key={i}>
                {trimmed}
              </p>
            );
          })}
        </div>

        {/* 底部 CTA */}
        <div className="mt-16 pt-8 border-t border-gray-200/60 dark:border-gray-800/60 text-center">
          <p className="text-[14px] text-[#86868b] mb-4">
            光看攻略不够？去实战练练手
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#ee5a24] text-white text-[14px] font-semibold hover:shadow-lg hover:shadow-[#ff6b6b]/30 transition-all duration-300 active:scale-[0.97]"
          >
            <Heart className="w-4 h-4" />
            去哄 Ta
          </button>
        </div>
      </article>

      <Footer />
    </div>
  );
}