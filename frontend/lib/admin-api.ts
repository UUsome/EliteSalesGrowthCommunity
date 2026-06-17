import { request } from "./api";

// ─── Admin API ─────────────────────────────────────────
export const admin = {
  dashboard: () => request<Record<string, number>>("/admin/dashboard"),

  // ── Users ──
  listUsers: (p?: { skip?: number; limit?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (p?.skip) q.set("skip", String(p.skip));
    if (p?.limit) q.set("limit", String(p.limit));
    if (p?.search) q.set("search", p.search);
    return request<any[]>(`/admin/users${q.toString() ? `?${q}` : ""}`);
  },
  getUser: (id: number) => request<any>(`/admin/users/${id}`),
  createUser: (data: any) =>
    request<any>("/admin/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id: number, data: any) =>
    request<any>(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUser: (id: number) =>
    request<void>(`/admin/users/${id}`, { method: "DELETE" }),

  // ── Entity List (GET) + Delete (DELETE) ──
  listEntities: (entity: string, p?: { skip?: number; limit?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (p?.skip) q.set("skip", String(p.skip));
    if (p?.limit) q.set("limit", String(p.limit));
    if (p?.search) q.set("search", p.search);
    return request<{ items: any[]; total: number }>(
      `/admin/${entity}${q.toString() ? `?${q}` : ""}`
    );
  },
  deleteEntity: (entity: string, id: number) =>
    request<void>(`/admin/${entity}/${id}`, { method: "DELETE" }),

  // ── Entity Create (POST) ──
  createEntity: (entity: string, data: any) =>
    request<any>(`/admin/${entity}`, { method: "POST", body: JSON.stringify(data) }),

  // ── Entity Update (PUT) ──
  updateEntity: (entity: string, id: number, data: any) =>
    request<any>(`/admin/${entity}/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // ── Settings ──
  listSettings: () => request<any[]>("/admin/settings"),
  updateSetting: (key: string, value: string | null) =>
    request<any>(`/admin/settings/${key}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    }),
  getPublicSetting: (key: string) => request<any>(`/admin/settings/public/${key}`),
};
