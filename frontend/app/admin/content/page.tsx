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
        { key: "category", label: "分类" },
        { key: "author", label: "作者" },
        { key: "view_count", label: "浏览" },
        { key: "like_count", label: "点赞" },
        { key: "comment_count", label: "评论" },
        { key: "favorite_count", label: "收藏" },
        { key: "is_active", label: "显示", render: (v: boolean) => v ? "✅ 显示" : "⛔ 隐藏" },
      ]}
      editFields={[
        { key: "id", label: "ID", width: 60 },
        { key: "title", label: "标题" },
        { key: "content_type", label: "类型", type: "select", options: [
          { value: "经验分享", label: "经验分享" },
          { value: "求助提问", label: "求助提问" },
          { value: "行业动态", label: "行业动态" },
        ]},
        { key: "category", label: "分类", type: "select" },
        { key: "author", label: "作者" },
        { key: "content", label: "正文内容", type: "textarea" },
        { key: "summary", label: "摘要", type: "textarea" },
        { key: "view_count", label: "浏览" },
        { key: "like_count", label: "点赞" },
        { key: "comment_count", label: "评论数" },
        { key: "favorite_count", label: "收藏数" },
        { key: "is_essence", label: "精华", type: "bool" },
        { key: "is_hot", label: "热门", type: "bool" },
        { key: "is_active", label: "显示", type: "bool" },
      ]}
      softDelete
    />
  );
}
