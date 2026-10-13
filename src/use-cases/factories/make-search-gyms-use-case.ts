import { SearchGymsUseCase } from "../search-gyms.js";
import { PrismaGymsRepository } from "@/repositories/prisma/prisma-gyms-repository.js";

export function makeSearchGymsUseCase() {
  const gymsRepository = new PrismaGymsRepository();

  const useCase = new SearchGymsUseCase(gymsRepository);

  return useCase;
}
