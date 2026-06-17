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
        { key: "price", label: "价格", render: (v: number) => `¥${v ?? 0}` },
        { key: "rating", label: "评分", render: (v: number) => `${v?.toFixed(1) || "-"}` },
        { key: "experience_years", label: "经验" },
        { key: "is_active", label: "显示", render: (v: boolean) => v ? "✅ 显示" : "⛔ 隐藏" },
      ]}
      softDelete
    />
  );
}
