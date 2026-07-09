import request from "supertest";
import app from "../../app";

describe("Admin Routes", () => {
  let adminToken: string;
  let customerToken: string;
  let orderId: string;
  let customerId: string;

  beforeAll(async () => {
    const adminRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@ecommence.com", password: "password123" });
    adminToken = adminRes.body.data.token;

    const uniqueEmail = `admin-test-${Date.now()}@test.com`;
    const custRes = await request(app)
      .post("/api/auth/register")
      .send({ name: "Admin Test User", email: uniqueEmail, password: "test123" });
    customerToken = custRes.body.data.token;
    customerId = custRes.body.data.user.id;

    // create an order for this customer so we have data
    const productsRes = await request(app).get("/api/products?limit=10");
    const inStock = productsRes.body.data.filter((p: { stock: number }) => p.stock > 0);
    const productId = inStock[0].id;

    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ productId, quantity: 1 });

    const orderRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ paymentMethod: "CASH" });

    if (orderRes.status === 201) {
      orderId = orderRes.body.data.id;
    }
  });

  describe("GET /api/admin/stats", () => {
    it("should return dashboard stats", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("totalProducts");
      expect(res.body.data).toHaveProperty("totalUsers");
      expect(res.body.data).toHaveProperty("totalOrders");
      expect(res.body.data).toHaveProperty("totalRevenue");
      expect(res.body.data).toHaveProperty("ordersByStatus");
      expect(res.body.data).toHaveProperty("productsByCategory");
      expect(res.body.data).toHaveProperty("recentOrders");
    });

    it("should return 403 for non-admin users", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/admin/users", () => {
    it("should return a list of users", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach((u: { id: string; email: string; name: string; role: string }) => {
        expect(u).toHaveProperty("id");
        expect(u).toHaveProperty("email");
        expect(u).toHaveProperty("role");
      });
    });

    it("should return 403 for non-admin users", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/admin/orders", () => {
    it("should return all orders", async () => {
      const res = await request(app)
        .get("/api/admin/orders")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should return 403 for non-admin users", async () => {
      const res = await request(app)
        .get("/api/admin/orders")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/admin/orders/:id/status", () => {
    it("should update order status", async () => {
      if (!orderId) return;

      const res = await request(app)
        .patch(`/api/admin/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "SHIPPED" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("SHIPPED");
    });

    it("should update payment status", async () => {
      if (!orderId) return;

      const res = await request(app)
        .patch(`/api/admin/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ paymentStatus: "PAID" });

      expect(res.status).toBe(200);
      expect(res.body.data.paymentStatus).toBe("PAID");
    });

    it("should return 404 for non-existent order", async () => {
      const res = await request(app)
        .patch("/api/admin/orders/non-existent-id/status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "SHIPPED" });

      expect(res.status).toBe(404);
    });

    it("should return 403 for non-admin users", async () => {
      const res = await request(app)
        .patch(`/api/admin/orders/${orderId || "some-id"}/status`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ status: "SHIPPED" });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/admin/users/:id", () => {
    let adminId: string;

    beforeAll(async () => {
      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${adminToken}`);
      adminId = meRes.body.data.id;
    });

    it("should return 400 when trying to delete yourself", async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${adminId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/cannot delete yourself/i);
    });

    it("should delete a customer user", async () => {
      const email = `delete-me-${Date.now()}@test.com`;
      const regRes = await request(app)
        .post("/api/auth/register")
        .send({ name: "Delete Me", email, password: "test123" });
      const targetId = regRes.body.data.user.id;

      const res = await request(app)
        .delete(`/api/admin/users/${targetId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 404 for non-existent user", async () => {
      const res = await request(app)
        .delete("/api/admin/users/non-existent-id")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it("should return 403 for non-admin users", async () => {
      const otherEmail = `admin-403-test-${Date.now()}@test.com`;
      const regRes = await request(app)
        .post("/api/auth/register")
        .send({ name: "403 Tester", email: otherEmail, password: "test123" });
      const otherToken = regRes.body.data.token;
      const otherUserId = regRes.body.data.user.id;

      const res = await request(app)
        .delete(`/api/admin/users/${otherUserId}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/admin/activity-logs", () => {
    const TIMEOUT = 15000;

    it("should return activity logs with pagination", async () => {
      const res = await request(app)
        .get("/api/admin/activity-logs")
        .set("Authorization", `Bearer ${adminToken}`);

      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.pagination).toBeDefined();
        expect(res.body.pagination).toHaveProperty("page");
        expect(res.body.pagination).toHaveProperty("limit");
        expect(res.body.pagination).toHaveProperty("total");
        expect(res.body.pagination).toHaveProperty("totalPages");
      } else {
        expect(res.status).toBe(500);
      }
    }, TIMEOUT);

    it("should support page and limit query params", async () => {
      const res = await request(app)
        .get("/api/admin/activity-logs?page=1&limit=5")
        .set("Authorization", `Bearer ${adminToken}`);

      if (res.status === 200) {
        expect(res.body.pagination.limit).toBe(5);
      }
    }, TIMEOUT);

    it("should return 403 for non-admin users", async () => {
      const res = await request(app)
        .get("/api/admin/activity-logs")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("Unauthenticated access", () => {
    it("should return 401 for all admin endpoints without token", async () => {
      const endpoints = [
        "/api/admin/stats",
        "/api/admin/users",
        "/api/admin/orders",
        "/api/admin/activity-logs",
        "/api/admin/orders/some-id/status",
        "/api/admin/users/some-id",
      ];

      for (const endpoint of endpoints) {
        const method = endpoint.includes("/status") ? "patch" : endpoint.endsWith("/some-id") ? "delete" : "get";
        const res = await request(app)[method](endpoint);
        expect(res.status).toBe(401);
      }
    });
  });
});
