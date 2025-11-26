// hash-passwords.mjs
import dotenv from "dotenv";
import { Client } from "pg";
import bcrypt from "bcryptjs";

dotenv.config();

// Validar y convertir variables de entorno
const clientConfig = {
  user: String(process.env.DB_USER || "postgres"),
  host: String(process.env.DB_HOST || "localhost"),
  database: String(process.env.DB_DATABASE || "dbStore"),
  password: String(process.env.DB_PASSWORD || ""),
  port: parseInt(process.env.DB_PORT || "5432", 10),
};

// Validar configuración antes de continuar
console.log("🔍 Verificando configuración de base de datos...");
console.log(`   Usuario: ${clientConfig.user}`);
console.log(`   Host: ${clientConfig.host}`);
console.log(`   Base de datos: ${clientConfig.database}`);
console.log(`   Puerto: ${clientConfig.port}`);
console.log(`   Contraseña: ${clientConfig.password ? '***' : '(vacía)'}\n`);

if (!clientConfig.password) {
  console.error("❌ ERROR: La contraseña de la base de datos está vacía.");
  console.error("   Por favor verifica tu archivo .env y asegúrate de tener:");
  console.error("   DB_PASSWORD=tu_contraseña\n");
  process.exit(1);
}

const TABLES_TO_CHECK = [
  // intenta en estas tablas/columnas (orden lógico)
  { table: "tbEmpleados", idCol: "intEmpleado", passCol: "strContra" },
  { table: "tbClientes", idCol: "intCliente", passCol: "strContra" },
  { table: "tbUsuarios",  idCol: "id",         passCol: "strContra"  }, // antiguo ejemplo
];

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

async function tableHasColumn(client, tableName, columnName) {
  const res = await client.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND lower(table_name) = lower($1)
       AND lower(column_name) = lower($2)
     LIMIT 1`,
    [tableName, columnName]
  );
  return res.rowCount > 0;
}

async function hashPasswordsInTable(client, { table, idCol, passCol }) {
  const hasCols = await tableHasColumn(client, table, passCol);
 // console.log('El has')
  if (!hasCols) {
    console.log(`⚠️  Saltado: tabla "${table}" no tiene la columna "${passCol}".`);
    return;
  }

  console.log(`\n🔎 Procesando tabla "${table}" columna "${passCol}"...`);

  // Buscar filas donde la contraseña no empieza con $2 (bcrypt) y no es NULL
  const selectSql = `SELECT "${idCol}" as id, "${passCol}" as pass
                     FROM public."${table}"
                     WHERE "${passCol}" IS NOT NULL
                       AND "${passCol}" NOT LIKE '$2%'`;

  const { rows } = await client.query(selectSql);

  if (rows.length === 0) {
    console.log(`✅ No se encontraron contraseñas sin hashear en "${table}".`);
    return;
  }

  console.log(`ℹ️  Encontradas ${rows.length} contraseñas sin hashear en "${table}".`);

  // Ejecutar actualización dentro de una transacción por tabla
  try {
    await client.query("BEGIN");
    for (const row of rows) {
      const plain = String(row.pass);
      const hashed = await bcrypt.hash(plain, SALT_ROUNDS);

      const updateSql = `UPDATE public."${table}"
                         SET "${passCol}" = $1
                         WHERE "${idCol}" = $2`;
      await client.query(updateSql, [hashed, row.id]);

      console.log(`🔒 Hasheado id=${row.id} en ${table}`);
    }
    await client.query("COMMIT");
    console.log(`✅ Actualizaciones completadas en tabla "${table}".`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(`❌ Error al actualizar tabla "${table}":`, err);
    throw err;
  }
}

async function main() {
  const client = new Client(clientConfig);
  try {
    await client.connect();
    console.log("🔌 Conectado a Postgres:", clientConfig.database);

    for (const conf of TABLES_TO_CHECK) {
      await hashPasswordsInTable(client, conf);
    }

    console.log("\n🎉 Proceso finalizado.");
  } catch (err) {
    console.error("❌ Error general:", err);
  } finally {
    await client.end();
    console.log("🔚 Conexión cerrada.");
  }
}

main();
