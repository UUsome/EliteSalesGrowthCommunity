"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { truncate } from "@/lib/utils";

interface ContentCardProps {
  item: {
    id: number;
    title: string;
    content_type: string;
    summary: string | null;
    cover_image: string | null;
  };
}

const typeColors: Record<string, "primary" | "success" | "info"> = {
  销售资料: "primary",
  成功案例: "success",
  产品更新: "info",
};

export function ContentCard({ item }: ContentCardProps) {
  return (
    <Link href={`/content/${item.id}`}>
      <Card hover className="h-full">
        {/*<div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex items-center justify-center text-gray-400 text-sm">
          {item.cover_image ? (
            <img
              src={item.cover_image}
              alt={item.title}
              className="w-full h-full object-cover rounded-t-xl"
            />
          ) : (
            <span>📄 {item.content_type}</span>
          )}
        </div>*/}
        <CardContent>
          <Badge
            variant={typeColors[item.content_type] || "default"}
            size="sm"
            className="mb-2"
          >
            {item.content_type}
          </Badge>
          <h4 className="font-semibold text-gray-900 text-sm leading-snug">
            {item.title}
          </h4>
          {item.summary && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {truncate(item.summary, 80)}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
