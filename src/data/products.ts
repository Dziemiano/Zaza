import db from "@/db/db";

export const getAllProducts = async () => {
  try {
    const products = await db.product.findMany({});
    return products;
  } catch (error) {
    return null;
  }
};
