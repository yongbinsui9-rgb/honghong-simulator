"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart, Volume2, Sparkles, Zap, Skull,
  MessageCircle, Brain, ChevronRight, Phone,
  ArrowDown
} from "lucide-react";
import { useState, useEffect } from "react";

const VOICE_OPTIONS = {
  girlfriend: [
    { id: "zh_female_xiaohe_uranus_bigtts", label: "温柔女声", emoji: "🌸" },
    { id: "zh_female_vv_uranus_bigtts", label: "霸道御姐", emoji: "👑" },
    { id: "saturn_zh_female_keainvsheng_tob", label: "可爱软妹", emoji: "🎀" },
  ],
  boyfriend: [
    { id: "zh_male_m191_uranus_bigtts", label: "低沉男声", emoji: "🎙️" },
    { id: "zh_male_taocheng_uranus_bigtts", label: "温柔男声", emoji: "☕" },
  ],
};

const DIFFICULTIES = [
  { id: "easy", label: "简单", emoji: "😊", desc: "Ta 比较好哄，说几句好话就消气", icon: Sparkles },
  { id: "normal", label: "一般", emoji: "😐", desc: "需要认真用心才能哄好", icon: Heart },
  { id: "hard", label: "魔鬼", emoji: "😈", desc: "很难哄，说错话会更生气", icon: Zap },
  { id: "hell", label: "地狱", emoji: "💀", desc: "极度难哄，动不动就爆炸", icon: Skull },
];

const FEATURES = [
  {
    icon: MessageCircle,
    title: "真实微信界面",
    desc: "高仿微信聊天气泡、头像、时间戳、输入状态，像真的在哄一个在意的人。",
    image: "/feature-chat.jpeg",
  },
  {
    icon: Brain,
    title: "AI 智能扮演",
    desc: "大语言模型实时驱动，说法阴阳怪气、翻旧账、偶尔心软，和真人一模一样。",
  },
  {
    icon: Heart,
    title: "语音 + 难度可调",
    desc: "温柔女声到低沉男声，简单到地狱四级难度，每一次体验都不同。",
  },
];

const STEPS = [
  { emoji: "🎭", title: "选择角色与声音", desc: "选谁在生气？女朋友还是男朋友？再选 Ta 的声音" },
  { emoji: "🎯", title: "选择难度", desc: "从简单到地狱，决定 Ta 有多难哄" },
  { emoji: "💬", title: "自由聊天哄 Ta", desc: "不用选择题，直接打字，AI 实时回应，怒气降到 0 就赢" },
];

