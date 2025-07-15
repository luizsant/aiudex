import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        plan: true,
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o usuário está ativo
    if (user.status !== "ATIVO") {
      return NextResponse.json({ error: "Conta desativada" }, { status: 403 });
    }

    // Preparar dados do usuário para retorno (sem senha)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      oabNumber: user.oabNumber,
      firm: user.firm,
      role: user.role,
      planId: user.planId,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
      plan: user.plan,
      subscription: user.subscription,
    };

    return NextResponse.json({
      user: userData,
    });
  } catch (error) {
    console.error("Erro ao verificar usuário:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
