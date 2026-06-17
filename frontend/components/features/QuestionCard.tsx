"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";

interface QuestionCardProps {
  question: {
    id: number;
    title: string;
    view_count: number;
    answer_count?: number;
    status?: string;
  };
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Link href={`/questions/${question.id}`}>
      <Card hover>
        <CardContent>
          <h4 className="font-medium text-gray-900 mb-1.5">{question.title}</h4>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>👁 {question.view_count} 次围观</span>
            {question.answer_count !== undefined && (
              <span>💬 {question.answer_count} 个回答</span>
            )}
            {question.status === "resolved" && (
              <span className="text-green-600 font-medium">已解决</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
