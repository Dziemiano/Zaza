import { auth } from "@/auth";

const AnaliticsPage = async () => {
  const session = await auth();
  return <div>{JSON.stringify(session)}</div>;
};

export default AnaliticsPage;
