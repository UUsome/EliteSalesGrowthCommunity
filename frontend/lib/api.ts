"use client";

const API_BASE = "/api";

export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  if (options.body instanceof FormData) {
    delete (headers as Record<string, string>)["Content-Type"];
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, error.detail || "请求失败");
  }

  return res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Auth ──────────────────────────────────────────────
export const auth = {
  register: (data: { username: string; password: string; phone: string }) =>
    request<{ id: number; username: string; phone: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    return request<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });
  },

  getMe: () => request<{ id: number; username: string; phone: string; avatar_url: string | null }>("/auth/me"),

  updateProfile: (data: { username?: string; phone?: string; avatar_url?: string }) =>
    request<{ id: number; username: string; phone: string }>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  sendSms: (phone: string) =>
    request<{ message: string; debug_code?: string }>("/auth/sms/send", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),

  resetPassword: (phone: string, sms_code: string, new_password: string) =>
    request<{ id: number; username: string }>("/auth/password/reset", {
      method: "POST",
      body: JSON.stringify({ phone, sms_code, new_password }),
    }),
};

// ─── Discovery ─────────────────────────────────────────
export const discovery = {
  get: () =>
    request<{
      hot_discussions: { id: number; title: string; category: string; like_count: number; comment_count: number }[];
      essence_discussions: { id: number; title: string; category: string; like_count: number; comment_count: number }[];
      expert_picks: { id: number; name: string; avatar_url: string | null; field: string; one_liner: string | null; rating: number; price: number }[];
      hot_jobs: { id: number; title: string; company_name: string; location: string; salary_display: string | null; is_referral: boolean; is_urgent: boolean }[];
      featured_content: { id: number; title: string; content_type: string; summary: string | null; cover_image: string | null }[];
    }>("/discovery"),
};

// ─── Experts ───────────────────────────────────────────
export const experts = {
  list: (params?: { field?: string; price_min?: number; price_max?: number; rating_min?: number; sort_by?: string; skip?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.field) q.set("field", params.field);
    if (params?.price_min !== undefined) q.set("price_min", String(params.price_min));
    if (params?.price_max !== undefined) q.set("price_max", String(params.price_max));
    if (params?.rating_min !== undefined) q.set("rating_min", String(params.rating_min));
    if (params?.sort_by) q.set("sort_by", params.sort_by);
    if (params?.skip) q.set("skip", String(params.skip));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request<any[]>(`/experts${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => request<any>(`/experts/${id}`),

  create: (data: any) =>
    request<any>("/experts", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: any) =>
    request<any>(`/experts/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  addCase: (expertId: number, data: { title: string; description?: string; images?: string[] }) =>
    request<any>(`/experts/${expertId}/cases`, { method: "POST", body: JSON.stringify(data) }),

  addAvailability: (expertId: number, data: { day_of_week: number; start_time: string; end_time: string }) =>
    request<any>(`/experts/${expertId}/availabilities`, { method: "POST", body: JSON.stringify(data) }),
};

// ─── Jobs ──────────────────────────────────────────────
export const jobs = {
  list: (params?: { job_type?: string; industry?: string; city?: string; is_urgent?: boolean; is_referral?: boolean; skip?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.job_type) q.set("job_type", params.job_type);
    if (params?.industry) q.set("industry", params.industry);
    if (params?.city) q.set("city", params.city);
    if (params?.is_urgent !== undefined) q.set("is_urgent", String(params.is_urgent));
    if (params?.is_referral !== undefined) q.set("is_referral", String(params.is_referral));
    if (params?.skip) q.set("skip", String(params.skip));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request<any[]>(`/jobs${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => request<any>(`/jobs/${id}`),
};

// ─── Posts ─────────────────────────────────────────────
export const posts = {
  list: (params?: { category?: string; sort_by?: string; skip?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", params.category);
    if (params?.sort_by) q.set("sort_by", params.sort_by);
    if (params?.skip) q.set("skip", String(params.skip));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request<any[]>(`/posts${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => request<any>(`/posts/${id}`),

  create: (data: { title: string; content: string; category: string; is_anonymous?: boolean }) =>
    request<any>("/posts", { method: "POST", body: JSON.stringify(data) }),

  like: (id: number) =>
    request<any>(`/posts/${id}/like`, { method: "POST" }),

  getComments: (postId: number) => request<any[]>(`/posts/${postId}/comments`),

  createComment: (postId: number, data: { content: string; parent_id?: number }) =>
    request<any>(`/posts/${postId}/comments`, { method: "POST", body: JSON.stringify(data) }),
};

// ─── Content ───────────────────────────────────────────
export const contentApi = {
  list: (params?: { content_type?: string; skip?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.content_type) q.set("content_type", params.content_type);
    if (params?.skip) q.set("skip", String(params.skip));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request<any[]>(`/content${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => request<any>(`/content/${id}`),

  like: (id: number) => request<any>(`/content/${id}/like`, { method: "POST" }),
};

// ─── Bookings ──────────────────────────────────────────
// ─── Questions ─────────────────────────────────────────

// ─── Users ─────────────────────────────────────────────
export const users = {
  dashboard: () =>
    request<{
      question_count: number; pending_question_count: number;
      answer_count: number; accepted_answer_count: number;
      booking_count: number; pending_booking_count: number;
      favorite_count: number; unread_notification_count: number;
    }>("/users/dashboard"),

  myQuestions: (params?: { status?: string; skip?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.skip) q.set("skip", String(params.skip));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request<any[]>(`/users/questions${qs ? `?${qs}` : ""}`);
  },

  myAnswers: () => request<any[]>("/users/answers"),

  favorites: (params?: { target_type?: string; skip?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.target_type) q.set("target_type", params.target_type);
    if (params?.skip) q.set("skip", String(params.skip));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request<any[]>(`/users/favorites${qs ? `?${qs}` : ""}`);
  },

  toggleFavorite: (data: { target_type: string; target_id: number }) =>
    request<any | null>("/users/favorites", { method: "POST", body: JSON.stringify(data) }),

  notifications: (params?: { unread_only?: boolean; skip?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.unread_only) q.set("unread_only", "true");
    if (params?.skip) q.set("skip", String(params.skip));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request<any[]>(`/users/notifications${qs ? `?${qs}` : ""}`);
  },

  markNotificationRead: (id: number) =>
    request<any>(`/users/notifications/${id}/read`, { method: "PUT" }),

  markAllNotificationsRead: () =>
    request<{ message: string }>("/users/notifications/read-all", { method: "PUT" }),
};
