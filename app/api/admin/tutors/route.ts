import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma"; // Thêm dấu {} vào đây

// 1. Lấy danh sách hồ sơ đang chờ duyệt
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });
    }

    const pendingProfiles = await prisma.tutorProfile.findMany({
      where: {
        status: 'PENDING'
      },
      // Lấy thêm thông tin Tên và Email từ bảng User (Quan hệ 1-1)
      include: {
        user: {
          select: { name: true, email: true, avatar: true }
        }
      },
      orderBy: {
        // Hồ sơ nộp trước sẽ hiển thị lên trước
        user: { createdAt: 'asc' } 
      }
    });

    return NextResponse.json(pendingProfiles, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}

// 2. Cập nhật trạng thái hồ sơ (Duyệt hoặc Từ chối)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });
    }

    const { profileId, newStatus } = await req.json();

    if (!profileId || !['APPROVED', 'REJECTED'].includes(newStatus)) {
      return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    const updatedProfile = await prisma.tutorProfile.update({
      where: { id: profileId },
      data: { status: newStatus }
    });

    return NextResponse.json({ message: "Đã cập nhật trạng thái", profile: updatedProfile }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}