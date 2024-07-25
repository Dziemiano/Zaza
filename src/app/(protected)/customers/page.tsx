import { auth } from "@/auth";

const CustomersPage = async () => {
  const session = await auth();
  return <div>{JSON.stringify(session)}</div>;
};

export default CustomersPage;
