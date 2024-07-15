import db from "@/db/db";

export const getAllCustomers = async () => {
  try {
    const customers = await db.customer.findMany({
      include: {
        branch: true,
        salesman: true,
        created_by: true,
        ContactPerson: true,
        DeliveryAdress: true,
      },
    });
    return customers;
  } catch (error) {
    return null;
  }
};
