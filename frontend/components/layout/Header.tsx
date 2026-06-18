"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "发现" },
  { href: "/experts", label: "销售智库" },
  { href: "/jobs", label: "人才集市" },
  { href: "/posts", label: "同行交流" },
];

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
            Elite Sales
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "text-brand-600 bg-brand-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/admin"
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname.startsWith("/admin")
                    ? "text-brand-600"
                    : "text-gray-400 hover:text-gray-700",
                )}
              >
                管理
              </Link>
              <Link
                href="/dashboard"
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname.startsWith("/dashboard")
                    ? "text-brand-600"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                {user.username}
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                退出
              </Button>
            </>
          ) : (
            <>
              {/*<Link href="/login">
                <Button variant="ghost" size="sm">
                  登录
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">注册</Button>
              </Link>*/}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
