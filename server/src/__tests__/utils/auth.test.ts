import { hashPassword, comparePassword, generateToken, verifyToken } from "../../utils/auth";

describe("Auth Utils", () => {
  describe("hashPassword / comparePassword", () => {
    it("should hash a password", async () => {
      const hash = await hashPassword("test123");
      expect(hash).toBeDefined();
      expect(hash).not.toBe("test123");
    });

    it("should return true for matching passwords", async () => {
      const hash = await hashPassword("test123");
      const result = await comparePassword("test123", hash);
      expect(result).toBe(true);
    });

    it("should return false for non-matching passwords", async () => {
      const hash = await hashPassword("test123");
      const result = await comparePassword("wrong", hash);
      expect(result).toBe(false);
    });
  });

  describe("generateToken / verifyToken", () => {
    const payload = { userId: "abc-123", email: "test@test.com", role: "CUSTOMER" };

    it("should generate a JWT string", () => {
      const token = generateToken(payload);
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);
    });

    it("should verify and return the payload", () => {
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe("abc-123");
      expect(decoded.email).toBe("test@test.com");
      expect(decoded.role).toBe("CUSTOMER");
    });

    it("should throw for an invalid token", () => {
      expect(() => verifyToken("invalid.token.here")).toThrow();
    });
  });
});
