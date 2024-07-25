import { auth } from "@/auth";

const ReportsPage = async () => {
  const session = await auth();
  return <div>{JSON.stringify(session)}</div>;
};

export default ReportsPage;
