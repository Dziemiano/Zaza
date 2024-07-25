import { auth } from "@/auth";

const ProductsPage = async () => {
  const session = await auth();
  return <div>{JSON.stringify(session)}</div>;
};

export default ProductsPage;
