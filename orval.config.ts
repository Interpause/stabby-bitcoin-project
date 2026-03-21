import { defineConfig } from "orval";

const COINGECKO_OPENAPI_URL =
  "https://raw.githubusercontent.com/coingecko/coingecko-api-oas/refs/heads/main/coingecko-demo.json";

export default defineConfig({
  coingecko: {
    output: {
      mode: "tags-split",
      target: "sdk/coingecko/api.ts",
      schemas: "sdk/coingecko/model",
      client: "swr",
      mock: true,
      override: {
        mutator: {
          path: './lib/api/clients/coingecko-client.ts',
          name: 'coingeckoInstance',
        },
      },
    },
    input: { target: COINGECKO_OPENAPI_URL },
  },
  coingeckoZod: {
    output: {
      mode: "tags-split",
      client: "zod",
      target: "sdk/coingecko/zod.ts",
      fileExtension: ".zod.ts",
    },
    input: { target: COINGECKO_OPENAPI_URL },
  },
});
