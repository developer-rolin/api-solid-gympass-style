import request from "supertest";
import { app } from "@/app.js";
import { expect, describe, it, beforeAll, afterAll } from "vitest";
import { createAndAuthenticateUser } from "@/utils/test/create-and-authenticate-user.js";

describe("Profile  (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be able to get user profile", async () => {
    
    const { token } = await createAndAuthenticateUser(app);

    const profile = await request(app.server)
      .get("/me")
      .set("Authorization", `Bearer ${token}`);

    expect(profile.statusCode).toEqual(200);
    expect(profile.body.user).toEqual(
      expect.objectContaining({
        email: "johndoe@example.com",
      }),
    );
  });
});
