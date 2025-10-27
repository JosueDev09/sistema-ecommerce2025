/* eslint-disable @typescript-eslint/no-explicit-any */
// middleware.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server'; // Asegúrate de apuntar a tu archivo correcto
import { getToken } from "next-auth/jwt";




const encoder = new TextEncoder();
const secret = encoder.encode(process.env.AUTH_SECRET || 'secret');
//Rutas base y los roles permitidos
const accessControl: Record<string, string[]> = {
  "/dashboard": ["SuperAdmin", "admin", "usuario"],
  "/pedidos": ["SuperAdmin", "admin", "usuario"],
  "/proveedores/alta-proveedor": ["SuperAdmin"],
  "/proveedores/lista-proveedores": ["SuperAdmin"],
  "/usuarios/alta-usuario": ["SuperAdmin"],
  "/usuarios/lista-usuarios": ["SuperAdmin"],
  "/productos/alta-producto": ["SuperAdmin"],
  "/productos/lista-productos": ["SuperAdmin"],
  "/categorias/alta-categoria": ["SuperAdmin"],
  "/categorias/lista-categorias": ["SuperAdmin"],
  "/inventario": ["SuperAdmin", "admin", "usuario"],
};


export async function middleware(req: NextRequest) {

  console.log("🛡️ Middleware ejecutado en:", req.nextUrl.pathname);
  const pathname = req.nextUrl.pathname;
  let userRole: string | null = null;
  let authType: 'credenciales' | 'google' | null = null;

 const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role = token?.role;
  const path = req.nextUrl.pathname;

  const allowedRoles = accessControl[path];
  if (allowedRoles && !allowedRoles.includes(role as string)) {
    return NextResponse.redirect(new URL("/no-autorizado", req.url));
  }

  console.log(`🟢 Acceso permitido a "${pathname}" como "${authType}"`);
  return NextResponse.next();
}

// Define en qué rutas se aplica este middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pedidos/:path*',
    '/proveedores/:path*',
    '/usuarios/:path*',
    '/productos/:path*',
    '/categorias/:path*',
    '/inventario/:path*',
  ],
};

