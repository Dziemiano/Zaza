import { auth } from "@/auth";

const FleetPage = async () => {
  const session = await auth();
  return <div>{JSON.stringify(session)}</div>;
};

export default FleetPage;
