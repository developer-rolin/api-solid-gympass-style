import type { CheckIn } from "@prisma/client";
import type { CheckinsRepository } from "@/repositories/check-ins-repository.js";
import type { GymsRepository } from "@/repositories/gyms-repository.js";
import { ResourceNotFound } from "./errors/resource-not-found.js";
import { getDistanceBetweenCoordinates } from "@/utils/get-distance-between-coordinates.js";
import { MaxDistanceError } from "./errors/max-distance-error.js";
import { MaxNumberOfCheckInsError } from "./errors/max-number-of-check-ins-error.js";

interface CheckinUseCaseRequest {
  userId: string;
  gymId: string;
  userLatitude: number;
  userLongitude: number;
}

interface CheckinUseCaseResponse {
  checkIn: CheckIn;
}

export class CheckinUseCase {
  constructor(
    private checkInsRepository: CheckinsRepository,
    private gymsRepository: GymsRepository,
  ) {}

  async execute({
    userId,
    gymId,
    userLatitude,
    userLongitude,
  }: CheckinUseCaseRequest): Promise<CheckinUseCaseResponse> {
    const gym = await this.gymsRepository.findById(gymId);

    if (!gym) throw new ResourceNotFound();

    const distance = getDistanceBetweenCoordinates(
      { latitude: userLatitude, longitude: userLongitude },
      {
        latitude: gym.latitude.toNumber(),
        longitude: gym.longitude.toNumber(),
      },
    );

    const MAX_DISTANCE_IN_KILOMETERS = 0.1;

    if (distance > MAX_DISTANCE_IN_KILOMETERS) {
      throw new MaxDistanceError();
    }

    const checkInOnSameDate = await this.checkInsRepository.findByUserIdOnDate(
      userId,
      new Date(),
    );

    if (checkInOnSameDate) throw new MaxNumberOfCheckInsError();

    const checkIn = await this.checkInsRepository.create({
      gym_id: gymId,
      user_id: userId,
    });

    return { checkIn };
  }
}
