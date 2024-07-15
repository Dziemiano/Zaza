import { auth } from "@/auth";
import LogTable from "@/components/reusable/logsTable";
const EmployeesPage = async () => {
  const session = await auth();
  return (
    <div>
      {JSON.stringify(session)}
      <LogTable />
    </div>
  );
};

export default EmployeesPage;
