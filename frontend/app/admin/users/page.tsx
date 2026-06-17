"use client";

import { useEffect, useState, type FormEvent } from "react";
import { admin } from "@/lib/admin-api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Loading } from "@/components/ui/Loading";
import { ApiError } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Create form
  const [cUsername, setCUsername] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [cSuper, setCSuper] = useState(false);

  // Edit form
  const [eUsername, setEUsername] = useState("");
  const [ePhone, setEPhone] = useState("");
  const [eActive, setEActive] = useState(true);
  const [eSuper, setESuper] = useState(false);

  const load = () => {
    setLoading(true);
    admin.listUsers({ search: search || undefined }).then(setUsers).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault(); setError("");
    try {
      await admin.createUser({ username: cUsername, password: cPassword, phone: cPhone, is_superuser: cSuper });
      setShowCreate(false); setCUsername(""); setCPhone(""); setCPassword(""); setCSuper(false);
      load();
    } catch (err) { setError(err instanceof ApiError ? err.message : "创建失败"); }
  };

  const handleEdit = async (id: number) => {
    setError("");
    try {
      await admin.updateUser(id, { username: eUsername, phone: ePhone, is_active: eActive, is_superuser: eSuper });
      setShowEdit(null); load();
    } catch (err) { setError(err instanceof ApiError ? err.message : "更新失败"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确认删除此用户？此操作不可撤销。")) return;
    try { await admin.deleteUser(id); load(); }
    catch (err) { setError(err instanceof ApiError ? err.message : "删除失败"); }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">用户管理</h2>
        <div className="flex gap-3">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索用户名/手机号..." className="w-60" />
          <Button onClick={() => setShowCreate(true)}>新增用户</Button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}

      {/* Create Modal */}
      {showCreate && (
        <Card className="mb-6 border-brand-200">
          <CardHeader><h3 className="font-semibold">新增用户</h3></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input id="cu" label="用户名" value={cUsername} onChange={(e) => setCUsername(e.target.value)} required />
                <Input id="cp" label="手机号" value={cPhone} onChange={(e) => setCPhone(e.target.value)} required />
              </div>
              <Input id="cpw" label="密码" type="password" value={cPassword} onChange={(e) => setCPassword(e.target.value)} required />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cSuper} onChange={(e) => setCSuper(e.target.checked)} className="rounded" /> 管理员</label>
              <div className="flex gap-3">
                <Button type="submit">创建</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>取消</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? <Loading className="py-20" /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-3 font-medium">ID</th>
                <th className="text-left px-4 py-3 font-medium">用户名</th>
                <th className="text-left px-4 py-3 font-medium">手机号</th>
                <th className="text-left px-4 py-3 font-medium">状态</th>
                <th className="text-left px-4 py-3 font-medium">角色</th>
                <th className="text-left px-4 py-3 font-medium">创建时间</th>
                <th className="text-right px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{u.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{u.username}</td>
                  <td className="px-4 py-3 text-gray-600">{u.phone}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.is_active ? "success" : "default"} size="sm">{u.is_active ? "正常" : "禁用"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {u.is_superuser && <Badge variant="warning" size="sm">管理员</Badge>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{u.created_at?.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { setShowEdit(u.id); setEUsername(u.username); setEPhone(u.phone); setEActive(u.is_active); setESuper(u.is_superuser); }}>编辑</Button>
                    <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(u.id)}>删除</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowEdit(null)}>
          <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader><h3 className="font-semibold">编辑用户</h3></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Input id="eu" label="用户名" value={eUsername} onChange={(e) => setEUsername(e.target.value)} />
                <Input id="eph" label="手机号" value={ePhone} onChange={(e) => setEPhone(e.target.value)} />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={eActive} onChange={(e) => setEActive(e.target.checked)} className="rounded" /> 启用</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={eSuper} onChange={(e) => setESuper(e.target.checked)} className="rounded" /> 管理员</label>
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => handleEdit(showEdit)}>保存</Button>
                  <Button variant="outline" onClick={() => setShowEdit(null)}>取消</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
