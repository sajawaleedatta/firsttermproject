import request from "supertest";
import app from "../../app";

describe("Orders Routes", () => {
  let token: string;
  let productId: string;

  beforeAll(async () => {
    const uniqueEmail = `order-test-${Date.now()}@test.com`;
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({ name: "Order Tester", email: uniqueEmail, password: "test123" });
    token = regRes.body.data.token;

    const productsRes = await request(app).get("/api/products?limit=10");
    const inStock = productsRes.body.data.filter((p: { stock: number }) => p.stock > 0);
    productId = inStock[0].id;

    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId, quantity: 1 });
  });

  describe("POST /api/orders", () => {
    it("should create an order with cash payment", async () => {
      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({ paymentMethod: "CASH" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentMethod).toBe("CASH");
      expect(res.body.data.paymentStatus).toBe("PENDING");
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });

    it("should create an order with VISA payment", async () => {
      // re-add to cart
      await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId, quantity: 1 });

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({ paymentMethod: "VISA" });

      expect(res.status).toBe(201);
      expect(res.body.data.paymentMethod).toBe("VISA");
      expect(res.body.data.paymentStatus).toBe("PAID");
    });

    it("should return 400 when cart is empty", async () => {
      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({ paymentMethod: "CASH" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Cart is empty.");
    });

    it("should return 401 without auth", async () => {
      const res = await request(app).post("/api/orders").send({ paymentMethod: "CASH" });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/orders", () => {
    it("should return the user's orders", async () => {
      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("should return 401 without auth", async () => {
      const res = await request(app).get("/api/orders");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/orders/:id", () => {
    it("should return a specific order by id", async () => {
      const ordersRes = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${token}`);
      const orderId = ordersRes.body.data[0].id;

      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(orderId);
    });

    it("should return 404 for non-existent order", async () => {
      const res = await request(app)
        .get("/api/orders/non-existent-id")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it("should return 403 for another user's order", async () => {
      const uniqueEmail = `order-test-${Date.now()}@test.com`;
      const regRes = await request(app)
        .post("/api/auth/register")
        .send({ name: "Order Tester", email: uniqueEmail, password: "test123" });
      const otherToken = regRes.body.data.token;

      const ordersRes = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${token}`);
      const orderId = ordersRes.body.data[0].id;

      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
    });

    it("should return 401 without auth", async () => {
      const res = await request(app).get("/api/orders/some-id");
      expect(res.status).toBe(401);
    });
  });
});
