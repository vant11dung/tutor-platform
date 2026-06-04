import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma"

// 1. API lấy toàn bộ danh sách đăng ký thuê lớp của học sinh để hiển thị lên trang admin
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Không có quyền truy cập!" }, { status: 403 });
    }

    const bookings = await prisma.booking.findMany({
      include: {
        student: { select: { name: true, email: true } },
        tutor: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ message: "Lỗi máy chủ khi lấy lịch học" }, { status: 500 });
  }
}

// 2. API cho Admin thực hiện bấm nút Duyệt hoặc Từ chối chốt lịch học
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Không có quyền truy cập!" }, { status: 403 });
    }

    const { bookingId, status } = await req.json(); // status: 'APPROVED' hoặc 'REJECTED'

    if (!bookingId || !status) {
      return NextResponse.json({ message: "Thiếu thông tin cập nhật!" }, { status: 400 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status }
    });

    return NextResponse.json({ message: "Cập nhật trạng thái lớp học thành công!", updatedBooking });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi hệ thống khi cập nhật" }, { status: 500 });
  }
}