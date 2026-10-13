import { Prisma, type Gym } from "@prisma/client";
import type {
  FindManyNearbyParams,
  GymsRepository,
} from "../gyms-repository.js";
import { randomUUID } from "node:crypto";
import { getDistanceBetweenCoordinates } from "@/utils/get-distance-between-coordinates.js";

export class InMemoryGymsRepository implements GymsRepository {
  public items: Gym[] = [];

  async findManyNearby(params: FindManyNearbyParams) {
    return this.items.filter((item) => {
      const distance = getDistanceBetweenCoordinates(
        {
          latitude: params.latitude,
          longitude: params.longitude,
        },
        {
          latitude: item.latitude.toNumber(),
          longitude: item.longitude.toNumber(),
        },
      );

      return distance < 10;
    });
  }

  async searchMany(query: string, page: number) {
    return this.items
      .filter((item) => item.title.includes(query))
      .slice((page - 1) * 20, page * 20);
  }

  async create(data: Prisma.GymCreateInput) {
    const gym = {
      id: data.id ?? randomUUID(),
      title: data.title,
      description: data.description ?? null,
      phone: data.phone ?? null,
      latitude: new Prisma.Decimal(data.latitude.toString()),
      longitude: new Prisma.Decimal(data.longitude.toString()),
    };

    this.items.push(gym);

    return gym;
  }

  async findById(gymId: string) {
    const gym = this.items.find((item) => item.id === gymId);

    if (!gym) return null;

    return gym;
  }
}
