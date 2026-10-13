import { expect, describe, it, beforeEach } from "vitest";
import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository.js";
import { AuthenticateUseCase } from "./authenticate.js";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error.js";

describe("Authenticate use Case", async () => {
  let usersRepository: InMemoryUsersRepository;
  let sut: AuthenticateUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();

    sut = new AuthenticateUseCase(usersRepository);
  });

  const data = {
    name: "John",
    email: "test@email.com",
    password_hash: await hash("123456", 6),
  };

  it("should be able to authenticate", async () => {
    await usersRepository.create(data);

    const { user } = await sut.execute({
      email: "test@email.com",
      password: "123456",
    });

    expect(user.email).toEqual("test@email.com");
  });

  it("should not be able to authenticate with wrong email", async () => {
    await usersRepository.create(data);

    await expect(
      sut.execute({
        email: "test@emailll.com",
        password: "123456",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("should not be able to authenticate with wrong password", async () => {
    await usersRepository.create(data);

    await expect(
      sut.execute({
        email: "test@email.com",
        password: "123457",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
