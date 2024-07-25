import { auth } from "@/auth";

const EmployeesPage = async () => {
  const session = await auth();
  return <div>{JSON.stringify(session)}</div>;
};

export default EmployeesPage;
