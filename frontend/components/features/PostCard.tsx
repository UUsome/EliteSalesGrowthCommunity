"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime, truncate } from "@/lib/utils";

interface PostCardProps {
  post: {
    id: number;
    title: string;
    content?: string;
    category: string;
    author_name: string | null;
    is_anonymous: boolean;
    like_count: number;
    comment_count: number;
    view_count: number;
    is_essence?: boolean;
    created_at: string;
  };
}

const categoryColors: Record<string, "primary" | "success" | "info"> = {
  "经验分享": "success",
  "求助提问": "primary",
  "行业动态": "info",
};

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.id}`}>
      <Card hover>
        <CardContent>
          <div className="flex items-start gap-2 mb-1.5">
            <Badge
              variant={categoryColors[post.category] || "default"}
              size="sm"
            >
              {post.category}
            </Badge>
            {post.is_essence && (
              <Badge variant="warning" size="sm">精华</Badge>
            )}
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">{post.title}</h4>
          {post.content && (
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              {truncate(post.content.replace(/<[^>]*>/g, ""), 120)}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>{post.is_anonymous ? "匿名用户" : post.author_name || "未知"}</span>
            <span>{formatRelativeTime(post.created_at)}</span>
            <span>👁 {post.view_count}</span>
            <span>👍 {post.like_count}</span>
            <span>💬 {post.comment_count}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