export default function HomePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"girlfriend" | "boyfriend" | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);

  // 检查登录状态
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  // 登出
  const handleLogout = async () => {
    document.cookie = "token=; path=/; max-age=0";
    setUser(null);
  };

  const handleStart = async () => {
    if (!selectedRole || !selectedVoice || !selectedDifficulty) return;
    setLoading(true);

    sessionStorage.setItem("honghong_voice", selectedVoice);
    sessionStorage.setItem("honghong_difficulty", selectedDifficulty);

    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成场景失败");
      sessionStorage.setItem("honghong_scenario", JSON.stringify(data.scenario));
      sessionStorage.setItem("honghong_role", selectedRole);
      sessionStorage.setItem(
        "honghong_anger",
        String(typeof data.initialAnger === "number" ? data.initialAnger : 100)
      );
      router.push("/chat");
    } catch {
      sessionStorage.setItem("honghong_role", selectedRole);
      router.push("/chat");
    }
  };

  const scrollToStart = () => {
    document.getElementById("start-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#f5f5f7] text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7]">
      {/* ========== Fixed Nav ========== */}
      <nav className="fixed left-0 right-0 top-0 z-50 flex h-12 items-center justify-between border-b border-black/5 bg-[#f5f5f7]/80 px-6 backdrop-blur-xl dark:border-white/5 dark:bg-black/80 sm:px-10">
        <div className="flex items-center gap-2.5">
          <img src="/logo-icon.jpeg" alt="" className="h-6 w-6 rounded-lg object-cover" />
          <span className="text-sm font-semibold tracking-tight">哄哄模拟器</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            className="hidden text-[13px] font-medium text-[#86868b] transition-colors hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] sm:block"
          >
            恋爱攻略
          </Link>
          <Link
            href="/leaderboard"
            className="hidden text-[13px] font-medium text-[#86868b] transition-colors hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] sm:block"
          >
            排行榜
          </Link>
          {user ? (
            <>
              <span className="text-[13px] text-[#86868b]">
                👋 {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="text-[13px] font-medium text-[#86868b] transition-colors hover:text-red-500"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[13px] font-medium text-[#86868b] transition-colors hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="text-[13px] font-medium text-[#86868b] transition-colors hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
              >
                注册
              </Link>
            </>
          )}
          <button
            onClick={scrollToStart}
            className="rounded-full bg-[#1d1d1f] px-4 py-1.5 text-[13px] font-medium text-white transition-all hover:opacity-85 dark:bg-white dark:text-[#1d1d1f]"
          >
            开始体验
          </button>
        </div>
      </nav>

      {/* ========== Hero Section ========== */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16 sm:px-10">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#fce4ec]/60 via-[#f5f5f7] to-[#f5f5f7] dark:from-[#2d1b2e]/40 dark:via-black dark:to-black" />

        <div className="relative z-10 mx-auto flex w-full max-w-[980px] flex-col items-center text-center">
          <span className="mb-5 inline-block rounded-full bg-[#1d1d1f]/5 px-4 py-1.5 text-[13px] font-medium tracking-wide text-[#86868b] dark:bg-white/10 dark:text-[#a1a1a6]">
            AI 聊天模拟器
          </span>
          <h1 className="text-[52px] leading-[1.05] font-bold tracking-[-0.015em] sm:text-[64px] md:text-[72px]">
            <span className="text-red-500 dark:text-red-400">哄哄</span>
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              模拟器
            </span>
          </h1>
          <p className="mt-5 max-w-[600px] text-balance text-lg leading-relaxed text-[#86868b] dark:text-[#a1a1a6] sm:text-xl">
            AI 扮演你的另一半生气了。
            <br className="hidden sm:block" />
            在真实的聊天界面里，用真心话把 Ta 哄好吧。
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            <button
              onClick={scrollToStart}
              className="flex items-center gap-2 rounded-full bg-[#1d1d1f] px-8 py-3.5 text-[15px] font-semibold text-white transition-all hover:opacity-85 active:scale-[0.97] dark:bg-white dark:text-[#1d1d1f]"
            >
              开始体验
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={scrollToStart}
              className="flex items-center gap-2 rounded-full border border-[#d2d2d7] px-8 py-3.5 text-[15px] font-semibold text-[#1d1d1f] transition-all hover:bg-black/5 active:scale-[0.97] dark:border-[#38383a] dark:text-[#f5f5f7] dark:hover:bg-white/10"
            >
              了解更多
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative z-10 mt-16 w-full max-w-[780px]">
          <div className="overflow-hidden rounded-[20px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
            <img
              src="/hero-chat.jpeg"
              alt="哄哄模拟器 — 深夜聊天界面"
              className="h-auto w-full object-cover"
            />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="h-5 w-5 text-[#86868b]" />
        </div>
      </section>

      {/* ========== Features Section ========== */}
      <section className="px-6 py-28 sm:px-10">
        <div className="mx-auto max-w-[980px] text-center">
          <h2 className="text-[32px] font-bold tracking-[-0.003em] sm:text-[40px]">
            不止是聊天，
            <br className="sm:hidden" /> 是一次真实的情感练习
          </h2>
          <p className="mx-auto mt-4 max-w-[560px] text-[#86868b] dark:text-[#a1a1a6]">
            在安全的虚拟空间里，练习如何用心去安抚一个你在乎的人。
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-[1024px] gap-6 sm:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-[20px] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:bg-[#1c1c1e]"
              >
                {feature.image ? (
                  <div className="mb-6 overflow-hidden rounded-[14px]">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                ) : (
                  <div className="mb-6 flex h-44 w-full items-center justify-center rounded-[14px] bg-gradient-to-br from-[#fce4ec] to-[#ffe0e0] dark:from-[#2d1b2e] dark:to-[#3d1b2e]">
                    <Icon className="h-12 w-12 text-[#ee5a24]/80" />
                  </div>
                )}
                <h3 className="text-[17px] font-semibold">{feature.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#86868b] dark:text-[#a1a1a6]">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========== How It Works ========== */}
      <section className="bg-white px-6 py-28 dark:bg-[#1c1c1e] sm:px-10">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-center text-[32px] font-bold tracking-[-0.003em] sm:text-[40px]">
            三步开始
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-center text-[#86868b] dark:text-[#a1a1a6]">
            从选择角色到开始聊天，只需要三个步骤
          </p>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative text-center">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="absolute left-[60%] top-8 hidden h-px w-[80%] bg-[#d2d2d7] dark:bg-[#38383a] sm:block" />
                )}
                <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#fce4ec] to-[#ffe0e0] text-2xl dark:from-[#2d1b2e] dark:to-[#3d1b2e]">
                  {step.emoji}
                </div>
                <span className="mb-2 inline-block rounded-full bg-[#1d1d1f]/5 px-3 py-0.5 text-[12px] font-medium text-[#86868b] dark:bg-white/10 dark:text-[#a1a1a6]">
                  步骤 {i + 1}
                </span>
                <h3 className="mt-2 text-[17px] font-semibold">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-[260px] text-[14px] leading-relaxed text-[#86868b] dark:text-[#a1a1a6]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== Start Section (Selection Flow) ========== */}
      <section id="start-section" className="px-6 py-28 sm:px-10">
        <div className="mx-auto max-w-[520px]">
          <div className="text-center">
            <span className="mb-3 inline-block rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#ee5a24] px-4 py-1 text-[13px] font-medium text-white">
              开始
            </span>
            <h2 className="text-[32px] font-bold tracking-[-0.003em] sm:text-[36px]">
              准备好了吗？
            </h2>
            <p className="mt-3 text-[#86868b] dark:text-[#a1a1a6]">
              选择角色、声音和难度，开始你的哄人挑战
            </p>
          </div>

          <div className="mt-10 flex w-full flex-col gap-5">
            {/* Step 1: Role */}
            <div>
              <p className="mb-3 text-[13px] font-medium text-[#86868b]">
                ① 谁在生气？
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setSelectedRole("girlfriend"); setSelectedVoice(""); }}
                  className={`flex flex-1 items-center gap-3 rounded-[16px] border-2 p-5 text-left transition-all active:scale-[0.97] ${
                    selectedRole === "girlfriend"
                      ? "border-[#ff6b6b] bg-white shadow-sm dark:border-[#ee5a24] dark:bg-[#1c1c1e]"
                      : "border-[#d2d2d7] bg-white hover:border-[#b0b0b5] dark:border-[#38383a] dark:bg-[#1c1c1e] dark:hover:border-[#555]"
                  }`}
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fce4ec] to-[#ffd4d4] text-3xl dark:from-[#3d1b2e] dark:to-[#4d1b2e]">
                    👩
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold">女朋友</div>
                    <div className="mt-0.5 text-[13px] text-[#86868b]">我来扮演你的女朋友</div>
                  </div>
                </button>
                <button
                  onClick={() => { setSelectedRole("boyfriend"); setSelectedVoice(""); }}
                  className={`flex flex-1 items-center gap-3 rounded-[16px] border-2 p-5 text-left transition-all active:scale-[0.97] ${
                    selectedRole === "boyfriend"
                      ? "border-[#6c5ce7] bg-white shadow-sm dark:border-[#a29bfe] dark:bg-[#1c1c1e]"
                      : "border-[#d2d2d7] bg-white hover:border-[#b0b0b5] dark:border-[#38383a] dark:bg-[#1c1c1e] dark:hover:border-[#555]"
                  }`}
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e8e0ff] to-[#d4ccff] text-3xl dark:from-[#2d1b3e] dark:to-[#3d1b4e]">
                    👨
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold">男朋友</div>
                    <div className="mt-0.5 text-[13px] text-[#86868b]">我来扮演你的男朋友</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Voice */}
            {selectedRole && (
              <div>
                <p className="mb-3 text-[13px] font-medium text-[#86868b]">
                  ② Ta 的声音
                </p>
                <div className="flex gap-2">
                  {VOICE_OPTIONS[selectedRole].map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice.id)}
                      className={`flex flex-1 flex-col items-center gap-1.5 rounded-[14px] border-2 p-4 text-center transition-all active:scale-[0.97] ${
                        selectedVoice === voice.id
                          ? "border-[#1d1d1f] bg-white shadow-sm dark:border-white dark:bg-[#2c2c2e]"
                          : "border-[#d2d2d7] bg-white hover:border-[#b0b0b5] dark:border-[#38383a] dark:bg-[#1c1c1e] dark:hover:border-[#555]"
                      }`}
                    >
                      <Volume2 className={`h-5 w-5 ${selectedVoice === voice.id ? "text-[#1d1d1f] dark:text-white" : "text-[#86868b]"}`} />
                      <span className="text-xl">{voice.emoji}</span>
                      <span className="text-[13px] font-medium">{voice.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Difficulty */}
            {selectedRole && selectedVoice && (
              <div>
                <p className="mb-3 text-[13px] font-medium text-[#86868b]">
                  ③ 难度等级
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {DIFFICULTIES.map((diff) => {
                    const Icon = diff.icon;
                    const isSelected = selectedDifficulty === diff.id;
                    return (
                      <button
                        key={diff.id}
                        onClick={() => setSelectedDifficulty(diff.id)}
                        className={`flex items-center gap-2.5 rounded-[14px] border-2 p-3.5 text-left transition-all active:scale-[0.97] ${
                          isSelected
                            ? "border-[#ff6b6b] bg-white shadow-sm dark:border-[#ee5a24] dark:bg-[#2c2c2e]"
                            : "border-[#d2d2d7] bg-white hover:border-[#b0b0b5] dark:border-[#38383a] dark:bg-[#1c1c1e] dark:hover:border-[#555]"
                        }`}
                      >
                        <Icon className={`h-5 w-5 shrink-0 ${isSelected ? "text-[#ee5a24]" : "text-[#86868b]"}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[14px] font-semibold">
                              {diff.emoji} {diff.label}
                            </span>
                          </div>
                          <div className="mt-0.5 text-[12px] leading-tight text-[#86868b]">
                            {diff.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Start Button */}
            {selectedRole && selectedVoice && selectedDifficulty && (
              <button
                onClick={handleStart}
                disabled={loading}
                className="mt-2 w-full rounded-[16px] bg-gradient-to-r from-[#ff6b6b] to-[#ee5a24] py-4 text-[15px] font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    正在生成场景...
                  </span>
                ) : (
                  `开始哄${selectedRole === "girlfriend" ? "女朋友" : "男朋友"}`
                )}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ========== Footer ========== */}
      <footer className="border-t border-[#d2d2d7] px-6 py-10 dark:border-[#38383a]">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo-icon.jpeg" alt="" className="h-5 w-5 rounded object-cover" />
            <span className="text-[13px] font-medium text-[#86868b]">哄哄模拟器</span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/blog"
              className="text-[12px] text-[#86868b] transition-colors hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
            >
              恋爱攻略
            </Link>
            <span className="text-[12px] text-[#86868b]">
              支持男生哄女朋友 · 也支持女生哄男朋友
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}