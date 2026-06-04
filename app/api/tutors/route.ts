import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // Lấy từ khóa tìm kiếm và chế độ lọc từ URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    
    // ✨ MỚI: Lấy thêm trạng thái bộ lọc (Mặc định là 'ALL')
    const mode = searchParams.get('mode') || 'ALL';

    // Lọc gia sư với điều kiện: Phải được APPROVED
    const tutors = await prisma.tutorProfile.findMany({
      where: {
        status: 'APPROVED',
        
        // 1. ĐOẠN CŨ CỦA BỒ: Lọc theo từ khóa tìm kiếm (môn học hoặc tên)
        ...(search ? {
          OR: [
            { subjects: { has: search } },
            { user: { name: { contains: search, mode: 'insensitive' } } }
          ]
        } : {}),

        // 2. ✨ ĐOẠN MỚI THÊM: Lọc theo hình thức Online / Offline
        // Nếu chọn ONLINE -> Lấy gia sư ONLINE + BOTH
        // Nếu chọn OFFLINE -> Lấy gia sư OFFLINE + BOTH
        ...(mode !== 'ALL' ? {
          teachingMode: {
            in: [mode as any, 'BOTH' as any] // Thêm 'as any' để triệt tiêu hoàn toàn lỗi báo đỏ Enum
          }
        } : {})
      },
      include: {
        // Lấy thêm tên và ảnh đại diện từ bảng User
        user: {
          select: { name: true, avatar: true }
        }
      },
      orderBy: {
        hourlyRate: 'asc' // Ưu tiên hiển thị mức giá từ thấp lên cao
      }
    });

    return NextResponse.json(tutors, { status: 200 });
  } catch (error) {
    console.error("Lỗi khi tải danh sách gia sư:", error);
    return NextResponse.json({ message: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}