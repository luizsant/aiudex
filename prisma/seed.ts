import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Criar planos
  const basicPlan = await prisma.plan.upsert({
    where: { name: "Basic" },
    update: {},
    create: {
      name: "Basic",
      price: 0,
      credits: 10,
      features: ["Documentos básicos", "Suporte por email"],
      maxClients: 5,
      maxDocuments: 10,
      aiFeatures: false,
      premiumSupport: false,
      priority: "FREE",
      active: true,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { name: "Pro" },
    update: {},
    create: {
      name: "Pro",
      price: 49.9,
      credits: 100,
      features: ["Documentos ilimitados", "IA avançada", "Suporte prioritário"],
      maxClients: 50,
      maxDocuments: -1, // Ilimitado
      aiFeatures: true,
      premiumSupport: true,
      priority: "PRO",
      active: true,
    },
  });

  const premiumPlan = await prisma.plan.upsert({
    where: { name: "Premium" },
    update: {},
    create: {
      name: "Premium",
      price: 99.9,
      credits: -1, // Ilimitado
      features: ["Tudo do Pro", "Integração completa", "Suporte 24/7"],
      maxClients: -1, // Ilimitado
      maxDocuments: -1, // Ilimitado
      aiFeatures: true,
      premiumSupport: true,
      priority: "ENTERPRISE",
      active: true,
    },
  });

  console.log("✅ Planos criados");

  // Hash da senha padrão
  const passwordHash = await bcrypt.hash("123456", 12);

  // Criar usuários de teste
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@legalai.com" },
    update: {},
    create: {
      name: "Admin Sistema",
      email: "admin@legalai.com",
      passwordHash,
      oabNumber: "000001/SP",
      firm: "AIudex",
      role: "ADMIN",
      planId: premiumPlan.id,
      status: "ATIVO",
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: "joao.silva@teste.com" },
    update: {},
    create: {
      name: "Dr. João Silva",
      email: "joao.silva@teste.com",
      passwordHash,
      oabNumber: "123456/SP",
      firm: "Silva Advocacia",
      role: "ADVOGADO",
      planId: basicPlan.id,
      status: "ATIVO",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "maria.santos@teste.com" },
    update: {},
    create: {
      name: "Dra. Maria Santos",
      email: "maria.santos@teste.com",
      passwordHash,
      oabNumber: "234567/SP",
      firm: "Santos & Associados",
      role: "ADVOGADO",
      planId: proPlan.id,
      status: "ATIVO",
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "carlos.oliveira@teste.com" },
    update: {},
    create: {
      name: "Dr. Carlos Oliveira",
      email: "carlos.oliveira@teste.com",
      passwordHash,
      oabNumber: "345678/SP",
      firm: "Oliveira Law Firm",
      role: "ADVOGADO",
      planId: basicPlan.id,
      status: "ATIVO",
    },
  });

  console.log("✅ Usuários de teste criados");

  // Criar créditos para os usuários
  await prisma.userCredits.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      planId: premiumPlan.id,
      currentCredits: -1, // Ilimitado
      lastReset: new Date(),
      resetDate: new Date(),
    },
  });

  await prisma.userCredits.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      planId: basicPlan.id,
      currentCredits: 10,
      lastReset: new Date(),
      resetDate: new Date(),
    },
  });

  await prisma.userCredits.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      planId: proPlan.id,
      currentCredits: 100,
      lastReset: new Date(),
      resetDate: new Date(),
    },
  });

  await prisma.userCredits.upsert({
    where: { userId: user3.id },
    update: {},
    create: {
      userId: user3.id,
      planId: basicPlan.id,
      currentCredits: 10,
      lastReset: new Date(),
      resetDate: new Date(),
    },
  });

  console.log("✅ Créditos dos usuários criados");

  console.log("🎉 Seed concluído com sucesso!");
  console.log("\n📋 Credenciais de teste:");
  console.log("Admin: admin@legalai.com / 123456");
  console.log("João: joao.silva@teste.com / 123456");
  console.log("Maria: maria.santos@teste.com / 123456");
  console.log("Carlos: carlos.oliveira@teste.com / 123456");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
