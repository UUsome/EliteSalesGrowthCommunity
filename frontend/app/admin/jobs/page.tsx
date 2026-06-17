"use client";

import { AdminEntityList } from "@/components/admin/entity-list";

export default function AdminJobsPage() {
  return (
    <AdminEntityList
      title="职位管理"
      entity="jobs"
      fields={[
        { key: "id", label: "ID", width: 60 },
        { key: "title", label: "职位名称" },
        { key: "company_name", label: "公司" },
        { key: "location", label: "地点" },
        { key: "contact_name", label: "联系人" },
        { key: "contact_title", label: "联系人职位" },
        { key: "contact_id", label: "联系人ID" },
        { key: "is_urgent", label: "急招", render: (v: boolean) => v ? "⚡" : "-" },
        { key: "is_active", label: "显示", render: (v: boolean) => v ? "✅ 显示" : "⛔ 隐藏" },
      ]}
      softDelete
    />
  );
}
