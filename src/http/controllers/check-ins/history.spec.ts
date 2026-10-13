import request from "supertest";
import { app } from "@/app.js";
import { expect, describe, it, beforeAll, afterAll } from "vitest";
import { createAndAuthenticateUser } from "@/utils/test/create-and-authenticate-user.js";
import { prisma } from "@/lib/prisma.js";

describe("Hisotry (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be able to get count of check-ins", async () => {
    const { token } = await createAndAuthenticateUser(app);

    const user = await prisma.user.findFirstOrThrow();

    const gym = await prisma.gym.create({
      data: {
        title: "Javascript Gym",
        description: "Some description",
        phone: "2112345678",
        latitude: -23.4979328,
        longitude: -46.8844544,
      },
    });

    await prisma.checkIn.createMany({
      data: [
        {
          gym_id: gym.id,
          user_id: user.id,
        },
        {
          gym_id: gym.id,
          user_id: user.id,
        },
      ],
    });

    const response = await request(app.server)
      .get("/check-ins/metrics")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body.checkInsCount).toEqual(2);
  });
});
