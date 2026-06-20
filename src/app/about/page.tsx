import { Footer } from "@/components/Footer";
import { Heart, MessageCircle, Sparkles } from "lucide-react";

const VALUES = [
  {
    icon: Heart,
    title: "用心沟通",
    desc: "吵架不可怕，不会哄才尴尬。我们帮你在一个安全的环境里练习表达关心。",
  },
  {
    icon: MessageCircle,
    title: "真实体验",
    desc: "高仿微信界面 + AI 实时对话，像真的在和 Ta 聊天，而不是做选择题。",
  },
  {
    icon: Sparkles,
    title: "轻松有趣",
    desc: "怒气值可视化、多种难度和声音，把「哄人」变成一场可以反复挑战的游戏。",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-[#f5f5f7] pt-14 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7]">
      <main className="px-6 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-[720px] text-center">
          <span className="mb-4 inline-block rounded-full bg-[#1d1d1f]/5 px-4 py-1.5 text-[13px] font-medium text-[#86868b] dark:bg-white/10 dark:text-[#a1a1a6]">
            关于我们
          </span>
          <h1 className="text-[36px] font-bold tracking-[-0.015em] sm:text-[48px]">
            让每一次道歉
            <br className="sm:hidden" />
            都更有诚意
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[#86868b] dark:text-[#a1a1a6]">
            哄哄模拟器是一款 AI 驱动的聊天练习工具。我们希望通过科技和一点幽默，帮助你在关系里学会更好地表达、倾听和化解矛盾。
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-[980px] gap-6 sm:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-[20px] bg-white p-8 shadow-sm dark:bg-[#1c1c1e]"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#fce4ec] to-[#ffe0e0] dark:from-[#2d1b2e] dark:to-[#3d1b2e]">
                <Icon className="h-6 w-6 text-[#ee5a24]" />
              </div>
              <h2 className="text-[17px] font-semibold">{title}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[#86868b] dark:text-[#a1a1a6]">
                {desc}
              </p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-16 max-w-[560px] text-center text-[14px] text-[#86868b] dark:text-[#a1a1a6]">
          有问题或合作意向？欢迎写信至{" "}
          <a href="mailto:yongbimsui9@gmail.com" className="text-[#ff6b6b] hover:underline">
            yongbimsui9@gmail.com
          </a>
        </p>
      </main>
      <Footer />
    </div>
  );
}
