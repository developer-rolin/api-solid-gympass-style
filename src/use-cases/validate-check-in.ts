import type { CheckIn } from "@prisma/client";
import type { CheckinsRepository } from "@/repositories/check-ins-repository.js";
import { ResourceNotFound } from "./errors/resource-not-found.js";
import dayjs from "dayjs";
import { LateCheckInValidationError } from "./errors/late-check-in-validation-error.js";

interface ValidateCheckInUseCaseRequest {
  checkInId: string;
}

interface ValidateCheckInUseCaseResponse {
  checkIn: CheckIn;
}

export class ValidateCheckInUseCase {
  constructor(private checkInsRepository: CheckinsRepository) {}

  async execute({
    checkInId,
  }: ValidateCheckInUseCaseRequest): Promise<ValidateCheckInUseCaseResponse> {
    const checkIn = await this.checkInsRepository.findById(checkInId);

    if (!checkIn) throw new ResourceNotFound();

    const distanceInMinutesFromCheckInCreation = dayjs(new Date()).diff(
      checkIn.created_at,
      "minutes",
    );

    if (distanceInMinutesFromCheckInCreation > 20)
      throw new LateCheckInValidationError();

    checkIn.validated_at = new Date();

    await this.checkInsRepository.save(checkIn);

    return { checkIn };
  }
}
