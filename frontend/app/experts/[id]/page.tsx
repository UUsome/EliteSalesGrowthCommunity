"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { experts as expertsApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageLoading } from "@/components/ui/Loading";
import { formatPrice, renderStars, formatRelativeTime } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

export default function ExpertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [expert, setExpert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    expertsApi
      .get(Number(params.id))
      .then(setExpert)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <PageLoading />;
  if (!expert)
    return <div className="text-center py-16 text-gray-400">专家不存在</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row gap-6">
          <div className="shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-3xl font-bold mx-auto sm:mx-0">
              {expert.name?.[0] || "专"}
            </div>
          </div>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex flex-wrap items-center gap-2 mb-2 justify-center sm:justify-start">
              <h1 className="text-2xl font-bold text-gray-900">
                {expert.name}
              </h1>
              <Badge variant="primary">{expert.field}</Badge>
            </div>
            {expert.one_liner && (
              <p className="text-gray-600 mb-2">{expert.one_liner}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 justify-center sm:justify-start">
              <span className="text-amber-500">
                {renderStars(expert.rating)} {expert.rating.toFixed(1)}
              </span>
              {/*<span>⭐ {expert.rating_count || 0} 条评价</span>
              <span>📞 {expert.consultation_count || 0} 次咨询</span>*/}
              {expert.experience_years && (
                <span>🎯 {expert.experience_years} 年经验</span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
              <span className="text-2xl font-bold text-brand-600">
                {formatPrice(expert.price)}
              </span>
              <span className="text-sm text-gray-400">/ 次咨询</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {expert.description && (
        <Card>
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-2">关于专家</h3>
            <div className="text-sm text-gray-600 whitespace-pre-line">
              <MarkdownRenderer content={expert.description} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Times */}
      {/*{expert.availabilities?.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-3">可预约时间</h3>
            <div className="flex flex-wrap gap-2">
              {expert.availabilities.map((av: any) => (
                <span
                  key={av.id}
                  className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg border border-green-200"
                >
                  {
                    ["周一", "周二", "周三", "周四", "周五", "周六", "周日"][
                      av.day_of_week
                    ]
                  }{" "}
                  {av.start_time}-{av.end_time}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}*/}

      {/* Cases */}
      {expert.cases?.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-3">代表案例</h3>
            <div className="space-y-4">
              {expert.cases.map((c: any) => (
                <div
                  key={c.id}
                  className="border border-gray-100 rounded-lg p-4"
                >
                  <h4 className="font-medium text-gray-900 mb-1">{c.title}</h4>
                  {c.description && (
                    <div className="text-sm text-gray-500">
                      <MarkdownRenderer content={c.description} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Q&A (folded) */}
      {/*<Card>
        <CardContent>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="font-semibold text-gray-900">历史解答</h3>
            <span className="text-sm text-brand-600">
              {showHistory ? "收起 ▲" : "展开 ▼"}
            </span>
          </button>
          {showHistory && (
            <div className="mt-3 space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">
                  暂无历史解答记录，联系专家后即可查看。
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>*/}

      {/* Reviews (folded) */}
      {/*<Card>
        <CardContent>
          <button
            onClick={() => setShowReviews(!showReviews)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="font-semibold text-gray-900">用户评价</h3>
            <span className="text-sm text-brand-600">
              {showReviews ? "收起 ▲" : "展开 ▼"}
            </span>
          </button>
          {showReviews && (
            <div className="mt-3 space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">
                  暂无评价，成为第一个评价的用户吧。
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>*/}

      {/* 联系方式 */}
      <Card>
        <CardContent>
          <button
            onClick={() => router.push("/contact")}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="font-semibold text-gray-900">联系方式</h3>
            <span className="text-sm text-brand-600">前往联系我们 ▶</span>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
