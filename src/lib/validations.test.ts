import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  validateCPF,
  formatCPF,
  formatPhone,
} from "./validations";

describe("Login Schema", () => {
  it("should validate correct login data", () => {
    const validData = {
      email: "test@example.com",
      password: "password123",
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const invalidData = {
      email: "invalid-email",
      password: "password123",
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email inválido");
    }
  });

  it("should reject short password", () => {
    const invalidData = {
      email: "test@example.com",
      password: "123",
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Senha deve ter pelo menos 6 caracteres"
      );
    }
  });
});

describe("Register Schema", () => {
  it("should validate correct register data", () => {
    const validData = {
      name: "João Silva",
      email: "joao@example.com",
      password: "password123",
      confirmPassword: "password123",
      oabNumber: "123456/SP",
      firm: "Silva Advocacia",
    };

    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject mismatched passwords", () => {
    const invalidData = {
      name: "João Silva",
      email: "joao@example.com",
      password: "password123",
      confirmPassword: "different123",
      oabNumber: "123456/SP",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Senhas não coincidem");
    }
  });

  it("should reject invalid OAB number", () => {
    const invalidData = {
      name: "João Silva",
      email: "joao@example.com",
      password: "password123",
      confirmPassword: "password123",
      oabNumber: "12345/SP",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("CPF Validation", () => {
  it("should validate correct CPF", () => {
    const validCPF = "529.982.247-25";
    expect(validateCPF(validCPF)).toBe(true);
  });

  it("should reject invalid CPF", () => {
    const invalidCPF = "111.111.111-11";
    expect(validateCPF(invalidCPF)).toBe(false);
  });

  it("should reject CPF with wrong length", () => {
    const invalidCPF = "123.456.789-1";
    expect(validateCPF(invalidCPF)).toBe(false);
  });
});

describe("Formatting Functions", () => {
  it("should format CPF correctly", () => {
    const input = "52998224725";
    const expected = "529.982.247-25";
    expect(formatCPF(input)).toBe(expected);
  });

  it("should format phone correctly", () => {
    const input = "11987654321";
    const expected = "(11) 98765-4321";
    expect(formatPhone(input)).toBe(expected);
  });

  it("should format short phone correctly", () => {
    const input = "1187654321";
    const expected = "(11) 8765-4321";
    expect(formatPhone(input)).toBe(expected);
  });
});
