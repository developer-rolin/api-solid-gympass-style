import fastify from "fastify";
import { ZodError, z } from "zod";
import { env } from "./env/index.js";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import { userRoutes } from "./http/controllers/users/routes.js";
import { gymsRoutes } from "./http/controllers/gyms/routes.js";
import { checkInsRoutes } from "./http/controllers/check-ins/routes.js";

export const app = fastify();

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: "refreshToken",
    signed: false,
  },
  sign: {
    expiresIn: "10m",
  },
});

app.register(fastifyCookie);

app.register(userRoutes);
app.register(gymsRoutes);
app.register(checkInsRoutes);

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation error.",
      issues: z.formatError(error),
    });
  }
  if (env.NODE_ENV !== "production") {
    console.error(error);
  } else {
    //TODO: Here we should log to an external tool like datadogui, grafana...
  }

  return reply.status(500).send({ message: "Internal server error." });
});
