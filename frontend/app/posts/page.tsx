"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { posts as postsApi } from "@/lib/api";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { PostCard } from "@/components/features/PostCard";
import { useAuth } from "@/lib/auth-context";
import { useSearchParams } from "next/navigation";

const tabs = [
  { value: "latest", label: "最新" },
  { value: "hot", label: "热门" },
  { value: "essence", label: "精华" },
];

const categoryTabs = [
  { value: "", label: "全部" },
  { value: "经验分享", label: "经验分享" },
  { value: "求助提问", label: "求助提问" },
  { value: "行业动态", label: "行业动态" },
];

export default function PostsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(searchParams?.get("sort_by") || "latest");
  const [category, setCategory] = useState(searchParams?.get("category") || "");

  useEffect(() => {
    setLoading(true);
    postsApi
      .list({
        sort_by: sortBy,
        category: category || undefined,
      })
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sortBy, category]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">同行交流</h1>
          <p className="text-sm text-gray-500 mt-1">销售茶馆 — 聊聊销售那些事</p>
        </div>
        {user && (
          <Link href="/posts/create">
            <Button>发布帖子</Button>
          </Link>
        )}
      </div>

      {/* Sort tabs */}
      <Tabs tabs={tabs} active={sortBy} onChange={setSortBy} className="mb-4" />

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categoryTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setCategory(tab.value)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              category === tab.value
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading className="min-h-[40vh]" size="lg" text="加载中..." />
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">暂无帖子</p>
          <p className="text-sm">
            {user ? (
              <Link href="/posts/create" className="text-brand-600">
                成为第一个发帖的人
              </Link>
            ) : (
              "登录后即可发帖交流"
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
