import { verifyToken } from "../graphql/auth/utils"; // tu archivo existente
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

// 🔹 Tipado opcional (útil si usas TS en resolvers)
export interface ContextType {
  user: {
    id: number;
    usuario: string;
    rol: string;
    tipo: string;
    iat?: number;
    exp?: number;
  } | null;
  prisma: PrismaClient;
}

export async function createContext({ req }: { req: NextRequest }): Promise<ContextType> {
  // 1️⃣ Extraer token del header Authorization
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  // 2️⃣ Verificar token usando tu utils
  let user = null;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) user = decoded;
  }

  // 3️⃣ Retornar el contexto para los resolvers
  return { user, prisma };
}
