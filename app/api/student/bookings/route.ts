import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 401 });
    }
    const studentId = (session.user as any).id;

    const bookings = await prisma.booking.findMany({
      where: { studentId: studentId },
      include: {
        tutor: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      },
      orderBy: { startTime: 'desc' }
    });

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}