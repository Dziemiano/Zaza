import { auth } from "@/auth";

const CarloadPage = async () => {
  const session = await auth();
  return <div>{JSON.stringify(session)}</div>;
};

export default CarloadPage;
