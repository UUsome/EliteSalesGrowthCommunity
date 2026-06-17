"use client";

import { useEffect, useState } from "react";
import { admin } from "@/lib/admin-api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Loading } from "@/components/ui/Loading";
import { ApiError } from "@/lib/api";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    admin.listSettings().then((data) => {
      setSettings(data);
      const v: Record<string, string> = {};
      data.forEach((s: any) => { v[s.key] = s.value || ""; });
      setValues(v);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async (key: string) => {
    setSaving(key); setError(""); setSuccess("");
    try {
      await admin.updateSetting(key, values[key] || null);
      setSuccess(`「${key}」已保存`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "保存失败");
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <Loading className="py-20" />;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">站点设置</h2>

      {error && <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
      {success && <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 rounded-lg">{success}</div>}

      <div className="space-y-6">
        {/* Contact Us editor */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">「联系我们」页面内容</h3>
            <p className="text-sm text-gray-400">key: contact_us</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={values["contact_us"] || ""}
              onChange={(e) => setValues({ ...values, contact_us: e.target.value })}
              placeholder='支持 Markdown 格式。例如：
## 联系我们

**公司地址**：上海市浦东新区张江高科技园区
**联系电话**：021-12345678
**邮箱**：contact@elitesales.com

### 工作时间
周一至周五 9:00-18:00'
              rows={12}
            />
            <Button onClick={() => handleSave("contact_us")} loading={saving === "contact_us"}>
              保存
            </Button>
          </CardContent>
        </Card>

        {/* Other settings placeholder */}
        {settings.filter((s) => s.key !== "contact_us").length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">其他设置</h3>
            {settings.filter((s) => s.key !== "contact_us").map((s: any) => (
              <Card key={s.key}>
                <CardHeader>
                  <h4 className="font-medium text-gray-900">{s.key}</h4>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    value={values[s.key] || ""}
                    onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}
                    rows={6}
                  />
                  <Button onClick={() => handleSave(s.key)} loading={saving === s.key}>
                    保存
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
