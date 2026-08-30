import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
    // Required by `migrate dev`, but intentionally optional for production builds.
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
