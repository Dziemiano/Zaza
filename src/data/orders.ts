import db from "@/db/db";

//TODO: get by month
export const getOrdersCount = async () => {
  try {
    const count = await db.order.count();
    return count;
  } catch (error) {
    return null;
  }
};

export const getAllOrders = async () => {
  try {
    const orders = await db.order.findMany({
      include: {
        customer: true,
        lineItems: { include: { wz: true } },
        user: true,
        wz: {
          include: {
            line_items: true,
          },
        },
        comments: true,
      },
    });
    return orders;
  } catch (error) {
    return null;
  }
};

export const getOrderById = async (id: string) => {
  try {
    const order = await db.order.findUnique({ where: { id } });
    return order;
  } catch (error) {
    return null;
  }
};

export const getOrdersByUserId = async (userId: string) => {
  try {
    const orders = await db.order.findMany({
      where: {
        created_by: userId,
      },
      include: {
        customer: true,
        lineItems: true,
        user: true,
        wz: true,
        comments: true,
      },
    });
    return orders;
  } catch (error) {
    return null;
  }
};
