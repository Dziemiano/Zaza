import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const db = new PrismaClient();

interface LogData {
  entity: "order" | "user" | "customer" | "product" | "wz" | "nip";
  entity_id: string;
  entity_name?: string;
  eventType:
    | "created"
    | "updated"
    | "deleted"
    | "check_negative"
    | "check_positive"
    | "login_success"
    | "login_fail"
    | "logout";
  changedData?: { [key: string]: { old: any; new: any } };
}

export const logEvent = async ({
  entity,
  entity_id,
  entity_name,
  eventType,
  changedData,
}: LogData) => {
  const session = await auth();
  const user_id = session?.user?.id;
  await db.log.create({
    data: {
      user_id,
      entity,
      entity_id,
      entity_name,
      eventType,
      changedData: changedData ? JSON.stringify(changedData) : undefined,
    },
  });
};
