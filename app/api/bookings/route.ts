import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma"
import { BookingStatus } from "@prisma/client"; // 1. Thêm import Enum này vào ở trên cùng

export async function POST(req: Request) {
  try {
    // Kiểm tra quyền: Chỉ HỌC SINH (STUDENT) mới được đặt lịch
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ message: "Vui lòng đăng nhập bằng tài khoản Học sinh để đặt lịch" }, { status: 403 });
    }

    const studentId = (session.user as any).id;
    const body = await req.json();
    
    // 2. Thêm lại 'slot' lấy từ body ra nhé
    const { tutorId, date, hours, totalPrice, slot } = body; 

    if (!date || !hours || !slot) {
      return NextResponse.json({ message: "Vui lòng chọn ngày, số giờ học và ca học (slot)" }, { status: 400 });
    }

    // Tính toán thời gian
    const startTime = new Date(date);
    const endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000);

    // 3. Tạo Booking trong Database
    const booking = await prisma.booking.create({
      data: {
        slot, // 4. Đưa slot vào lại đây
        startTime: new Date(startTime), 
        endTime: new Date(endTime),     
        totalPrice: Number(totalPrice), 
        status: BookingStatus.PENDING, // 5. Sửa thành Enum chuẩn ở đây thay vì dùng chữ "PENDING"
        student: { connect: { id: studentId } },
        tutor: { connect: { id: tutorId } },
      }
    });

    return NextResponse.json({ message: "Đặt lịch thành công!", booking }, { status: 201 });
  } catch (error) {
    console.error("Lỗi khi đặt lịch:", error);
    return NextResponse.json({ message: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}