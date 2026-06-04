import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Điều chỉnh đường dẫn nếu authOptions của bạn ở file khác
import { prisma } from "@/lib/prisma"
import { BookingStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Kiểm tra quyền học sinh
    if (!session || (session.user as any).role !== "STUDENT") {
      return NextResponse.json(
        { message: "Vui lòng đăng nhập tài khoản học sinh để đặt lịch!" },
        { status: 401 }
      );
    }

    const studentId = (session.user as any).id;
    const { tutorId, slot, totalPrice } = await req.json();

    if (!tutorId || !slot || !totalPrice) {
      return NextResponse.json({ message: "Thiếu thông tin đặt lịch!" }, { status: 400 });
    }

    // 1. LOGIC CHECK TRÙNG LỊCH: Kiểm tra xem học sinh đã đặt ca này với bất kỳ gia sư nào chưa
    const hasConflict = await prisma.booking.findFirst({
      where: {
        studentId: studentId,
        slot: slot,
        status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED] } // Chỉ tính ca đang chờ duyệt hoặc đã duyệt
      },
      include: {
        tutor: {
          include: {
            user: { select: { name: true } }
          }
        }
      }
    });

    // Nếu trùng lịch, trả về lỗi kèm thông báo chi tiết tên gia sư cũ
    if (hasConflict) {
      return NextResponse.json(
        { message: `Trùng lịch rồi! Bạn đã đặt ca [${slot}] với Gia sư ${hasConflict.tutor.user.name} trước đó.` },
        { status: 400 }
      );
    }

    // 2. NẾU KHÔNG TRÙNG LỊCH -> Tiến hành tạo lịch đặt mới vào database
    // Giả định thời gian học tự động lấy ngày hôm nay hoặc ngày mai (bạn có thể truyền từ frontend lên nếu cần chi tiết)
    const today = new Date();
    
    const newBooking = await prisma.booking.create({
      data: {
        studentId,
        tutorId,
        slot,
        totalPrice: Number(totalPrice),
        startTime: today, 
        endTime: today,
        status: BookingStatus.PENDING // Trạng thái ban đầu chờ gia sư duyệt
      }
    });

    return NextResponse.json(
      { message: "Gửi yêu cầu thuê gia sư thành công!", booking: newBooking },
      { status: 201 }
    );

  } catch (error) {
    console.error("BOOKING_ERROR:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra hệ thống, vui lòng thử lại sau!" }, { status: 500 });
  }
}