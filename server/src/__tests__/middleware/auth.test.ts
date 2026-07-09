import { Response, NextFunction } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { verifyToken } from "../../utils/auth";
import { AuthRequest, JwtPayload } from "../../types/auth";

jest.mock("../../utils/auth");

const mockedVerifyToken = jest.mocked(verifyToken);

function mockReq(overrides: Partial<AuthRequest> = {}): AuthRequest {
  return { headers: {}, ...overrides } as AuthRequest;
}

function mockRes(): Response {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("authenticate middleware", () => {
  let req: AuthRequest;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = mockReq();
    res = mockRes();
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should return 401 when no Authorization header is present", () => {
    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Access denied. No token provided.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when header does not start with Bearer", () => {
    req.headers.authorization = "Basic some-token";

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when token is invalid", () => {
    req.headers.authorization = "Bearer invalid-token";
    mockedVerifyToken.mockImplementation(() => {
      throw new Error("jwt malformed");
    });

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Invalid or expired token.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next with user set when token is valid", () => {
    const payload: JwtPayload = { userId: "user-1", email: "test@test.com", role: "CUSTOMER" };
    req.headers.authorization = "Bearer valid-token";
    mockedVerifyToken.mockReturnValue(payload);

    authenticate(req, res, next);

    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("authorize middleware", () => {
  let req: AuthRequest;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = mockReq();
    res = mockRes();
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should return 403 when req.user is undefined", () => {
    const middleware = authorize("ADMIN");
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Forbidden. Insufficient permissions.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 when user role is not in allowed roles", () => {
    req.user = { userId: "user-1", email: "test@test.com", role: "CUSTOMER" };
    const middleware = authorize("ADMIN");
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next when user role is in allowed roles", () => {
    req.user = { userId: "user-1", email: "admin@test.com", role: "ADMIN" };
    const middleware = authorize("ADMIN");
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should accept multiple roles", () => {
    req.user = { userId: "user-1", email: "mod@test.com", role: "MODERATOR" };
    const middleware = authorize("ADMIN", "MODERATOR");
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
