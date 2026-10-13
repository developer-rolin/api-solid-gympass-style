import { expect, describe, it, beforeEach, afterEach, vi } from "vitest";
import { InMemoryCheckIns } from "@/repositories/in-memory/in-memory-check-ins-repository.js";
import { ValidateCheckInUseCase } from "./validate-check-in.js";
import { ResourceNotFound } from "./errors/resource-not-found.js";
import { LateCheckInValidationError } from "./errors/late-check-in-validation-error.js";

describe("Validate Check-in use Case", async () => {

  let checkInsRepository: InMemoryCheckIns;
  let sut: ValidateCheckInUseCase;

  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckIns();

    sut = new ValidateCheckInUseCase(checkInsRepository);

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should be able to validate a check in", async () => {
    const createdCheckIn = await checkInsRepository.create({
      gym_id: "gym01",
      user_id: "user-01",
    });

    const { checkIn } = await sut.execute({
      checkInId: createdCheckIn.id,
    });

    expect(checkIn.validated_at).toEqual(expect.any(Date));
    expect(checkInsRepository.items[0]?.validated_at).toEqual(expect.any(Date));
  });

  it("should not be able to validate an inexistent check in", async () => {
    await expect(
      sut.execute({
        checkInId: "inexistent-id",
      }),
    ).rejects.toBeInstanceOf(ResourceNotFound);
  });

  it("should not be able to validate check in after 20 minutes", async () => {
    vi.setSystemTime(new Date(2022, 0, 1, 13, 40, 0));

    const createdCheckIn = await checkInsRepository.create({
      gym_id: "gym01",
      user_id: "user-01",
    });

    const twentyMinutesInMiliseconds = 1000 * 60 * 21;

    vi.advanceTimersByTime(twentyMinutesInMiliseconds);

    await expect(
      sut.execute({
        checkInId: createdCheckIn.id,
      }),
    ).rejects.toBeInstanceOf(LateCheckInValidationError);
  });
});
