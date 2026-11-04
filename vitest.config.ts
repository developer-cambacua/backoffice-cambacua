import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["src/__tests__/**/*.test.ts"],
    /* Las rutas de API leen estas variables al importar los clientes de Supabase
       (en los tests esos clientes se mockean, pero createClient exige que existan). */
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
      SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
      NEXTAUTH_SECRET: "test-secret",
    },
  },
});
