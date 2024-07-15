"use server";

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export async function fetchLogs(entity?: string, entity_id?: string) {
  const where = {
    ...(entity && { entity }),
    ...(entity_id && { entity_id }),
  };

  const logs = await db.log.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
    },
  });

  return {
    logs,
  };
}
