import { auth } from "@/auth";

const DeliveriesPage = async () => {
  const session = await auth();
  return <div>{JSON.stringify(session)}</div>;
};

export default DeliveriesPage;
