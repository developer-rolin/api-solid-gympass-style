import type { CheckIn, Prisma } from "@prisma/client";
import type { CheckinsRepository } from "../check-ins-repository.js";
import { randomUUID } from "node:crypto";
import dayjs from "dayjs";

export class InMemoryCheckIns implements CheckinsRepository {
  public items: CheckIn[] = [];

  async save(checkIn: CheckIn) {
    const checkInIndex = this.items.findIndex((item) => item.id === checkIn.id);

    if (checkInIndex >= 0) {
      this.items[checkInIndex] = checkIn;
    }

    return checkIn;
  }

  async findById(id: string) {
    const checkIn = this.items.find((item) => item.id === id);

    if (!checkIn) return null;

    return checkIn;
  }

  async countByUserId(userId: string) {
    const checkIns = this.items.filter(
      (item) => item.user_id === userId,
    ).length;

    return checkIns;
  }

  async findManyByUserId(userId: string, page: number): Promise<CheckIn[]> {
    const checkIns = this.items
      .filter((item) => item.user_id === userId)
      .slice((page - 1) * 20, page * 20);

    return checkIns;
  }

  async findByUserIdOnDate(userId: string, date: Date) {
    const startOfTheDay = dayjs(date).startOf("date");
    const endOfTheDay = dayjs(date).endOf("date");

    const checkInOnSameDate = this.items.find((item) => {
      const checkInDate = dayjs(item.created_at);

      const isOnSameDay =
        checkInDate.isAfter(startOfTheDay) && checkInDate.isBefore(endOfTheDay);

      return item.user_id === userId && isOnSameDay;
    });

    if (!checkInOnSameDate) return null;

    return checkInOnSameDate;
  }

  async create(data: Prisma.CheckInUncheckedCreateInput) {
    const checkIn = {
      id: randomUUID(),
      created_at: new Date(),
      validated_at: data.validated_at ? new Date(data.validated_at) : null,
      user_id: data.user_id,
      gym_id: data.gym_id,
    };

    this.items.push(checkIn);

    return checkIn;
  }
}
