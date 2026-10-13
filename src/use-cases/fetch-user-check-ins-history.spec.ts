import { expect, describe, it, beforeEach } from "vitest";
import { InMemoryCheckIns } from "@/repositories/in-memory/in-memory-check-ins-repository.js";
import { FetchUserCheckInHistoryUseCase } from "./fetch-user-check-ins-history.js";

describe("Fetch User Check-Ins Use Case", async () => {
  let checkInsRepository: InMemoryCheckIns;
  let sut: FetchUserCheckInHistoryUseCase;

  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckIns();

    sut = new FetchUserCheckInHistoryUseCase(checkInsRepository);
  });

  it("should be able to fetch check-in in history", async () => {
    await checkInsRepository.create({
      user_id: "user-01",
      gym_id: "gym-01",
    });

    await checkInsRepository.create({
      user_id: "user-01",
      gym_id: "gym-02",
    });

    const { checkIns } = await sut.execute({
      userId: "user-01",
      page: 1,
    });

    expect(checkIns).toHaveLength(2);
    expect(checkIns).toEqual([
      expect.objectContaining({ gym_id: "gym-01" }),
      expect.objectContaining({ gym_id: "gym-02" }),
    ]);
  });

  it("should be able to fetch paginated user check-in in history", async () => {
    for (let index = 1; index <= 22; index++) {
      await checkInsRepository.create({
        user_id: "user-01",
        gym_id: `gym-${index}`,
      });
    }

    const { checkIns } = await sut.execute({
      userId: "user-01",
      page: 2,
    });

    expect(checkIns).toHaveLength(2);
    expect(checkIns).toEqual([
      expect.objectContaining({ gym_id: "gym-21" }),
      expect.objectContaining({ gym_id: "gym-22" }),
    ]);
  });
});
