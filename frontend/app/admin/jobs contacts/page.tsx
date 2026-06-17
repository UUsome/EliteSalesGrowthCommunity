"use client";

import { AdminEntityList } from "@/components/admin/entity-list";

export default function AdminContactsPage() {
  return (
    <AdminEntityList
      title="联系人管理"
      entity="jobs_contacts"
      fields={[
        { key: "id", label: "ID", width: 60 },
        { key: "name", label: "姓名" },
        { key: "mobile", label: "手机号" },
        { key: "wechat", label: "微信" },
        { key: "qq", label: "QQ" },
        { key: "tags", label: "标签" },
        { key: "contact_type", label: "类型" },
        { key: "is_active", label: "显示", render: (v: boolean) => v ? "✅ 显示" : "⛔ 隐藏" },
      ]}
      editFields={[
        { key: "id", label: "ID", width: 60 },
        { key: "name", label: "姓名" },
        { key: "mobile", label: "手机号" },
        { key: "wechat", label: "微信" },
        { key: "qq", label: "QQ" },
        { key: "tags", label: "标签" },
        { key: "contact_type", label: "联系方式类型" },
        { key: "remark", label: "备注", type: "textarea" },
        { key: "is_active", label: "显示", type: "bool" },
      ]}
      softDelete
    />
  );
}
