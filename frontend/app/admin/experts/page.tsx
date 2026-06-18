"use client";

import { AdminEntityList } from "@/components/admin/entity-list";

export default function AdminExpertsPage() {
  return (
    <AdminEntityList
      title="专家管理"
      entity="experts"
      fields={[
        { key: "id", label: "ID", width: 60 },
        { key: "name", label: "姓名" },
        { key: "field", label: "领域" },
        { key: "one_liner", label: "一句话简介" },
        { key: "price", label: "价格", render: (v: number) => `¥${v ?? 0}` },
        {
          key: "rating",
          label: "评分",
          render: (v: number) => `${v?.toFixed(1) || "-"}`,
        },
        { key: "experience_years", label: "经验" },
        { key: "consultation_count", label: "咨询次数" },
        {
          key: "is_active",
          label: "显示",
          render: (v: boolean) => (v ? "✅ 显示" : "⛔ 隐藏"),
        },
      ]}
      editFields={[
        { key: "id", label: "ID", width: 60 },
        { key: "name", label: "姓名" },
        { key: "field", label: "领域" },
        { key: "one_liner", label: "一句话简介" },
        { key: "description", label: "详细描述", type: "textarea" },
        { key: "price", label: "价格" },
        { key: "rating", label: "评分" },
        { key: "experience_years", label: "经验" },
        { key: "consultation_count", label: "咨询次数" },
        { key: "is_active", label: "显示", type: "bool" },
      ]}
      softDelete
    />
  );
}
