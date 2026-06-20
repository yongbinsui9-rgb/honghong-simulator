"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/pricing", label: "价格" },
  { href: "/blog", label: "博客" },
  { href: "/about", label: "关于我们" },
] as const;

function NavLink({
  href,
  label,
  active,
  onClick,
  className,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "text-[15px] font-medium transition-colors sm:text-[13px]",
        active
          ? "text-[#1d1d1f] dark:text-[#f5f5f7]"
          : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]",
        className
      )}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0";
    setUser(null);
    setMenuOpen(false);
  };

  const scrollToStart = () => {
    setMenuOpen(false);
    if (pathname === "/") {
      document.getElementById("start-section")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-[#f5f5f7]/80 backdrop-blur-xl dark:border-white/5 dark:bg-black/80">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <img
              src="/logo-icon.jpeg"
              alt=""
              className="h-7 w-7 rounded-lg object-cover sm:h-6 sm:w-6"
            />
            <span className="text-[15px] font-semibold tracking-tight sm:text-sm">
              哄哄模拟器
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="主导航">
            {NAV_LINKS.map(({ href, label }) => (
              <NavLink key={href} href={href} label={label} active={isActive(href)} />
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <>
                <span className="text-[13px] text-[#86868b]">👋 {user.username}</span>
                <button
                  onClick={handleLogout}
                  className="text-[13px] font-medium text-[#86868b] transition-colors hover:text-red-500"
                >
                  退出
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-[#1d1d1f] px-5 py-2 text-[13px] font-medium text-white transition-all hover:opacity-85 dark:bg-white dark:text-[#1d1d1f]"
              >
                登录
              </Link>
            )}
            {pathname === "/" && (
              <button
                onClick={scrollToStart}
                className="rounded-full border border-[#d2d2d7] px-5 py-2 text-[13px] font-medium text-[#1d1d1f] transition-all hover:bg-black/5 dark:border-[#38383a] dark:text-[#f5f5f7] dark:hover:bg-white/10"
              >
                开始体验
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#1d1d1f] transition-colors hover:bg-black/5 dark:text-[#f5f5f7] dark:hover:bg-white/10 md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile overlay menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <nav
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(85vw,320px)] flex-col border-l border-black/5 bg-[#f5f5f7] px-6 py-6 shadow-2xl transition-transform duration-300 ease-out dark:border-white/10 dark:bg-[#1c1c1e] md:hidden",
          menuOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="移动端导航"
        aria-hidden={!menuOpen}
      >
        <div className="mt-14 flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <NavLink
              key={href}
              href={href}
              label={label}
              active={isActive(href)}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3 py-3.5 text-[17px] hover:bg-black/5 dark:hover:bg-white/5"
            />
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-black/5 pt-6 dark:border-white/10">
          {user ? (
            <>
              <p className="px-3 text-[14px] text-[#86868b]">👋 {user.username}</p>
              <button
                onClick={handleLogout}
                className="rounded-xl px-3 py-3.5 text-left text-[17px] font-medium text-red-500 transition-colors hover:bg-red-500/5"
              >
                退出登录
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl bg-[#1d1d1f] px-4 py-3.5 text-center text-[17px] font-medium text-white transition-all hover:opacity-90 dark:bg-white dark:text-[#1d1d1f]"
            >
              登录
            </Link>
          )}
          {pathname === "/" ? (
            <button
              onClick={scrollToStart}
              className="rounded-xl border border-[#d2d2d7] px-4 py-3.5 text-[17px] font-medium text-[#1d1d1f] transition-all hover:bg-black/5 dark:border-[#38383a] dark:text-[#f5f5f7] dark:hover:bg-white/10"
            >
              开始体验
            </button>
          ) : (
            <Link
              href="/#start-section"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl border border-[#d2d2d7] px-4 py-3.5 text-center text-[17px] font-medium text-[#1d1d1f] transition-all hover:bg-black/5 dark:border-[#38383a] dark:text-[#f5f5f7] dark:hover:bg-white/10"
            >
              开始体验
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
