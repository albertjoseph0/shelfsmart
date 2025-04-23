import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Globally ignore auto-generated Prisma clients
  { ignores: ["src/generated/**", "**/src/generated/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow unescaped entities in static content
      "react/no-unescaped-entities": "off",
    }
  }
];
