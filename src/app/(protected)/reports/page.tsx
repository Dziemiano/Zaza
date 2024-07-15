import { auth } from "@/auth";
import { getAllWZs } from "@/data/documents";
import { WzTable } from "@/components/documents/wzTable";

const ReportsPage = async () => {
  const session = await auth();
  const wz = await getAllWZs();
  return (
    <div>
      <WzTable wzs={wz} />
    </div>
  );
};

export default ReportsPage;
