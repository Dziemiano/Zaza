import db from "@/db/db";
import { WzType } from "@prisma/client";

export const getWzCountByType = async (type: WzType, date: Date) => {
  const now = new Date(date);
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  try {
    const count = await db.wz.count({
      where: {
        type: type,
        OR: [
          {
            issue_date: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth,
            },
          },
          {
            AND: [
              { issue_date: null },
              {
                created_at: {
                  gte: firstDayOfMonth,
                  lte: lastDayOfMonth,
                },
              },
            ],
          },
        ],
      },
    });
    return count;
  } catch (error) {
    console.error("Error in getWzCountByType:", error);
    throw error;
  }
};
export const getAllWZs = async () => {
  try {
    const wzs = await db.wz.findMany({
      include: {
        line_items: true,
        Order: {
          include: {
            lineItems: true,
            customer: true,
            wz: {
              include: {
                line_items: true,
              },
            },
          },
        },
        User: true,
      },
    });
    return wzs;
  } catch (error) {
    return null;
  }
};
