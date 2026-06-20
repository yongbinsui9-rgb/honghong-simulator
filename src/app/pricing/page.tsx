import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "免费版",
    price: "¥0",
    period: "永久免费",
    desc: "体验核心哄人玩法，随时开练。",
    features: ["每日 3 次对话", "基础 AI 角色", "标准难度"],
    cta: "免费开始",
    href: "/#start-section",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "¥19",
    period: "/ 月",
    desc: "无限练习，解锁全部声音与难度。",
    features: ["无限对话次数", "全部声音与难度", "对话历史保存", "优先响应速度"],
    cta: "即将上线",
    href: "/login",
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-dvh bg-[#f5f5f7] pt-14 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7]">
      <main className="px-6 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-[980px] text-center">
          <span className="mb-4 inline-block rounded-full bg-[#1d1d1f]/5 px-4 py-1.5 text-[13px] font-medium text-[#86868b] dark:bg-white/10 dark:text-[#a1a1a6]">
            价格
          </span>
          <h1 className="text-[36px] font-bold tracking-[-0.015em] sm:text-[48px]">
            简单透明的定价
          </h1>
          <p className="mx-auto mt-4 max-w-[520px] text-[#86868b] dark:text-[#a1a1a6]">
            先免费体验，觉得有用再升级。没有隐藏费用。
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-[720px] gap-6 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[20px] p-8 ${
                plan.highlighted
                  ? "bg-[#1d1d1f] text-white shadow-xl dark:bg-white dark:text-[#1d1d1f]"
                  : "bg-white shadow-sm dark:bg-[#1c1c1e]"
              }`}
            >
              <h2 className="text-[20px] font-semibold">{plan.name}</h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-[40px] font-bold tracking-tight">{plan.price}</span>
                <span
                  className={`text-[14px] ${
                    plan.highlighted ? "opacity-70" : "text-[#86868b] dark:text-[#a1a1a6]"
                  }`}
                >
                  {plan.period}
                </span>
              </div>
              <p
                className={`mt-3 text-[14px] ${
                  plan.highlighted ? "opacity-80" : "text-[#86868b] dark:text-[#a1a1a6]"
                }`}
              >
                {plan.desc}
              </p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-[14px]">
                    <Check
                      className={`h-4 w-4 shrink-0 ${
                        plan.highlighted ? "opacity-90" : "text-[#ff6b6b]"
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-8 flex w-full items-center justify-center rounded-full py-3 text-[15px] font-semibold transition-all hover:opacity-90 ${
                  plan.highlighted
                    ? "bg-white text-[#1d1d1f] dark:bg-[#1d1d1f] dark:text-white"
                    : "bg-[#1d1d1f] text-white dark:bg-white dark:text-[#1d1d1f]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
