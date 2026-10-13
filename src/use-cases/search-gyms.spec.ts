import { expect, describe, it, beforeEach } from "vitest";
import { InMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gyms-repository.js";
import { SearchGymsUseCase } from "./search-gyms.js";

describe("Search Gyms Use Case", async () => {
  let gymsRepository: InMemoryGymsRepository;
  let sut: SearchGymsUseCase;

  beforeEach(async () => {
    gymsRepository = new InMemoryGymsRepository();

    sut = new SearchGymsUseCase(gymsRepository);
  });

  it("should be able to search for gyms", async () => {
    await gymsRepository.create({
      title: "Javascript Gym",
      latitude: 0,
      longitude: 0,
      description: null,
      phone: null,
    });

    await gymsRepository.create({
      title: "Typescrypt Gym",
      latitude: -23.4944534,
      longitude: -46.8937766,
      description: null,
      phone: null,
    });

    const { gyms } = await sut.execute({
      query: "Javascript",
      page: 1,
    });

    expect(gyms).toHaveLength(1);
    expect(gyms).toEqual([
      expect.objectContaining({ title: "Javascript Gym" }),
    ]);
  });

  it("should be able to fetch paginated gym search", async () => {
    for (let index = 1; index <= 22; index++) {
      await gymsRepository.create({
        title: `Javascript Gym ${index}`,
        latitude: 0,
        longitude: 0,
        description: null,
        phone: null,
      });
    }

    const { gyms } = await sut.execute({
      query: "Javascript",
      page: 2,
    });

    expect(gyms).toHaveLength(2);
    expect(gyms).toEqual([
      expect.objectContaining({ title: `Javascript Gym 21` }),
      expect.objectContaining({ title: `Javascript Gym 22` }),
    ]);
  });
});
