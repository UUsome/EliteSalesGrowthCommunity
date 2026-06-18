"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { jobs as jobsApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageLoading } from "@/components/ui/Loading";
import { formatSalary, formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    jobsApi
      .get(Number(params.id))
      .then(setJob)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <PageLoading />;
  if (!job) return <div className="text-center py-16 text-gray-400">职位不存在</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardContent>
          <div className="flex flex-wrap items-start gap-2 mb-3">
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            {job.is_urgent && <Badge variant="danger" size="md">急招</Badge>}
            {job.is_referral && <Badge variant="warning" size="md">内推</Badge>}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
            <span className="font-semibold text-gray-700">{job.company_name}</span>
            <span>📍 {job.location}{job.is_remote ? " (支持远程)" : ""}</span>
          </div>

          <div className="text-2xl font-bold text-brand-600 mb-4">
            {job.salary_display || formatSalary(job.salary_min, job.salary_max)}
          </div>

          {job.special_requirements && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1">特殊需求</h3>
              <p className="text-sm text-gray-600">{job.special_requirements}</p>
            </div>
          )}

          {job.description && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1">职位描述</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{job.description}</p>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-2">职位负责人</h3>
            <p className="text-sm text-gray-600">
              {job.contact_name}{job.contact_title ? ` · ${job.contact_title}` : ""}
            </p>
            <div className="mt-3 flex gap-3">
              <Button
                variant="outline"
                // onClick={() => router.push(user ? `/experts` : "/login")}
                onClick={() => {
                  if (!user) return router.push("/login");
                  router.push(`/experts/${job.contact_id || 1}`);
                }}
              >
                快速咨询
              </Button>
              <span className="text-xs text-gray-400 self-center ml-auto">
                发布于 {formatRelativeTime(job.created_at)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
