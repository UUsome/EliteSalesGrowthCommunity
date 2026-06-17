"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { discovery as discoveryApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { ExpertCard } from "@/components/features/ExpertCard";
import { JobCard } from "@/components/features/JobCard";
import { ContentCard } from "@/components/features/ContentCard";

interface DiscoveryData {
  hot_discussions: any[];
  expert_picks: any[];
  hot_jobs: any[];
  featured_content: any[];
  essence_discussions: any[];
}

export default function HomePage() {
  const [data, setData] = useState<DiscoveryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    discoveryApi
      .get()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading className="min-h-[60vh]" size="lg" text="加载中..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Hero */}
      <section className="relative rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 p-8 md:p-12 text-white overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            精英销售成长社区
          </h1>
          <p className="text-brand-100 text-base md:text-lg mb-6">
            发现知识 · 连接专家 · 交流经验 · 成就职业
          </p>
          <div className="flex gap-3">
            <Link href="/experts">
              <Button variant="secondary" size="lg">找专家</Button>
            </Link>
            <Link href="/posts">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                逛社区
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 opacity-10">
          <div className="grid grid-cols-8 gap-4 p-8">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
            ))}
          </div>
        </div>
      </section>

      {/* 行业动态（替换原来的热门销售问题） */}
      {data?.hot_discussions && data.hot_discussions.length > 0 && (
        <section>
          <SectionHeader title="📰 行业动态" href="/posts?category=行业动态" />
          <div className="grid grid-cols-1 gap-3">
            {data.hot_discussions.map((d: any) => (
              <Link key={d.id} href={`/posts/${d.id}`}>
                <Card hover>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{d.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <Badge variant="info" size="sm">{d.category}</Badge>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-400 shrink-0">
                      <div>👍 {d.like_count}</div>
                      <div>💬 {d.comment_count}</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Expert Picks */}
      {data?.expert_picks && data.expert_picks.length > 0 && (
        <section>
          <SectionHeader title="📚 销售智库" href="/experts" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.expert_picks.map((e: any) => (
              <ExpertCard key={e.id} expert={e} />
            ))}
          </div>
        </section>
      )}

      {/* Hot Jobs */}
      {data?.hot_jobs && data.hot_jobs.length > 0 && (
        <section>
          <SectionHeader title="💼 人才集市" href="/jobs" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.hot_jobs.map((j: any) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Content */}
      {data?.featured_content && data.featured_content.length > 0 && (
        <section>
          <SectionHeader title="📖 内容精选" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.featured_content.map((c: any) => (
              <ContentCard key={c.id} item={c} />
            ))}
          </div>
        </section>
      )}

      {/* 精华讨论 */}
      {data?.essence_discussions && data.essence_discussions.length > 0 && (
        <section>
          <SectionHeader title="⭐ 精华讨论" href="/posts?sort_by=essence" />
          <div className="grid grid-cols-1 gap-3">
            {data.essence_discussions.map((d: any) => (
              <Link key={d.id} href={`/posts/${d.id}`}>
                <Card hover>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{d.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <Badge variant="warning" size="sm">精华</Badge>
                        <Badge variant="info" size="sm">{d.category}</Badge>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-400 shrink-0">
                      <div>👍 {d.like_count}</div>
                      <div>💬 {d.comment_count}</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {href && (
        <Link href={href} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
          查看更多 →
        </Link>
      )}
    </div>
  );
}
