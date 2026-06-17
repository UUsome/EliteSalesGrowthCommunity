"use client";

import { useEffect, useState, type FormEvent } from "react";
import { admin } from "@/lib/admin-api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { ApiError } from "@/lib/api";

interface FieldConfig {
  key: string;
  label: string;
  width?: number;
  render?: (value: any, item: any) => React.ReactNode;
  type?: "text" | "number" | "textarea" | "select" | "bool";
  options?: { value: string; label: string }[];
}

interface Props {
  title: string;
  entity: string;
  fields: FieldConfig[];
  editFields?: FieldConfig[]; // 编辑表单专用字段，不传则用 fields
  softDelete?: boolean;
  noCreate?: boolean;
}

const fieldTypes: Record<string, string> = {
  id: "number",
  name: "text",
  field: "text",
  one_liner: "text",
  price: "number",
  rating: "number",
  experience_years: "number",
  consultation_count: "number",
  response_rate: "number",
  title: "text",
  company_name: "text",
  location: "text",
  contact_name: "text",
  contact_title: "text",
  contact_id: "number",
  special_requirements: "textarea",
  description: "textarea",
  content: "textarea",
  summary: "textarea",
  is_urgent: "bool",
  is_referral: "bool",
  is_remote: "bool",
  is_anonymous: "bool",
  is_essence: "bool",
  is_hot: "bool",
  is_active: "bool",
  author: "text",
  category: "select",
  content_type: "select",
  industry: "text",
  job_type: "text",
  salary_min: "number",
  salary_max: "number",
  view_count: "number",
  like_count: "number",
  comment_count: "number",
  favorite_count: "number",
  days_ago: "number",
  mobile: "text",
  wechat: "text",
  qq: "text",
  tags: "text",
  contact_type: "number",
  remark: "textarea",
};

export function AdminEntityList({
  title,
  entity,
  fields,
  editFields,
  softDelete,
  noCreate,
}: Props) {
  const formFields = editFields || fields;

  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const load = () => {
    setLoading(true);
    admin
      .listEntities(entity, { search: search || undefined })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [search]);

  const handleDelete = async (id: number) => {
    if (softDelete) {
      if (!confirm(`确认隐藏此记录？隐藏后前端将不再显示。`)) return;
    } else {
      if (!confirm(`确认删除此记录？此操作不可撤销。`)) return;
    }
    try {
      if (softDelete) {
        await admin.deleteEntity(entity, id);
      } else {
        await admin.deleteEntity(entity, id);
      }
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "操作失败");
    }
  };

  const handleToggleActive = async (id: number, current: boolean) => {
    try {
      await admin.updateEntity(entity, id, { is_active: !current });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "切换失败");
    }
  };

  const openEdit = (item: any) => {
    const data: Record<string, any> = {};
    formFields.forEach((f) => {
      data[f.key] = item[f.key] ?? "";
    });
    formFields.forEach((f) => {
      const ft = fieldTypes[f.key] || "text";
      if (ft === "bool") data[f.key] = !!item[f.key];
    });
    setFormData(data);
    setEditId(item.id);
  };

  const cleanFormData = (data: Record<string, any>) => {
    const clean: Record<string, any> = {};
    Object.entries(data).forEach(([k, v]) => {
      const ft = fieldTypes[k] || "text";
      if (ft === "number") clean[k] = v === "" || v === null ? null : Number(v);
      else if (ft === "bool")
        clean[k] = v === true || v === "true" ? true : false;
      else clean[k] = v;
    });
    return clean;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const clean = cleanFormData(formData);
      if (editId) {
        await admin.updateEntity(entity, editId, clean);
      } else {
        await admin.createEntity(entity, clean);
      }
      setEditId(null);
      setShowCreate(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "保存失败");
    }
  };

  const openCreate = () => {
    const data: Record<string, any> = {};
    formFields.forEach((f) => {
      data[f.key] = "";
    });
    formFields.forEach((f) => {
      const ft = fieldTypes[f.key] || "text";
      if (ft === "bool") data[f.key] = false;
    });
    setFormData(data);
    setEditId(null);
    setShowCreate(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-400">共 {total} 条</p>
        </div>
        <div className="flex gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索..."
            className="w-48"
          />
          {!noCreate && <Button onClick={openCreate}>新增</Button>}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {(showCreate || editId) && (
        <Card className="mb-6 border-brand-200">
          <CardHeader>
            <h3 className="font-semibold">
              {editId ? `编辑 #${editId}` : `新增${title}`}
            </h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {formFields
                  .filter((f) => f.key !== "id")
                  .map((f) => (
                    <div
                      key={f.key}
                      className={
                        f.type === "textarea" ||
                        fieldTypes[f.key] === "textarea"
                          ? "col-span-2"
                          : ""
                      }
                    >
                      <FormField
                        field={f}
                        value={formData[f.key] ?? ""}
                        onChange={(v) =>
                          setFormData({ ...formData, [f.key]: v })
                        }
                      />
                    </div>
                  ))}
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit">{editId ? "保存" : "创建"}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreate(false);
                    setEditId(null);
                  }}
                >
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Loading className="py-20" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {fields.map((f) => (
                  <th
                    key={f.key}
                    className="text-left px-4 py-3 font-medium whitespace-nowrap"
                    style={{ width: f.width }}
                  >
                    {f.label}
                  </th>
                ))}
                <th className="text-right px-4 py-3 font-medium whitespace-nowrap">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={fields.length + 1}
                    className="text-center py-12 text-gray-400"
                  >
                    暂无数据
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {fields.map((f) => (
                      <td
                        key={f.key}
                        className="px-4 py-3 text-gray-900 max-w-[250px] truncate"
                      >
                        {f.render
                          ? f.render(item[f.key], item)
                          : String(item[f.key] ?? "-")}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(item)}
                      >
                        编辑
                      </Button>
                      {softDelete && item.is_active !== undefined && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleToggleActive(item.id, item.is_active)
                          }
                        >
                          {item.is_active ? "隐藏" : "显示"}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDelete(item.id)}
                      >
                        {softDelete ? "隐藏" : "删除"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FormField({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: any;
  onChange: (v: any) => void;
}) {
  const type = field.type || fieldTypes[field.key] || "text";

  if (type === "bool") {
    return (
      <label className="flex items-center gap-2 text-sm cursor-pointer pt-6">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-gray-300"
        />
        {field.label}
      </label>
    );
  }

  if (type === "select") {
    const options = field.options || [
      { value: "经验分享", label: "经验分享" },
      { value: "求助提问", label: "求助提问" },
      { value: "行业动态", label: "行业动态" },
    ];
    return (
      <Select
        options={[{ value: "", label: `选择${field.label}` }, ...options]}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        label={field.label}
      />
    );
  }

  if (type === "textarea") {
    return (
      <Textarea
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        label={field.label}
        rows={4}
      />
    );
  }

  return (
    <Input
      type={type === "number" ? "number" : "text"}
      value={String(value ?? "")}
      onChange={(e) =>
        onChange(
          type === "number"
            ? e.target.value
              ? Number(e.target.value)
              : ""
            : e.target.value,
        )
      }
      label={field.label}
      step={type === "number" ? "any" : undefined}
    />
  );
}
