import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Thay bằng đường dẫn chuẩn authOptions của bồ nếu có khác biệt
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    // 1. Kiểm tra session đăng nhập của học sinh
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: 'Bạn cần đăng nhập để thực hiện đánh giá!' }, { status: 401 });
    }

    // 2. Lấy dữ liệu từ client gửi lên
    const { tutorId, rating, comment, isAnonymous } = await req.json();

    if (!tutorId || !rating || !comment?.trim()) {
      return NextResponse.json({ message: 'Vui lòng điền đầy đủ số sao và nội dung nhận xét!' }, { status: 400 });
    }

    // 3. Tìm thông tin User (Học sinh) dựa vào email trong session
    const studentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!studentUser) {
      return NextResponse.json({ message: 'Tài khoản không tồn tại trên hệ thống!' }, { status: 404 });
    }

    // 4. Lưu dữ liệu khớp 100% với các trường quan hệ trong schema.prisma của bồ
    const newReview = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment: comment.trim(),
        isAnonymous: Boolean(isAnonymous),
        tutorId: tutorId,       // Khóa ngoại liên kết tới TutorProfile
        studentId: studentUser.id // Khóa ngoại liên kết tới User (Học sinh)
      }
    });

    return NextResponse.json({ message: 'Gửi đánh giá thành công!', data: newReview }, { status: 200 });

  } catch (error) {
    console.error("❌ Lỗi API Route Đánh giá Gia sư:", error);
    return NextResponse.json({ message: 'Lỗi hệ thống khi gửi phản hồi!' }, { status: 500 });
  }
}