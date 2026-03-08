import { defineConfig } from "orval";

const COINGECKO_OPENAPI_URL =
  "https://raw.githubusercontent.com/coingecko/coingecko-api-oas/refs/heads/main/coingecko-demo.json";

export default defineConfig({
  coingecko: {
    output: {
      mode: "tags-split",
      target: "sdk/coingecko/coingecko.ts",
      schemas: "sdk/coingecko/model",
      client: "swr",
      mock: true,
    },
    input: { target: COINGECKO_OPENAPI_URL },
  },
  coingeckoZod: {
    output: {
      mode: "tags-split",
      client: "zod",
      target: "sdk/coingecko/coingecko.ts",
      fileExtension: ".zod.ts",
    },
    input: { target: COINGECKO_OPENAPI_URL },
  },
});
