import { http, HttpResponse } from "msw";

const API_BASE = "http://localhost:5000/api";

export const mockProducts = [
  {
    id: "1",
    name: "MacBook Pro",
    description: "Powerful laptop",
    price: 1999.99,
    images: ["/uploads/laptop.jpg"],
    category: "Laptops",
    stock: 10,
    userId: "admin-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "iPhone 15",
    description: "Latest smartphone",
    price: 999.99,
    images: ["/uploads/iphone.jpg"],
    category: "Mobile",
    stock: 15,
    userId: "admin-1",
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Galaxy Tab",
    description: "Android tablet",
    price: 649.99,
    images: [],
    category: "Tablets",
    stock: 0,
    userId: "admin-1",
    createdAt: "2026-01-03T00:00:00.000Z",
    updatedAt: "2026-01-03T00:00:00.000Z",
  },
];

export const mockCart = {
  id: "cart-1",
  userId: "user-1",
  items: [
    {
      id: "ci-1",
      cartId: "cart-1",
      productId: "1",
      quantity: 2,
      product: {
        id: "1",
        name: "MacBook Pro",
        price: 1999.99,
        images: ["/uploads/laptop.jpg"],
        stock: 10,
      },
    },
  ],
  total: 3999.98,
};

export const mockOrders = [
  {
    id: "order-1",
    userId: "user-1",
    total: 1999.99,
    status: "PENDING",
    paymentMethod: "CASH",
    paymentStatus: "PENDING",
    items: [
      {
        id: "oi-1",
        productId: "1",
        quantity: 1,
        price: 1999.99,
        product: { id: "1", name: "MacBook Pro", price: 1999.99, images: ["/uploads/laptop.jpg"] },
      },
    ],
    user: { id: "user-1", email: "john@test.com", name: "John" },
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "order-2",
    userId: "user-1",
    total: 999.99,
    status: "DELIVERED",
    paymentMethod: "VISA",
    paymentStatus: "PAID",
    items: [
      {
        id: "oi-2",
        productId: "2",
        quantity: 1,
        price: 999.99,
        product: { id: "2", name: "iPhone 15", price: 999.99, images: ["/uploads/iphone.jpg"] },
      },
    ],
    user: { id: "user-1", email: "john@test.com", name: "John" },
    createdAt: "2026-01-05T00:00:00.000Z",
    updatedAt: "2026-01-07T00:00:00.000Z",
  },
];

export const mockUsers = [
  { id: "user-1", email: "john@test.com", name: "John", role: "CUSTOMER", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "admin-1", email: "admin@test.com", name: "Admin", role: "ADMIN", createdAt: "2026-01-01T00:00:00.000Z" },
];

export const mockReviews = [
  { _id: "rev-1", productId: "1", userId: "user-1", userName: "John", rating: 5, comment: "Great laptop!", createdAt: "2026-01-11T00:00:00.000Z" },
];

export const mockActivityLogs = [
  { _id: "log-1", userId: "admin-1", userEmail: "admin@test.com", action: "CREATE", resource: "Product", details: "Created MacBook Pro", createdAt: "2026-01-01T00:00:00.000Z" },
];

export const mockDashboardStats = {
  totalProducts: 10,
  totalUsers: 5,
  totalOrders: 20,
  lowStockProducts: 2,
  totalRevenue: 50000,
  revenueToday: 500,
  revenueThisMonth: 12000,
  revenueThisYear: 50000,
  ordersByStatus: [
    { status: "PENDING", count: 5 },
    { status: "CONFIRMED", count: 3 },
    { status: "SHIPPED", count: 2 },
    { status: "DELIVERED", count: 10 },
  ],
  productsByCategory: [
    { category: "Laptops", count: 3 },
    { category: "Mobile", count: 4 },
    { category: "Tablets", count: 2 },
    { category: "Smart Watches", count: 1 },
  ],
  recentOrders: mockOrders,
};

