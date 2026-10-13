import type { FastifyInstance } from "fastify";
import { register } from "./register.js";
import { authenticate } from "./authenticate.js";
import { profile } from "./profile.js";
import { verifyJwt } from "@/http/middlewares/verify-jwt.js";
import { refresh } from "./refresh.js";

export async function userRoutes(app: FastifyInstance) {
  app.post("/users", register);

  app.post("/sessions", authenticate);

  app.patch("/token/refresh", refresh);

  /* Authenticated */
  app.get("/me", { onRequest: [verifyJwt] }, profile);
}
