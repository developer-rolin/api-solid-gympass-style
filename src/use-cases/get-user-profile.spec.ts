import { expect, describe, it, beforeEach } from "vitest";
import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository.js";
import { GetUserProfileUseCase } from "./get-user-profile.js";
import { ResourceNotFound } from "./errors/resource-not-found.js";

describe("Get User Profile use Case", async () => {
  let usersRepository: InMemoryUsersRepository;
  let sut: GetUserProfileUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();

    sut = new GetUserProfileUseCase(usersRepository);
  });

  const data = {
    name: "John",
    email: "test@email.com",
    password_hash: await hash("123456", 6),
  };

  it("should be able to get user profile", async () => {
    const createdUser = await usersRepository.create(data);

    const { user } = await sut.execute({
      userId: createdUser.id,
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.name).toEqual("John");
  });

  it("should not be able to get user profile with wrong id", async () => {
    await expect(
      sut.execute({
        userId: "non-existing-id",
      }),
    ).rejects.toBeInstanceOf(ResourceNotFound);
  });
});
