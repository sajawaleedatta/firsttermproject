export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateProduct = (body: Record<string, unknown>): ValidationResult => {
  const errors: string[] = [];

  if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
    errors.push("Name is required and must be a non-empty string.");
  }

  const price = Number(body.price);
  if (body.price === undefined || isNaN(price) || price <= 0) {
    errors.push("Price is required and must be a positive number.");
  }

  if (body.stock !== undefined) {
    const stock = Number(body.stock);
    if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      errors.push("Stock must be a non-negative integer.");
    }
  }

  if (body.category !== undefined && typeof body.category !== "string") {
    errors.push("Category must be a string.");
  }

  if (body.description !== undefined && typeof body.description !== "string") {
    errors.push("Description must be a string.");
  }

  return { valid: errors.length === 0, errors };
};
