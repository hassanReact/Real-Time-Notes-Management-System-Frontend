import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // bring in the Next.js recommended settings
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 👇 add your own overrides here
  {
    rules: {
      // turn off the rule that blocks `any`
      "@typescript-eslint/no-explicit-any": "off",
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
