import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

// 🔹 Encripta contraseñas (solo para registro)
export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// 🔹 Verifica contraseñas (login)
export async function verifyPassword(password: string, hashed: string) {
  return bcrypt.compare(password, hashed);
}

// 🔹 Genera un JWT con usuario y rol (sin contraseña)
export function generateToken(payload: { id: number; usuario: string; rol: string; tipo: string }) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "1d" });
}

// 🔹 Verifica token
export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
   // console.log("✅ Token verificado correctamente:", decoded);
    return decoded as {
      id: number;
      usuario: string;
      rol: string;
      tipo: string;
      iat: number;
      exp: number;
    };
  } catch (error) {
    console.error("❌ Error al verificar token:", error);
    return null;
  }
}
