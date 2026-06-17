"use client";

import { AdminEntityList } from "@/components/admin/entity-list";

export default function AdminContactsPage() {
  return (
    <AdminEntityList
      title="联系人管理"
      entity="contacts"
      fields={[
        { key: "id", label: "ID", width: 60 },
        { key: "name", label: "姓名" },
        { key: "title", label: "职位" },
        { key: "company", label: "公司" },
        { key: "mobile", label: "手机号" },
        { key: "wechat", label: "微信" },
        { key: "email", label: "邮箱" },
        { key: "is_active", label: "显示", render: (v: boolean) => v ? "✅ 显示" : "⛔ 隐藏" },
      ]}
      editFields={[
        { key: "id", label: "ID", width: 60 },
        { key: "name", label: "姓名" },
        { key: "title", label: "职位" },
        { key: "company", label: "公司" },
        { key: "mobile", label: "手机号" },
        { key: "wechat", label: "微信" },
        { key: "qq", label: "QQ" },
        { key: "email", label: "邮箱" },
        { key: "remark", label: "备注", type: "textarea" },
        { key: "is_active", label: "显示", type: "bool" },
      ]}
      softDelete
    />
  );
}
