import request from "supertest";
import type { FastifyInstance } from "fastify";
import { prisma } from "@/lib/prisma.js";
import { hash } from "bcryptjs";

export async function createAndAuthenticateUser(
  app: FastifyInstance,
  isAdmin = false,
) {
  await prisma.user.create({
    data: {
      name: "John Doe",
      email: "johndoe@example.com",
      password_hash: await hash("123456", 6),
      role: isAdmin ? "ADMIN" : "MEMBER",
    },
  });

  const authResponse = await request(app.server).post("/sessions").send({
    email: "johndoe@example.com",
    password: "123456",
  });

  const { token } = authResponse.body;

  return { token };
}
