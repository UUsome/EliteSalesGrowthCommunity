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
        { key: "job_type", label: "职位类型" },
        { key: "salary_min", label: "薪资下限" },
        { key: "salary_max", label: "薪资上限" },
        { key: "contact_name", label: "联系人" },
        { key: "is_urgent", label: "急招", render: (v: boolean) => v ? "⚡" : "-" },
        { key: "is_active", label: "显示", render: (v: boolean) => v ? "✅ 显示" : "⛔ 隐藏" },
      ]}
      editFields={[
        { key: "id", label: "ID", width: 60 },
        { key: "title", label: "职位名称" },
        { key: "company_name", label: "公司" },
        { key: "location", label: "地点" },
        { key: "job_type", label: "职位类型" },
        { key: "industry", label: "行业" },
        { key: "salary_min", label: "薪资下限" },
        { key: "salary_max", label: "薪资上限" },
        { key: "description", label: "岗位描述", type: "textarea" },
        { key: "special_requirements", label: "特殊要求", type: "textarea" },
        { key: "tags", label: "标签" },
        { key: "contact_name", label: "联系人" },
        { key: "contact_title", label: "联系人职位" },
        { key: "contact_id", label: "联系人ID" },
        { key: "contact_type", label: "联系方式类型" },
        { key: "remark", label: "备注", type: "textarea" },
        { key: "is_urgent", label: "急招", type: "bool" },
        { key: "is_remote", label: "是否远程", type: "bool" },
        { key: "is_referral", label: "内推", type: "bool" },
        { key: "is_anonymous", label: "匿名", type: "bool" },
        { key: "is_active", label: "显示", type: "bool" },
      ]}
      softDelete
    />
  );
}
