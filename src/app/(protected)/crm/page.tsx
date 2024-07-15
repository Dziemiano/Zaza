import { auth } from "@/auth";

const CrmPage = async () => {
  const session = await auth();
  return <div>{JSON.stringify(session)}</div>;
};

export default CrmPage;
