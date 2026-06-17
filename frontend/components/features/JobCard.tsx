"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatSalary } from "@/lib/utils";

interface JobCardProps {
  job: {
    id: number;
    title: string;
    company_name: string;
    location: string;
    salary_display: string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    is_referral: boolean;
    is_urgent: boolean;
    special_requirements?: string | null;
  };
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card hover className="h-full">
        <CardContent>
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{job.title}</h4>
            <span className="text-brand-600 font-semibold whitespace-nowrap ml-2">
              {job.salary_display || formatSalary(job.salary_min, job.salary_max)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>{job.company_name}</span>
            <span className="text-gray-300">·</span>
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {job.is_urgent && (
              <Badge variant="danger" size="sm">急招</Badge>
            )}
            {job.is_referral && (
              <Badge variant="warning" size="sm">内推</Badge>
            )}
            {job.special_requirements && (
              <span className="text-xs text-gray-400 truncate max-w-[200px]">
                {job.special_requirements}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
