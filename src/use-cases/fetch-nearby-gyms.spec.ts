import { expect, describe, it, beforeEach } from "vitest";
import { InMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gyms-repository.js";
import { FetchNearbyGymsUseCase } from "./fetch-nearby-gyms.js";

describe("Search Gyms Use Case", async () => {

  let gymsRepository: InMemoryGymsRepository;
  let sut: FetchNearbyGymsUseCase;

  beforeEach(async () => {
    gymsRepository = new InMemoryGymsRepository();
  
    sut = new FetchNearbyGymsUseCase(gymsRepository);
  });

  it("should be able to search for gyms", async () => {
    await gymsRepository.create({
      title: "Near Gym",
      latitude: 0,
      longitude: 0,
      description: null,
      phone: null,
    });

    await gymsRepository.create({
      title: "Far Gym",
      latitude: -23.4944534,
      longitude: -46.8937766,
      description: null,
      phone: null,
    });

    const { gyms } = await sut.execute({
      userLatitude: 0,
      userLongitude: 0,
    });


    expect(gyms).toHaveLength(1);
    expect(gyms).toEqual([expect.objectContaining({ title: "Near Gym" })]);
  });
});
