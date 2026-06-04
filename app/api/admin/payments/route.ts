import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma" // Đường dẫn tuỳ thuộc vào vị trí file của bạn

export async function GET() {
  try {
    const payments = await prisma.booking.findMany({
      include: {
        student: true,
        tutor: { include: { user: true } }
      },
      orderBy: { startTime: 'desc' }
    });
    return NextResponse.json(payments);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { bookingId } = await req.json();

    // ✨ ĐÃ SỬA: Chuyển hẳn sang trạng thái COMPLETED khi admin bấm nút giải ngân tiền
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'APPROVED' } 
    });

    return NextResponse.json({ message: "Đã giả vờ chuyển tiền thành công!", updatedBooking });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}