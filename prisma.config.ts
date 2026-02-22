import { readFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "prisma/config";

// dotenv doesn't reliably inject vars into prisma.config.ts in Prisma v7.
// Read the env file directly instead.
function readEnvFile(filePath: string): Record<string, string> {
  try {
    const content = readFileSync(resolve(process.cwd(), filePath), "utf-8");
    const result: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const match = line.match(/^([^#=\s][^=]*)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        result[key] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

const env = readEnvFile(".env.development.local");

// Use unpooled/direct URL for migrations (Neon requires this).
// Falls back to DATABASE_URL if unpooled variant is not available.
const migrationUrl =
  env.DATABASE_URL_UNPOOLED ??
  env.POSTGRES_URL_NON_POOLING ??
  env.DATABASE_URL ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationUrl,
  },
});
