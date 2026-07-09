import request from "supertest";
import app from "../../app";

describe("Products Routes", () => {
  let adminToken: string;
  let productId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@ecommence.com", password: "password123" });
    adminToken = res.body.data.token;
  });

  describe("GET /api/products", () => {
    it("should return a list of products", async () => {
      const res = await request(app).get("/api/products");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it("should filter by category", async () => {
      const res = await request(app).get("/api/products?category=Laptops");
      expect(res.status).toBe(200);
      res.body.data.forEach((p: { category: string }) => {
        expect(p.category).toBe("Laptops");
      });
    });

    it("should search by name", async () => {
      const res = await request(app).get("/api/products?search=MacBook");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/products/:id", () => {
    it("should return a single product", async () => {
      const listRes = await request(app).get("/api/products?limit=1");
      const id = listRes.body.data[0].id;

      const res = await request(app).get(`/api/products/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(id);
    });

    it("should return 404 for non-existent product", async () => {
      const res = await request(app).get("/api/products/non-existent");
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/products", () => {
    it("should create a product when admin", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .field("name", "Test Product")
        .field("description", "A test product")
        .field("price", "49.99")
        .field("category", "Laptops")
        .field("stock", "5");

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe("Test Product");
      productId = res.body.data.id;
    });

    it("should return 401 without auth", async () => {
      const res = await request(app)
        .post("/api/products")
        .send({ name: "Test", price: 10 });

      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/products/:id", () => {
    it("should delete a product when admin", async () => {
      if (!productId) return;
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
