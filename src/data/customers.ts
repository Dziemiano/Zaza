import db from "@/db/db";

export const getAllCustomers = async () => {
  try {
    const customers = await db.customer.findMany({});
    return customers;
  } catch (error) {
    return null;
  }
};
