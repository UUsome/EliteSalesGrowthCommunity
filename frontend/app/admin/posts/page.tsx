"use client";

import { AdminEntityList } from "@/components/admin/entity-list";

const TABLE_FIELDS = [
  { key: "id", label: "ID", width: 60 },
  { key: "title", label: "标题" },
  { key: "category", label: "分类" },
  {
    key: "is_essence",
    label: "精华",
    render: (v: boolean) => (
      <span
        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
          v ? "bg-yellow-100 text-yellow-700" : "text-gray-400"
        }`}
      >
        {v ? "⭐ 精华" : "-"}
      </span>
    ),
  },
  {
    key: "is_hot",
    label: "热门",
    render: (v: boolean) => (
      <span
        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
          v ? "bg-red-100 text-red-700" : "text-gray-400"
        }`}
      >
        {v ? "🔥 热帖" : "-"}
      </span>
    ),
  },
  {
    key: "is_anonymous",
    label: "匿名",
    render: (v: boolean) => (
      <span
        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
          v ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"
        }`}
      >
        {v ? "匿名" : "公开"}
      </span>
    ),
  },
  { key: "view_count", label: "浏览" },
  { key: "like_count", label: "点赞" },
  { key: "comment_count", label: "评论" },
  {
    key: "created_at",
    label: "发布时间",
    render: (v: string) => {
      if (!v) return "-";
      return new Date(v).toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
];

const EDIT_FIELDS = [
  { key: "title", label: "标题", type: "text" as const },
  { key: "content", label: "正文", type: "textarea" as const },
  {
    key: "category",
    label: "分类",
    type: "select" as const,
    options: [
      { value: "经验分享", label: "经验分享" },
      { value: "求助提问", label: "求助提问" },
      { value: "行业动态", label: "行业动态" },
    ],
  },
  { key: "is_essence", label: "精华帖", type: "bool" as const },
  { key: "is_hot", label: "热门帖", type: "bool" as const },
  { key: "is_anonymous", label: "匿名发布", type: "bool" as const },
  { key: "view_count", label: "浏览量", type: "number" as const },
  { key: "like_count", label: "点赞数", type: "number" as const },
  { key: "comment_count", label: "评论数", type: "number" as const },
];

export default function AdminPostsPage() {
  return (
    <AdminEntityList
      title="帖子管理"
      entity="posts"
      fields={TABLE_FIELDS}
      editFields={EDIT_FIELDS}
      noCreate
    />
  );
}
