import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const date = searchParams.get("date");

  if (!type || !date) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const issueDate = new Date(date);
  const startOfMonth = new Date(
    issueDate.getFullYear(),
    issueDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    issueDate.getFullYear(),
    issueDate.getMonth() + 1,
    0
  );

  try {
    const monthlyDocs = await prisma.wz.findMany({
      where: {
        type: type,
        issue_date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const nextNumber = monthlyDocs.length > 0 ? monthlyDocs.length + 1 : 1;
    return NextResponse.json({ count: nextNumber });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
