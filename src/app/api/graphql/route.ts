import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServer } from "@apollo/server";
import { typeDefs } from "../graphql/schema";
import { resolvers } from "../graphql/resolvers";
import { verifyToken } from "./auth/utils";

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// 2️⃣ Define el manejador con contexto
const handler = startServerAndCreateNextHandler(server, {
  context: async (req: any) => {
    // 👇 Quita el doble { y usa get() (Next Request API)
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const user = token ? verifyToken(token) : null;
    return { user };
  },
});

// 3️⃣ Exporta los métodos correctamente
export { handler as GET, handler as POST };
