"use client";

import { useEffect, useState } from "react";
import { jobs as jobsApi } from "@/lib/api";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Loading } from "@/components/ui/Loading";
import { JobCard } from "@/components/features/JobCard";

const jobTypeOptions = [
  { value: "", label: "全部职位" },
  { value: "大客户销售", label: "大客户销售" },
  { value: "SaaS销售", label: "SaaS销售" },
  { value: "渠道经理", label: "渠道经理" },
  { value: "电话销售", label: "电话销售" },
  { value: "销售总监", label: "销售总监" },
];

const industryOptions = [
  { value: "", label: "全部行业" },
  { value: "互联网", label: "互联网" },
  { value: "金融", label: "金融" },
  { value: "医疗", label: "医疗" },
  { value: "制造", label: "制造" },
  { value: "教育", label: "教育" },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobType, setJobType] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    setLoading(true);
    jobsApi
      .list({
        job_type: jobType || undefined,
        industry: industry || undefined,
        city: city || undefined,
      })
      .then(setJobs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [jobType, industry, city]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">人才集市</h1>
        <p className="text-sm text-gray-500">发现优质销售职位，内推直通车</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select
          options={jobTypeOptions}
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="w-36"
        />
        <Select
          options={industryOptions}
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-36"
        />
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="搜索城市..."
          className="w-36"
        />
      </div>

      {loading ? (
        <Loading className="min-h-[40vh]" size="lg" text="加载中..." />
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">暂无招聘职位</p>
          <p className="text-sm">请调整筛选条件或稍后再来</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {jobs.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
        </div>
      )}
    </div>
  );
}
