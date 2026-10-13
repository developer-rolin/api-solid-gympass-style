import { PrismaGymsRepository } from "@/repositories/prisma/prisma-gyms-repository.js";
import { CheckinUseCase } from "../check-in.js";
import { PrismaCheckInsRepository } from "@/repositories/prisma/prisma-check-ins-repository.js";

export function makeCheckInUseCase() {
  const checkInsRepository = new PrismaCheckInsRepository();
  const gymsRepository = new PrismaGymsRepository();

  const useCase = new CheckinUseCase(checkInsRepository, gymsRepository);

  return useCase;
}
