import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Correo electrónico", type: "email", placeholder: "tu@correo.com" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        // Validación básica
        if (!credentials?.email || !credentials.password) {
          throw new Error("Por favor ingresa tus credenciales.");
        }

        // Buscar usuario en BD
        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Usuario no encontrado.");
        }

        // Validar contraseña
        const validPassword = await bcrypt.compare(credentials.password, user.password);
        if (!validPassword) {
          throw new Error("Contraseña incorrecta.");
        }

        // Retornar objeto de sesión
        return {
          id: user.id.toString(),
          name: user.nombre,
          email: user.email,
          role: user.rol, // 👈 asegúrate de tener este campo en tu modelo Prisma
        };
      },
    }),
  ],

  session: {
    strategy: "jwt", // usa JSON Web Token
  },

  jwt: {
    maxAge: 60 * 60 * 24 * 7, // 7 días
  },

  pages: {
    signIn: "/login", // redirige al login personalizado
  },

  callbacks: {
    // 🔐 Agrega datos al token JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    // 🔄 Agrega datos del token a la sesión del cliente
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          role: token.role as string,
        };
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
