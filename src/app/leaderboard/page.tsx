"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LeaderboardPage() {
  return (
    <div className="min-h-dvh bg-[#f5f5f7] dark:bg-black">
      {/* 导航 */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[#d2d2d7]/30 bg-[#f5f5f7]/80 backdrop-blur-xl dark:border-[#38383a]/30 dark:bg-black/80">
        <div className="mx-auto flex h-[48px] max-w-[980px] items-center justify-between px-5">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 overflow-hidden rounded-full bg-gradient-to-br from-[#ff6b6b] to-[#ee5a24] p-0.5">
                <div className="h-full w-full rounded-full bg-white dark:bg-black" />
              </div>
              <span className="text-[14px] font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                哄哄模拟器
              </span>
            </Link>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 text-[13px] font-medium text-[#86868b] transition-colors hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            返回首页
          </Link>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="mx-auto max-w-[980px] px-5 pt-[96px]">
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6b6b]/10 to-[#ee5a24]/10">
            <svg className="h-10 w-10 text-[#ff6b6b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.896m0 0a6.023 6.023 0 01-2.77-.896" />
            </svg>
          </div>
          <h1 className="mb-3 text-[28px] font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            排行榜
          </h1>
          <p className="max-w-sm text-[15px] leading-relaxed text-[#86868b]">
            哄人高手排行榜正在筹备中，敬请期待...
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/"
              className="rounded-full bg-[#1d1d1f] px-6 py-2.5 text-[13px] font-medium text-white transition-all hover:opacity-80 dark:bg-white dark:text-[#1d1d1f]"
            >
              返回首页
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}