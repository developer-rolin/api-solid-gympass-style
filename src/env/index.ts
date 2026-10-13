import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "test", "production"]).default("dev"),
  PORT: z.coerce.number().default(3333),
  JWT_SECRET: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error("Invalid enviroment variables", z.treeifyError(_env.error));
  throw new Error(`Error:${_env.error}`);
}

export const env = _env.data;
