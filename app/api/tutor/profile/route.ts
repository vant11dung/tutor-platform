import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "TUTOR") {
      return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    
    // 1. Thêm 'teachingMode' vào phần bóc tách dữ liệu từ body gửi lên
    const { bio, hourlyRate, subjects, availability, avatar, certificates, teachingMode } = body;

    const subjectsArray = typeof subjects === 'string' ? subjects.split(',').map((s: string) => s.trim()) : subjects;

    // Cập nhật Avatar vào bảng User
    if (avatar) {
      await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatar }
      });
    }

    // 2. Lưu/Cập nhật Hồ sơ gia sư (Đã bổ sung teachingMode)
    const profile = await prisma.tutorProfile.upsert({
      where: { userId: userId },
      update: {
        bio,
        hourlyRate: Number(hourlyRate),
        subjects: subjectsArray,
        availability: availability || [],
        certificates: certificates || [],
        status: 'PENDING',
        teachingMode: teachingMode // <-- Lưu hình thức dạy khi cập nhật profile
      },
      create: {
        userId: userId,
        bio,
        hourlyRate: Number(hourlyRate),
        subjects: subjectsArray,
        availability: availability || [],
        certificates: certificates || [],
        teachingMode: teachingMode // <-- Lưu hình thức dạy khi tạo mới profile
      }
    });

    return NextResponse.json({ message: "Lưu hồ sơ thành công!", profile }, { status: 200 });
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    return NextResponse.json({ message: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}