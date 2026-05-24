import type { Config } from "tailwindcss";
// @ts-expect-error CJS preset is supported by Tailwind at runtime.
import preset from "./tailwind.preset.cjs";

const config: Config = {
  presets: [preset],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {}
  },
  plugins: []
};

export default config;
