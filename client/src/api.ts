import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  category: string | null;
  stock: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: Pick<Product, "id" | "name" | "price" | "images" | "stock">;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  lowStockProducts: number;
  totalRevenue: number;
  revenueToday: number;
  revenueThisMonth: number;
  revenueThisYear: number;
  ordersByStatus: { status: string; count: number }[];
  productsByCategory: { category: string; count: number }[];
  recentOrders: Order[];
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ success: boolean; data: { token: string; user: Omit<User, "createdAt"> } }>("/auth/login", { email, password }).then((r) => r.data),

  register: (name: string, email: string, password: string, role?: string) =>
    api.post<{ success: boolean; data: { token: string; user: Omit<User, "createdAt"> } }>("/auth/register", { name, email, password, role }).then((r) => r.data),

  getProfile: () =>
    api.get<{ success: boolean; data: User }>("/auth/profile").then((r) => r.data),

  updateProfile: (data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) =>
    api.put<{ success: boolean; data: User }>("/auth/profile", data).then((r) => r.data),
};

export const productsApi = {
  getAll: (params?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<{ success: boolean; data: Product[]; pagination: Pagination }>("/products", { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Product }>(`/products/${id}`).then((r) => r.data),

  create: (formData: FormData) =>
    api.post<{ success: boolean; data: Product }>("/products", formData).then((r) => r.data),

  update: (id: string, formData: FormData) =>
    api.put<{ success: boolean; data: Product }>(`/products/${id}`, formData).then((r) => r.data),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/products/${id}`).then((r) => r.data),
};

export const cartApi = {
  get: () =>
    api.get<{ success: boolean; data: Cart }>("/cart").then((r) => r.data),

  add: (productId: string, quantity = 1) =>
    api.post<{ success: boolean; data: CartItem }>("/cart", { productId, quantity }).then((r) => r.data),

  update: (productId: string, quantity: number) =>
    api.put<{ success: boolean; data: CartItem }>(`/cart/${productId}`, { quantity }).then((r) => r.data),

  remove: (productId: string) =>
    api.delete<{ success: boolean; message: string }>(`/cart/${productId}`).then((r) => r.data),
};

export const adminApi = {
  getStats: () =>
    api.get<{ success: boolean; data: DashboardStats }>("/admin/stats").then((r) => r.data),

  getUsers: () =>
    api.get<{ success: boolean; data: User[] }>("/admin/users").then((r) => r.data),

  deleteUser: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/admin/users/${id}`).then((r) => r.data),

  getActivityLogs: (page = 1, limit = 20) =>
    api.get<{ success: boolean; data: ActivityLogEntry[]; pagination: Pagination }>(`/admin/activity-logs?page=${page}&limit=${limit}`).then((r) => r.data),
};

export interface ActivityLogEntry {
  _id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  details?: string;
  createdAt: string;
}

export const reviewsApi = {
  getByProduct: (productId: string) =>
    api.get<{ success: boolean; data: ReviewEntry[] }>(`/reviews/product/${productId}`).then((r) => r.data),

  create: (productId: string, rating: number, comment: string) =>
    api.post<{ success: boolean; data: ReviewEntry }>("/reviews", { productId, rating, comment }).then((r) => r.data),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/reviews/${id}`).then((r) => r.data),
};

export interface ReviewEntry {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface OrderItemEntry {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: Pick<Product, "id" | "name" | "price" | "images">;
}

export interface Order {
  id: string;
  userId: string;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItemEntry[];
  user?: Pick<User, "id" | "email" | "name">;
  createdAt: string;
  updatedAt: string;
}

export const ordersApi = {
  create: (paymentMethod: string) =>
    api.post<{ success: boolean; data: Order }>("/orders", { paymentMethod }).then((r) => r.data),

  getMyOrders: () =>
    api.get<{ success: boolean; data: Order[] }>("/orders").then((r) => r.data),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Order }>(`/orders/${id}`).then((r) => r.data),
};

export const adminOrdersApi = {
  getAll: () =>
    api.get<{ success: boolean; data: Order[] }>("/admin/orders").then((r) => r.data),

  updateStatus: (id: string, data: { status?: string; paymentStatus?: string }) =>
    api.patch<{ success: boolean; data: Order }>(`/admin/orders/${id}/status`, data).then((r) => r.data),
};