export const handlers = [
  http.get(`${API_BASE}/products`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const category = url.searchParams.get("category") || "";
    let filtered = [...mockProducts];
    if (category) filtered = filtered.filter((p) => p.category === category);
    return HttpResponse.json({
      success: true,
      data: filtered,
      pagination: { page, limit: 12, total: filtered.length, totalPages: 1 },
    });
  }),

  http.get(`${API_BASE}/products/:id`, ({ params }) => {
    const product = mockProducts.find((p) => p.id === params.id);
    if (!product) return HttpResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    return HttpResponse.json({ success: true, data: product });
  }),

  http.post(`${API_BASE}/products`, async () =>
    HttpResponse.json({ success: true, data: { ...mockProducts[0], id: "new-id" } }, { status: 201 })
  ),

  http.put(`${API_BASE}/products/:id`, async () =>
    HttpResponse.json({ success: true, data: { ...mockProducts[0] } })
  ),

  http.delete(`${API_BASE}/products/:id`, () =>
    HttpResponse.json({ success: true, message: "Product deleted" })
  ),

  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email?: string; password?: string };
    if (body.email === "admin@test.com" && body.password === "admin123") {
      return HttpResponse.json({
        success: true,
        data: { token: "mock-token-admin", user: { id: "admin-1", name: "Admin", email: "admin@test.com", role: "ADMIN" } },
      });
    }
    if (body.email === "john@test.com" && body.password === "john123") {
      return HttpResponse.json({
        success: true,
        data: { token: "mock-token-user", user: { id: "user-1", name: "John", email: "john@test.com", role: "CUSTOMER" } },
      });
    }
    return HttpResponse.json({ success: false, error: "Invalid email or password." }, { status: 401 });
  }),

  http.post(`${API_BASE}/auth/register`, async ({ request }) => {
    const body = await request.json() as { email?: string; password?: string; name?: string; role?: string };
    return HttpResponse.json({
      success: true,
      data: {
        token: "mock-token-new",
        user: { id: "new-user", name: body.name, email: body.email, role: body.role || "CUSTOMER" },
      },
    }, { status: 201 });
  }),

  http.get(`${API_BASE}/auth/me`, () =>
    HttpResponse.json({ success: true, data: { id: "admin-1", name: "Admin", email: "admin@test.com", role: "ADMIN" } })
  ),

  http.get(`${API_BASE}/cart`, () =>
    HttpResponse.json({ success: true, data: mockCart })
  ),

  http.post(`${API_BASE}/cart`, async ({ request }) => {
    const body = await request.json() as { productId: string; quantity?: number };
    return HttpResponse.json({
      success: true,
      data: { id: "ci-new", cartId: "cart-1", productId: body.productId, quantity: body.quantity || 1, product: mockProducts.find((p) => p.id === body.productId) },
    }, { status: 201 });
  }),

  http.put(`${API_BASE}/cart/:productId`, ({ params }) =>
    HttpResponse.json({
      success: true,
      data: { id: "ci-1", cartId: "cart-1", productId: params.productId, quantity: 1, product: { id: "1", name: "MacBook Pro", price: 1999.99, images: ["/uploads/laptop.jpg"], stock: 10 } },
    })
  ),

  http.delete(`${API_BASE}/cart/:productId`, () =>
    HttpResponse.json({ success: true, message: "Item removed" })
  ),

  http.get(`${API_BASE}/orders`, () =>
    HttpResponse.json({ success: true, data: mockOrders })
  ),

  http.post(`${API_BASE}/orders`, async ({ request }) => {
    const body = await request.json() as { paymentMethod?: string };
    return HttpResponse.json({
      success: true,
      data: { ...mockOrders[0], id: "order-new", paymentMethod: body.paymentMethod },
    }, { status: 201 });
  }),

  http.get(`${API_BASE}/orders/:id`, ({ params }) => {
    const order = mockOrders.find((o) => o.id === params.id) || { ...mockOrders[0], id: params.id as string };
    return HttpResponse.json({ success: true, data: order });
  }),

  http.get(`${API_BASE}/reviews/product/:productId`, () =>
    HttpResponse.json({ success: true, data: mockReviews })
  ),

  http.post(`${API_BASE}/reviews`, async () =>
    HttpResponse.json({ success: true, data: mockReviews[0] }, { status: 201 })
  ),

  http.delete(`${API_BASE}/reviews/:id`, () =>
    HttpResponse.json({ success: true, message: "Review deleted" })
  ),

  http.get(`${API_BASE}/admin/stats`, () =>
    HttpResponse.json({ success: true, data: mockDashboardStats })
  ),

  http.get(`${API_BASE}/admin/users`, () =>
    HttpResponse.json({ success: true, data: mockUsers })
  ),

  http.delete(`${API_BASE}/admin/users/:id`, () =>
    HttpResponse.json({ success: true, message: "User deleted" })
  ),

  http.get(`${API_BASE}/admin/orders`, () =>
    HttpResponse.json({ success: true, data: mockOrders })
  ),

  http.patch(`${API_BASE}/admin/orders/:id/status`, async ({ request }) => {
    const body = await request.json() as { status?: string };
    return HttpResponse.json({ success: true, data: { ...mockOrders[0], status: body.status } });
  }),

  http.get(`${API_BASE}/admin/activity-logs`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    return HttpResponse.json({
      success: true,
      data: mockActivityLogs,
      pagination: { page, limit: 20, total: mockActivityLogs.length, totalPages: 1 },
    });
  }),
];
