import { GetUserMetricsUseCase } from "../get-user-metrics.js";
import { PrismaCheckInsRepository } from "@/repositories/prisma/prisma-check-ins-repository.js";

export function makeGetUserMetricsUseCase() {
  const checkInsRepository = new PrismaCheckInsRepository();

  const useCase = new GetUserMetricsUseCase(checkInsRepository);

  return useCase;
}
