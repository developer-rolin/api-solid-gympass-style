import { expect, describe, it, beforeEach } from "vitest";
import { InMemoryCheckIns } from "@/repositories/in-memory/in-memory-check-ins-repository.js";
import { GetUserMetricsUseCase } from "./get-user-metrics.js";

describe("Get User Metrics Use Case", async () => {
  let checkInsRepository: InMemoryCheckIns;
  let sut: GetUserMetricsUseCase;

  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckIns();

    sut = new GetUserMetricsUseCase(checkInsRepository);
  });

  it("should be able to get check-ins quantity", async () => {
    await checkInsRepository.create({
      user_id: "user-01",
      gym_id: "gym-01",
    });

    await checkInsRepository.create({
      user_id: "user-01",
      gym_id: "gym-02",
    });

    const { checkInsCount } = await sut.execute({
      userId: "user-01",
    });

    expect(checkInsCount).toEqual(2);
  });
});
