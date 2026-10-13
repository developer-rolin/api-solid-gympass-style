import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository.js";
import { GetUserProfileUseCase } from "../get-user-profile.js";

export function makeGetUserProfileUseCase() {
  const prismaUsersRepository = new PrismaUsersRepository();

  const useCase = new GetUserProfileUseCase(prismaUsersRepository);

  return useCase;
}
