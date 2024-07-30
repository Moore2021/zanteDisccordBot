import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {
    languageOptions: { globals: globals.node },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      "semi": "error",
      "quotes": ["error", "backtick"]
    }
  },
  pluginJs.configs.recommended,
]; 