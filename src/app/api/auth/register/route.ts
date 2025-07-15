import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, oabNumber, firm, phone, cpfCnpj, address } =
      await request.json();

    // Validações básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já está em uso" },
        { status: 409 }
      );
    }

    // Hash da senha
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Buscar plano básico
    const basicPlan = await prisma.plan.findFirst({
      where: { name: "Basic" },
    });

    if (!basicPlan) {
      return NextResponse.json(
        { error: "Plano básico não encontrado" },
        { status: 500 }
      );
    }

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        oabNumber,
        firm,
        phone,
        cpfCnpj,
        address,
        role: "ADVOGADO",
        planId: basicPlan.id,
        status: "ATIVO",
      },
      include: {
        plan: true,
      },
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
      plan: user.plan,
    };

    return NextResponse.json({
      user: userData,
      token,
      message: "Conta criada com sucesso",
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
