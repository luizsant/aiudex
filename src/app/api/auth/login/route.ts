import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 [API] Iniciando login...");
    console.log(
      "🔐 [API] JWT_SECRET:",
      process.env.JWT_SECRET ? "Definido" : "Não definido"
    );
    console.log(
      "🔐 [API] DATABASE_URL:",
      process.env.DATABASE_URL ? "Definido" : "Não definido"
    );

    const { email, password } = await request.json();
    console.log("🔐 [API] Email recebido:", email);

    // Validações básicas
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar usuário no banco
    console.log("🔐 [API] Buscando usuário no banco...");
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        plan: true,
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    console.log("🔐 [API] Usuário encontrado:", user ? "Sim" : "Não");

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar senha
    console.log("🔐 [API] Verificando senha...");
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    console.log("🔐 [API] Senha válida:", isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    // Verificar se o usuário está ativo
    if (user.status !== "ATIVO") {
      return NextResponse.json({ error: "Conta desativada" }, { status: 403 });
    }

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" }
    );

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

    console.log("🔐 [API] Login bem-sucedido para:", user.email);
    return NextResponse.json({
      user: userData,
      token,
      message: "Login realizado com sucesso",
    });
  } catch (error) {
    console.error("❌ [API] Erro no login:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
