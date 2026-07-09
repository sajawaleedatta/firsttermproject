import request from "supertest";
import app from "../../app";
import mongoose from "mongoose";

const TIMEOUT = 15000;

const describeOrSkip = mongoose.connection.readyState === 1 ? describe : describe.skip;

describeOrSkip("Reviews Routes", () => {
  let customerToken: string;
  let productId: string;

  beforeAll(async () => {
    const uniqueEmail = `review-test-${Date.now()}@test.com`;
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({ name: "Review Tester", email: uniqueEmail, password: "test123" });
    customerToken = regRes.body.data.token;

    const productsRes = await request(app).get("/api/products?limit=1");
    productId = productsRes.body.data[0].id;
  }, TIMEOUT);

  describe("GET /api/reviews/product/:productId", () => {
    it("should return a list of reviews (may be empty)", async () => {
      const res = await request(app).get(`/api/reviews/product/${productId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    }, TIMEOUT);

    it("should return 500 for an invalid productId format", async () => {
      const res = await request(app).get("/api/reviews/product/$$$invalid");
      expect(res.status).toBe(500);
    }, TIMEOUT);
  });

  describe("POST /api/reviews", () => {
    it("should return 400 when rating is missing", async () => {
      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ productId, comment: "No rating" });
      expect(res.status).toBe(400);
    }, TIMEOUT);

    it("should return 400 when rating is out of range", async () => {
      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ productId, rating: 6, comment: "Invalid rating" });
      expect(res.status).toBe(400);
    }, TIMEOUT);

    it("should return 400 when comment is missing", async () => {
      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ productId, rating: 3 });
      expect(res.status).toBe(400);
    }, TIMEOUT);

    it("should return 401 without auth", async () => {
      const res = await request(app).post("/api/reviews").send({ productId, rating: 5, comment: "Nice" });
      expect(res.status).toBe(401);
    });
  });
});
