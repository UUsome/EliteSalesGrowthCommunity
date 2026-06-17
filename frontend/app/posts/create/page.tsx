"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { posts as postsApi, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";

const categories = [
  { value: "经验分享", label: "经验分享" },
  { value: "求助提问", label: "求助提问" },
  { value: "行业动态", label: "行业动态" },
];

export default function CreatePostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("经验分享");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const post = await postsApi.create({ title, content, category, is_anonymous: isAnonymous });
      router.push(`/posts/${post.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "发布失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-gray-900">发布帖子</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
            )}
            <Select
              options={categories}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="分类"
            />
            <Input
              id="title"
              label="标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="请输入帖子标题"
            />
            <Textarea
              id="content"
              label="正文"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="分享你的经验、提出问题或讨论行业动态..."
              rows={8}
            />
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-gray-300"
              />
              匿名发布
            </label>
            <Button type="submit" loading={submitting} className="w-full">
              发布
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
