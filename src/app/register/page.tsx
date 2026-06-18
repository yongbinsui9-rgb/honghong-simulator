"use client";

import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const requiresTurnstile = Boolean(turnstileSiteKey);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次密码输入不一致");
      return;
    }

    if (requiresTurnstile && !turnstileToken) {
      setError("请完成人机验证");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, turnstileToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setTurnstileToken(null);
        turnstileRef.current?.reset();
        setError(data.error || "注册失败");
        return;
      }

      router.push("/");
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[#f5f5f7] dark:bg-black flex flex-col items-center justify-center px-6">
      <Link
        href="/"
        className="absolute top-6 left-6 text-sm text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
      >
        ← 返回首页
      </Link>

      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff6b6b] to-[#ee5a24] flex items-center justify-center shadow-lg">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
        </div>
        <h1 className="text-[28px] font-semibold text-center text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
          注册
        </h1>
        <p className="text-center text-sm text-[#86868b] mb-8">
          创建账号，开始你的哄人练习
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="2-50个字符"
              className="w-full px-4 py-3 rounded-xl border border-[#d2d2d7] dark:border-[#38383a] bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/30 focus:border-[#ff6b6b] transition-all"
              required
              minLength={2}
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="用于接收欢迎邮件"
              className="w-full px-4 py-3 rounded-xl border border-[#d2d2d7] dark:border-[#38383a] bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/30 focus:border-[#ff6b6b] transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少6位"
              className="w-full px-4 py-3 rounded-xl border border-[#d2d2d7] dark:border-[#38383a] bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/30 focus:border-[#ff6b6b] transition-all"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
              确认密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
              className="w-full px-4 py-3 rounded-xl border border-[#d2d2d7] dark:border-[#38383a] bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/30 focus:border-[#ff6b6b] transition-all"
              required
            />
          </div>

          {turnstileSiteKey && (
            <div className="flex justify-center">
              <Turnstile
                ref={turnstileRef}
                siteKey={turnstileSiteKey}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || (requiresTurnstile && !turnstileToken)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ff6b6b] to-[#ee5a24] text-white font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? "注册中..." : "注册"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#86868b]">
          已有账号？{" "}
          <Link
            href="/login"
            className="text-[#ff6b6b] hover:text-[#ee5a24] transition-colors font-medium"
          >
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}
