"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { posts as postsApi, ApiError } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { PageLoading } from "@/components/ui/Loading";
import { formatRelativeTime, truncate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    Promise.all([
      postsApi.get(Number(params.id)),
      postsApi.getComments(Number(params.id)),
    ])
      .then(([p, c]) => {
        setPost(p);
        setComments(c);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleLike = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const updated = await postsApi.like(post.id);
      setPost({ ...post, like_count: updated.like_count });
    } catch {}
  };

  const handleComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const newComment = await postsApi.createComment(post.id, { content: commentText });
      setComments([...comments, newComment]);
      setCommentText("");
      setPost({ ...post, comment_count: (post.comment_count || 0) + 1 });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "评论失败");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoading />;
  if (!post) return <div className="text-center py-16 text-gray-400">帖子不存在</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      {/* Post */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="primary" size="sm">{post.category}</Badge>
            {post.is_essence && <Badge variant="warning" size="sm">精华</Badge>}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h1>
          <div className="text-sm text-gray-600 mb-4 whitespace-pre-line">{post.content}</div>
          <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-100 pt-3">
            <span>{post.is_anonymous ? "匿名用户" : post.author_name || "未知"}</span>
            <span>{formatRelativeTime(post.created_at)}</span>
            <span>👁 {post.view_count}</span>
            <button onClick={handleLike} className="hover:text-brand-600 transition-colors">
              👍 {post.like_count}
            </button>
            <span className="ml-auto">💬 {post.comment_count}</span>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardContent>
          <h3 className="font-semibold text-gray-900 mb-4">
            评论 ({comments.length})
          </h3>

          {comments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">暂无评论，来说两句吧</p>
          ) : (
            <div className="space-y-4 mb-6">
              {comments.map((c) => (
                <div key={c.id} className="border-b border-gray-50 pb-3 last:border-0">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <span className="font-medium text-gray-600">{c.author_name}</span>
                    <span>{formatRelativeTime(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700">{c.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Comment form */}
          {user && (
            <form onSubmit={handleComment} className="space-y-3">
              {error && (
                <div className="p-2 text-xs text-red-600 bg-red-50 rounded">{error}</div>
              )}
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="写下你的评论..."
                rows={3}
                required
              />
              <Button type="submit" loading={submitting} size="sm">
                发表评论
              </Button>
            </form>
          )}
          {!user && (
            <p className="text-sm text-gray-400 text-center">
              <button
                onClick={() => router.push("/login")}
                className="text-brand-600 hover:underline"
              >
                登录
              </button>{" "}
              后即可评论
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
