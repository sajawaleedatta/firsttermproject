import request from "supertest";
import app from "../../app";

describe("Cart Routes", () => {
  let token: string;
  let productId: string;
  let secondProductId: string;

  beforeAll(async () => {
    const uniqueEmail = `cart-test-${Date.now()}@test.com`;
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({ name: "Cart Tester", email: uniqueEmail, password: "test123" });
    token = regRes.body.data.token;

    const productsRes = await request(app).get("/api/products?limit=10");
    // pick products with stock > 0
    const inStock = productsRes.body.data.filter((p: { stock: number }) => p.stock > 0);
    productId = inStock[0].id;
    secondProductId = inStock[1].id;
  });

  describe("GET /api/cart", () => {
    it("should return an empty cart for a new user", async () => {
      const uniqueEmail = `cart-test-${Date.now()}@test.com`;
      const regRes = await request(app)
        .post("/api/auth/register")
        .send({ name: "Cart Tester", email: uniqueEmail, password: "test123" });
      const userToken = regRes.body.data.token;

      const res = await request(app).get("/api/cart").set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toEqual([]);
      expect(res.body.data.total).toBe(0);
    });

    it("should return 401 without auth", async () => {
      const res = await request(app).get("/api/cart");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/cart", () => {
    it("should add a product to the cart", async () => {
      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId, quantity: 2 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.productId).toBe(productId);
      expect(res.body.data.quantity).toBe(2);
    });

    it("should increase quantity when adding an existing product", async () => {
      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId, quantity: 1 });

      expect(res.status).toBe(200);
      expect(res.body.data.quantity).toBe(3);
    });

    it("should return 400 when productId is missing", async () => {
      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ quantity: 1 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 for non-existent product", async () => {
      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: "non-existent-id" });

      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await request(app).post("/api/cart").send({ productId, quantity: 1 });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/cart after adding items", () => {
    it("should return the cart with items", async () => {
      // add second product first
      await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: secondProductId, quantity: 1 });

      const res = await request(app).get("/api/cart").set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBe(2);
      expect(res.body.data.total).toBeGreaterThan(0);
    });
  });

  describe("PUT /api/cart/:productId", () => {
    it("should update the quantity of a cart item", async () => {
      const res = await request(app)
        .put(`/api/cart/${productId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(200);
      expect(res.body.data.quantity).toBe(5);
    });

    it("should return 404 for a product not in cart", async () => {
      const res = await request(app)
        .put("/api/cart/non-existent-product")
        .set("Authorization", `Bearer ${token}`)
        .send({ quantity: 1 });

      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await request(app).put(`/api/cart/${productId}`).send({ quantity: 1 });
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/cart/:productId", () => {
    it("should remove a product from the cart", async () => {
      const res = await request(app)
        .delete(`/api/cart/${secondProductId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Product removed from cart.");
    });

    it("should return 404 for a product not in cart", async () => {
      const res = await request(app)
        .delete(`/api/cart/${secondProductId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await request(app).delete(`/api/cart/${productId}`);
      expect(res.status).toBe(401);
    });
  });
});
