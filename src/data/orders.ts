import db from "@/db/db";

export const getAllOrders = async () => {
  try {
    const orders = await db.order.findMany({
      include: {
        customer: true,
        LineItem: true,
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
