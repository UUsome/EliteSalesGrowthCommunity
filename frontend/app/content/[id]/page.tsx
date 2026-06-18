"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { contentApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageLoading } from "@/components/ui/Loading";
import { formatRelativeTime } from "@/lib/utils";

const typeColors: Record<string, "primary" | "success" | "info"> = {
  销售资料: "primary",
  成功案例: "success",
  产品更新: "info",
};

export default function ContentDetailPage() {
  const params = useParams();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    contentApi
      .get(Number(params.id))
      .then(setContent)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleLike = async () => {
    if (!content) return;
    try {
      const updated = await contentApi.like(content.id);
      setContent({ ...content, like_count: updated.like_count });
    } catch {}
  };

  if (loading) return <PageLoading />;
  if (!content)
    return <div className="text-center py-16 text-gray-400">内容不存在</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Card>
        <CardContent>
          <Badge
            variant={typeColors[content.content_type] || "default"}
            size="md"
            className="mb-3"
          >
            {content.content_type}
          </Badge>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {content.title}
          </h1>
          {/*
          {content.cover_image && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img
                src={content.cover_image}
                alt={content.title}
                className="w-full object-cover max-h-96"
              />
            </div>
          )}*/}

          <div className="flex items-center gap-3 text-xs text-gray-400 mb-6">
            {content.author && <span>作者：{content.author}</span>}
            <span>{formatRelativeTime(content.created_at)}</span>
            <span>👁 {content.view_count}</span>
          </div>

          {content.summary && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-600 italic">
              {content.summary}
            </div>
          )}

          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
            {content.content}
          </div>

          <div className="flex items-center gap-4 mt-8 pt-4 border-t border-gray-100">
            <Button variant="outline" size="sm" onClick={handleLike}>
              👍 {content.like_count}
            </Button>
            <Button variant="outline" size="sm">
              🔖 收藏
            </Button>
            <Button variant="outline" size="sm">
              🔗 分享
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Related content placeholder */}
      <Card className="mt-6">
        <CardContent>
          <h3 className="font-semibold text-gray-900 mb-3">相关推荐</h3>
          <p className="text-sm text-gray-400">
            更多相关内容即将上线，敬请期待。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
