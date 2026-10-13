import { expect, describe, it, beforeEach } from "vitest";
import { InMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gyms-repository.js";
import { CreateGymUseCase } from "./create-gym.js";

describe("Create Gym Use Case", () => {
  let gymsRepository: InMemoryGymsRepository;
  let sut: CreateGymUseCase;

  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository();
    sut = new CreateGymUseCase(gymsRepository);
  });

  it("should be able to create a gym", async () => {
    const { gym } = await sut.execute({
      latitude: 0,
      longitude: 0,
      title: "Javascript Academy",
      description: null,
      phone: null,
    });
    expect(gym.id).toEqual(expect.any(String));
  });
});
