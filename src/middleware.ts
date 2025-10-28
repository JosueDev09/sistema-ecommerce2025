import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { verifyTokenEdge } from "./lib/verifyTokenEdge"; // 👈 usa esta versión

const accessControl: Record<string, string[]> = {
  "/dashboard": ["SUPERADMIN", "ADMIN", "USUARIO"],
  "/pedidos": ["SUPERADMIN", "ADMIN", "USUARIO"],
  "/proveedores/alta-proveedor": ["SUPERADMIN"],
  "/proveedores/lista-proveedores": ["SUPERADMIN"],
  "/usuarios/alta-usuario": ["SUPERADMIN"],
  "/usuarios/lista-usuarios": ["SUPERADMIN"],
  "/productos/alta-producto": ["SUPERADMIN"],
  "/productos/lista-productos": ["SUPERADMIN"],
  "/categorias/alta-categoria": ["SUPERADMIN"],
  "/categorias/lista-categorias": ["SUPERADMIN"],
  "/inventario": ["SUPERADMIN", "ADMIN", "USUARIO"],
};

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  console.log("🛡️ Middleware ejecutado en:", path);

  // 1️⃣ Leer token desde cookie
  const token = req.cookies.get("token")?.value;

  if (!token) {
    console.warn("❌ No se encontró token en cookies");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2️⃣ Verificar el token con jose
  const decoded = await verifyTokenEdge(token);

  if (!decoded) {
    console.warn("❌ Token inválido o expirado");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const userRole = decoded.rol?.toUpperCase() || "USUARIO";
  const allowedRoles = accessControl[path];

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.warn(`🚫 Acceso denegado: ${userRole} → ${path}`);
    return NextResponse.redirect(new URL("/no-autorizado", req.url));
  }

  console.log(`🟢 Acceso permitido a "${path}" como "${userRole}"`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pedidos/:path*",
    "/proveedores/:path*",
    "/usuarios/:path*",
    "/productos/:path*",
    "/categorias/:path*",
    "/inventario/:path*",
  ],
};
