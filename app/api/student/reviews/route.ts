import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
    }
    
    const studentId = (session.user as any).id;
    const { tutorId, rating, comment } = await req.json();

    const review = await prisma.review.create({
      data: {
        studentId,
        tutorId,
        rating: Number(rating),
        comment
      }
    });

    return NextResponse.json({ message: "Đánh giá thành công!", review }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}