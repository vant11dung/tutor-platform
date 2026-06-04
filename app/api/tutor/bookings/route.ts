import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma"

// 1. Lấy danh sách lịch hẹn của Gia sư đang đăng nhập
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "TUTOR") {
      return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    // Tìm profile gia sư trước để lấy tutorId
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: userId }
    });

    if (!tutorProfile) {
      return NextResponse.json([], { status: 200 }); // Chưa tạo profile thì chưa có lịch hẹn
    }

    // Lấy danh sách lịch hẹn và kèm theo thông tin của Học sinh đặt lịch
    const bookings = await prisma.booking.findMany({
      where: { tutorId: tutorProfile.id },
      include: {
        student: {
          select: { name: true, email: true }
        }
      },
      orderBy: { startTime: 'desc' } // Lịch mới nhất xếp lên đầu
    });

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}

// 2. Gia sư Chấp nhận hoặc Từ chối lịch hẹn
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "TUTOR") {
      return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { bookingId, status } = await req.json(); // status: 'APPROVED' hoặc 'REJECTED'

    if (!bookingId || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    // Bảo mật: Đảm bảo lịch hẹn này thực sự thuộc về gia sư đang đăng nhập
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { tutor: true }
    });

    if (!booking || booking.tutor.userId !== userId) {
      return NextResponse.json({ message: "Không tìm thấy lịch hẹn hoặc không có quyền" }, { status: 403 });
    }

    // Cập nhật trạng thái lịch hẹn
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: status }
    });

    return NextResponse.json({ message: "Cập nhật thành công", booking: updatedBooking }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}