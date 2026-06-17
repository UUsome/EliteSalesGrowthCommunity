"use client";

import { AdminEntityList } from "@/components/admin/entity-list";

export default function AdminContentPage() {
  return (
    <AdminEntityList
      title="内容管理"
      entity="content"
      fields={[
        { key: "id", label: "ID", width: 60 },
        { key: "title", label: "标题" },
        { key: "content_type", label: "类型" },
        { key: "author", label: "作者" },
        { key: "view_count", label: "浏览" },
        { key: "like_count", label: "点赞" },
        { key: "is_active", label: "显示", render: (v: boolean) => v ? "✅ 显示" : "⛔ 隐藏" },
      ]}
      softDelete
    />
  );
}
