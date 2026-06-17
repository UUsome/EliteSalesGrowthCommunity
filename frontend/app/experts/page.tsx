"use client";

import { useEffect, useState } from "react";
import { experts as expertsApi } from "@/lib/api";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { ExpertCard } from "@/components/features/ExpertCard";

const fieldOptions = [
  { value: "", label: "全部领域" },
  { value: "大客户销售", label: "大客户销售" },
  { value: "SaaS销售", label: "SaaS销售" },
  { value: "渠道销售", label: "渠道销售" },
  { value: "电话销售", label: "电话销售" },
  { value: "国际贸易", label: "国际贸易" },
  { value: "门店零售", label: "门店零售" },
];

const sortOptions = [
  { value: "recommended", label: "综合推荐" },
  { value: "rating", label: "评分最高" },
  { value: "price_asc", label: "价格低→高" },
  { value: "price_desc", label: "价格高→低" },
  { value: "most_active", label: "最活跃" },
];

export default function ExpertsPage() {
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [field, setField] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

  useEffect(() => {
    setLoading(true);
    expertsApi
      .list({ field: field || undefined, sort_by: sortBy })
      .then(setExperts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [field, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">销售智库</h1>
        <p className="text-sm text-gray-500">连接顶尖销售专家，获取专业指导</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select
          options={fieldOptions}
          value={field}
          onChange={(e) => setField(e.target.value)}
          className="w-40"
        />
        <Select
          options={sortOptions}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-40"
        />
      </div>

      {loading ? (
        <Loading className="min-h-[40vh]" size="lg" text="加载中..." />
      ) : experts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">暂无专家信息</p>
          <p className="text-sm">请调整筛选条件或稍后再来</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experts.map((e) => (
            <ExpertCard key={e.id} expert={e} />
          ))}
        </div>
      )}
    </div>
  );
}
