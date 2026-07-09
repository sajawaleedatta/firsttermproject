import { validateProduct } from "../../utils/validate";

describe("validateProduct", () => {
  it("should return valid for a valid product", () => {
    const result = validateProduct({ name: "Test", price: 99.99, category: "Laptops", stock: 10 });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should return invalid when name is missing", () => {
    const result = validateProduct({ price: 99.99 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Name is required and must be a non-empty string.");
  });

  it("should return invalid when price is negative", () => {
    const result = validateProduct({ name: "Test", price: -10 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Price is required and must be a positive number.");
  });

  it("should return invalid when stock is negative", () => {
    const result = validateProduct({ name: "Test", price: 50, stock: -1 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Stock must be a non-negative integer.");
  });

  it("should return multiple errors", () => {
    const result = validateProduct({});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});
