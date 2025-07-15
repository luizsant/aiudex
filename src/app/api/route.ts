import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "API LegalAI funcionando!",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: "POST endpoint funcionando!",
    timestamp: new Date().toISOString(),
  });
}
