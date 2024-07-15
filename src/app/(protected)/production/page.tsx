import { auth } from "@/auth";

const ProductionPage = async () => {
  const session = await auth();
  return <div>{JSON.stringify(session)}</div>;
};

export default ProductionPage;
