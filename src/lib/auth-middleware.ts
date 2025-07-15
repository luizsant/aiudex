import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const authHeader = request.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Token de autenticação não fornecido" },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);

      // Verificar token JWT
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback-secret"
      ) as any;

      if (!decoded.userId) {
        return NextResponse.json({ error: "Token inválido" }, { status: 401 });
      }

      // Adicionar dados do usuário à requisição
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      return handler(authenticatedRequest);
    } catch (error) {
      console.error("Erro na autenticação:", error);

      if (error instanceof jwt.JsonWebTokenError) {
        return NextResponse.json({ error: "Token inválido" }, { status: 401 });
      }

      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }
  };
}

export function withRole(requiredRole: string) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return withAuth(async (request: AuthenticatedRequest) => {
      if (!request.user) {
        return NextResponse.json(
          { error: "Usuário não autenticado" },
          { status: 401 }
        );
      }

      if (request.user.role !== requiredRole && request.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }

      return handler(request);
    });
  };
}
