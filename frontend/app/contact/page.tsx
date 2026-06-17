"use client";

import { useEffect, useState } from "react";
import { admin } from "@/lib/admin-api";
import { Card, CardContent } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";

export default function ContactPage() {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin.getPublicSetting("contact_us")
      .then((res) => setContent(res.value))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading className="min-h-[60vh]" size="lg" text="加载中..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Card>
        <CardContent className="prose prose-sm max-w-none">
          {content ? (
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {/* Simple markdown rendering: headings and bold */}
              {content.split("\n").map((line, i) => {
                if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-3">{line.slice(3)}</h2>;
                if (line.startsWith("### ")) return <h3 key={i} className="text-lg font-semibold text-gray-900 mt-4 mb-2">{line.slice(4)}</h3>;
                if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-gray-800 mb-2">{line.slice(2, -2)}</p>;
                if (line.trim() === "") return <br key={i} />;
                return <p key={i} className="mb-1.5">{line}</p>;
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg mb-2">📬 联系我们</p>
              <p>内容即将上线，敬请期待。</p>
              <p className="mt-6 text-sm">
                管理员请在后台"站点设置"中编辑此页面内容。
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
