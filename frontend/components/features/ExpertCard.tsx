"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, renderStars, truncate } from "@/lib/utils";

interface ExpertCardProps {
  expert: {
    id: number;
    name: string;
    avatar_url: string | null;
    field: string;
    one_liner: string | null;
    rating: number;
    price: number;
    rating_count?: number;
    consultation_count?: number;
  };
}

export function ExpertCard({ expert }: ExpertCardProps) {
  return (
    <Link href={`/experts/${expert.id}`}>
      <Card hover className="h-full">
        <CardContent className="flex gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-lg font-bold">
              {expert.name[0]}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 truncate">
                {expert.name}
              </h4>
              <Badge variant="primary" size="sm">
                {expert.field}
              </Badge>
            </div>
            {expert.one_liner && (
              <p className="text-sm text-gray-500 mb-2">
                {truncate(expert.one_liner, 50)}
              </p>
            )}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-amber-500" title={`${expert.rating}分`}>
                {renderStars(expert.rating)}
              </span>
              <span className="text-gray-400">
                {expert.rating.toFixed(1)}
              </span>
              <span className="text-brand-600 font-semibold ml-auto">
                {formatPrice(expert.price)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
