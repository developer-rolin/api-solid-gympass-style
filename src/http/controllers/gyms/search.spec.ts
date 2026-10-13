import request from "supertest";
import { app } from "@/app.js";
import { expect, describe, it, beforeAll, afterAll } from "vitest";
import { createAndAuthenticateUser } from "@/utils/test/create-and-authenticate-user.js";

describe("Search Gyms  (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be able to search gyms by title", async () => {
  
    const { token } = await createAndAuthenticateUser(app, true);

    await request(app.server)
      .post("/gyms")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Javascript Gym",
        description: "Some description",
        phone: "2112345678",
        latitude: -23.4979328,
        longitude: -46.8844544,
      });

    await request(app.server)
      .post("/gyms")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Typescript Gym",
        description: "Some description",
        phone: "2112345678",
        latitude: -23.4979328,
        longitude: -46.8844544,
      });

    const response = await request(app.server)
      .get("/gyms/search")
      .query({ q: "Javascript" })
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.gyms).toHaveLength(1);
    expect(response.body.gyms).toEqual([
      expect.objectContaining({ title: "Javascript Gym" }),
    ]);
  });
});
