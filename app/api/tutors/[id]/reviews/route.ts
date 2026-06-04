import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ message: "Vui lòng đăng nhập tài khoản học sinh để đánh giá" }, { status: 401 });
    }

    const studentId = (session.user as any).id;
    const tutorId = params.id;
    const { rating, comment, isAnonymous } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Vui lòng chọn số sao từ 1 đến 5 sao!" }, { status: 400 });
    }

    // Lưu vào database
    const newReview = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment: comment || "",
        isAnonymous: Boolean(isAnonymous),
        tutorId: tutorId,
        studentId: studentId,
      },
    });

    return NextResponse.json({ message: "Đánh giá thành công!", newReview }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi hệ thống khi gửi phản hồi" }, { status: 500 });
  }
}