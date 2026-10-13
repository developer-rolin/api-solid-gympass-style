import { expect, describe, it, beforeEach } from "vitest";
import { RegisterUseCase } from "./register.js";
import { compare } from "bcryptjs";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository.js";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error.js";

describe("Register use Case", () => {
  let usersRepository: InMemoryUsersRepository;
  let sut: RegisterUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    sut = new RegisterUseCase(usersRepository);
  });

  it("should be able to register", async () => {
    const { user } = await sut.execute({
      email: "test@email.com",
      name: "John",
      password: "123456",
    });

    expect(user.id).toEqual(expect.any(String));
  });

  it("should hash user password", async () => {
    const { user } = await sut.execute({
      email: "test@email.com",
      name: "John",
      password: "123456",
    });

    const isPasswordCorrectlyHashed = await compare(
      "123456",
      user.password_hash,
    );

    expect(isPasswordCorrectlyHashed).toBe(true);
  });

  it("should not be able to register user with same email", async () => {
    const data = {
      email: "test@email.com",
      name: "John",
      password: "123456",
    };

    await sut.execute(data);

    await expect(
      sut.execute({
        ...data,
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });
});
