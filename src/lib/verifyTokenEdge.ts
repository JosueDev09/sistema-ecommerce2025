import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecretkey");

export async function verifyTokenEdge(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as {
      id: number;
      usuario: string;
      rol: string;
      tipo: string;
      iat: number;
      exp: number;
    };
  } catch (error) {
    console.error("❌ Error al verificar token (Edge):", error);
    return null;
  }
}
