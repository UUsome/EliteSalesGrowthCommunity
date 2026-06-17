"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { users as usersApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { PageLoading } from "@/components/ui/Loading";
import { formatRelativeTime, cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const dashboardTabs = [
  { value: "overview", label: "概览" },
  { value: "questions", label: "我的提问" },
  
  { value: "favorites", label: "我的收藏" },
  { value: "notifications", label: "通知" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboard, setDashboard] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  const [favorites, setFavorites] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    Promise.all([
      usersApi.dashboard(),
      usersApi.myQuestions(),
      
      usersApi.favorites(),
      usersApi.notifications(),
    ])
      .then(([d, q, f, n]) => {
        setDashboard(d);
        setQuestions(q);
        setFavorites(f);
        setNotifications(n);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) return <PageLoading />;
  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">个人中心</h1>
        <p className="text-sm text-gray-500 mt-1">
          欢迎回来，{user.username}
        </p>
      </div>

      <Tabs tabs={dashboardTabs} active={activeTab} onChange={setActiveTab} className="mb-6" />

      {/* Overview */}
      {activeTab === "overview" && dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="我的提问" value={dashboard.question_count} sub={`${dashboard.pending_question_count} 待回答`} />
          <StatCard label="我的回答" value={dashboard.answer_count} sub={`${dashboard.accepted_answer_count} 被采纳`} />
          
          <StatCard label="未读通知" value={dashboard.unread_notification_count} sub="点击查看" color="red" />
        </div>
      )}

      {/* My Questions */}
      {activeTab === "questions" && (
        <div className="space-y-3">
          {questions.length === 0 ? (
            <p className="text-center py-12 text-gray-400">暂无提问</p>
          ) : (
            questions.map((q) => (
              <Card key={q.id}>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{q.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {q.answer_count} 个回答 · {formatRelativeTime(q.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant={q.status === "resolved" ? "success" : q.status === "expired" ? "default" : "warning"}
                    size="sm"
                  >
                    {q.status === "pending" ? "待回答" : q.status === "resolved" ? "已解决" : "已过期"}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}



      {/* My Favorites */}
      {activeTab === "favorites" && (
        <div className="space-y-3">
          {favorites.length === 0 ? (
            <p className="text-center py-12 text-gray-400">暂无收藏</p>
          ) : (
            favorites.map((f) => (
              <Card key={f.id}>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">{f.target_type}</Badge>
                    <span className="text-sm text-gray-500">
                      收藏于 {formatRelativeTime(f.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Notifications */}
      {activeTab === "notifications" && (
        <div className="space-y-2">
          {notifications.length > 0 && (
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await usersApi.markAllNotificationsRead();
                  setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
                }}
              >
                全部已读
              </Button>
            </div>
          )}
          {notifications.length === 0 ? (
            <p className="text-center py-12 text-gray-400">暂无通知</p>
          ) : (
            notifications.map((n) => (
              <Card key={n.id} className={cn(!n.is_read && "border-brand-200 bg-brand-50/30")}>
                <CardContent className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 mt-1.5 rounded-full shrink-0",
                      n.is_read ? "bg-gray-300" : "bg-brand-500"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 text-sm">{n.title}</h4>
                      <span className="text-xs text-gray-400">{formatRelativeTime(n.created_at)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{n.content}</p>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={async () => {
                        await usersApi.markNotificationRead(n.id);
                        setNotifications(
                          notifications.map((nn) =>
                            nn.id === n.id ? { ...nn, is_read: true } : nn
                          )
                        );
                      }}
                      className="text-xs text-brand-600 hover:underline shrink-0"
                    >
                      标记已读
                    </button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number;
  sub?: string;
  color?: string;
}) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p
          className={`text-2xl font-bold ${
            color === "red" ? "text-red-600" : "text-brand-600"
          }`}
        >
          {value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}
