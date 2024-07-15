import { currentRole } from "@/lib/auth";

const AdminPage = async () => {
  const role = await currentRole();
  return (
    <div>
      <h1>Admin Page</h1>
      Current role:{role}
    </div>
  );
};

export default AdminPage;
