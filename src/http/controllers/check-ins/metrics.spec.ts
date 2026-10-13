import request from "supertest";
import { app } from "@/app.js";
import { expect, describe, it, beforeAll, afterAll } from "vitest";
import { createAndAuthenticateUser } from "@/utils/test/create-and-authenticate-user.js";
import { prisma } from "@/lib/prisma.js";

describe("Metrics (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be able to get check-ins history", async () => {
   
    const { token } = await createAndAuthenticateUser(app);

    const gym = await prisma.gym.create({
      data: {
        title: "Javascript Gym",
        description: "Some description",
        phone: "2112345678",
        latitude: -23.4979328,
        longitude: -46.8844544,
      },
    });

    await request(app.server)
      .post(`/gyms/${gym.id}/check-ins`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        latitude: -23.4979328,
        longitude: -46.8844544,
      });

    const response = await request(app.server)
      .get("/check-ins/history")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body.checkIns).toHaveLength(1);
    expect(response.body.checkIns[0].id).toEqual(expect.any(String));
  });
});
