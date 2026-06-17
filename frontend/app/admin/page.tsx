"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { admin } from "@/lib/admin-api";
import { Loading } from "@/components/ui/Loading";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "概览", icon: "📊" },
  { href: "/admin/users", label: "用户管理", icon: "👤" },
  { href: "/admin/experts", label: "专家管理", icon: "📚" },
  { href: "/admin/jobs", label: "职位管理", icon: "💼" },
  { href: "/admin/posts", label: "帖子管理", icon: "💬" },
  { href: "/admin/content", label: "内容管理", icon: "📖" },
  { href: "/admin/settings", label: "站点设置", icon: "⚙️" },
];

export default function AdminPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    admin.dashboard().then(setData).catch(() => router.push("/")).finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) return <Loading className="min-h-[60vh]" size="lg" text="加载管理后台..." />;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 min-h-screen shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Link href="/admin" className="text-lg font-bold text-brand-600">
            Admin Panel
          </Link>
          <p className="text-xs text-gray-400 mt-1">{user?.username}</p>
        </div>
        <nav className="p-2 space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Button variant="ghost" size="sm" onClick={() => { logout(); router.push("/"); }}>
            ← 返回前台
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">管理后台</h1>

          {/* Stats Grid */}
          {data && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Object.entries(data).map(([key, count]) => (
                <Card key={key}>
                  <CardContent>
                    <p className="text-sm text-gray-500 capitalize">{key}</p>
                    <p className="text-3xl font-bold text-brand-600 mt-1">{count}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {navItems.slice(1).map((item) => (
              <Link key={item.href} href={item.href}>
                <Card hover>
                  <CardContent className="flex items-center gap-4 py-6">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-400">点击管理 →</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
