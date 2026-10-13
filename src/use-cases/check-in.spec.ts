import { expect, describe, it, beforeEach, afterEach, vi } from "vitest";
import { InMemoryCheckIns } from "@/repositories/in-memory/in-memory-check-ins-repository.js";
import { CheckinUseCase } from "./check-in.js";
import { InMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gyms-repository.js";
import type { Gym } from "@prisma/client";
import { MaxNumberOfCheckInsError } from "./errors/max-number-of-check-ins-error.js";
import { MaxDistanceError } from "./errors/max-distance-error.js";

describe("CheckIn use Case", async () => {
  let checkInsRepository: InMemoryCheckIns;
  let gymsRepository: InMemoryGymsRepository;
  let sut: CheckinUseCase;
  let gym: Gym;

  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckIns();
    gymsRepository = new InMemoryGymsRepository();

    sut = new CheckinUseCase(checkInsRepository, gymsRepository);

    vi.useFakeTimers();

    gym = await gymsRepository.create({
      latitude: -23.4944534,
      longitude: -46.8937766,
      title: "Academia das maravilhas",
      description: "Academia mia",
      phone: "123456789",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should be able to check in", async () => {
    const { checkIn } = await sut.execute({
      gymId: gym.id,
      userId: "123456",
      userLatitude: -23.4944534,
      userLongitude: -46.8937766,
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });

  it("should not be able to check in twice a day", async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0));

    await sut.execute({
      gymId: gym.id,
      userId: "123456",
      userLatitude: -23.4944534,
      userLongitude: -46.8937766,
    });

    await expect(
      sut.execute({
        gymId: gym.id,
        userId: "123456",
        userLatitude: -23.4944534,
        userLongitude: -46.8937766,
      }),
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError);
  });

  it("should be able to check in twice on a diferente day", async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0));

    await sut.execute({
      gymId: gym.id,
      userId: "123456",
      userLatitude: -23.4944534,
      userLongitude: -46.8937766,
    });

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0));

    const { checkIn } = await sut.execute({
      gymId: gym.id,
      userId: "123456",
      userLatitude: -23.4944534,
      userLongitude: -46.8937766,
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });

  it("should not be able to check in distant gyms", async () => {
    await gymsRepository.create({
      id: "gym-01",
      latitude: -23.4944534,
      longitude: -46.8937766,
      title: "Academia das maravilhas",
      description: "Academia mia",
      phone: "123456789",
    });

    await expect(
      sut.execute({
        gymId: "gym-01",
        userId: "123456",
        userLatitude: -23.4910765,
        userLongitude: -46.8804239,
      }),
    ).rejects.toBeInstanceOf(MaxDistanceError);
  });
});
