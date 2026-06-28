import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

// export default eslintConfig;

export default [
  {
    ignores: ["node_modules", ".next", "dist"],
  },
  {
    settings: {
      "import/resolver": {
        typescript: {
          project: path.resolve("./frontend/tsconfig.json"),
        },
      },
    },
  },
];
