"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";
import { admin } from "@/lib/admin-api";
import { Loading } from "@/components/ui/Loading";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSuper, setIsSuper] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    // Check if superuser by calling admin dashboard
    admin.dashboard().then(() => setIsSuper(true)).catch(() => {
      router.push("/");
    });
  }, [user, authLoading, router]);

  if (authLoading || !isSuper) {
    return <Loading className="min-h-[60vh]" size="lg" text="验证权限..." />;
  }

  return <>{children}</>;
}
