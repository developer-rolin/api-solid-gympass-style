import { CreateGymUseCase } from "../create-gym.js";
import { PrismaGymsRepository } from "@/repositories/prisma/prisma-gyms-repository.js";

export function makeCreategymUseCase() {
  const gymsRepository = new PrismaGymsRepository();

  const useCase = new CreateGymUseCase(gymsRepository);

  return useCase;
}
