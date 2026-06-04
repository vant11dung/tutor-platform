import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
    }

    // 2. Kiểm tra xem email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email này đã được sử dụng' }, { status: 400 });
    }

    // 3. Mã hóa (Hash) mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Lưu User vào Database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'STUDENT', // Mặc định là học sinh nếu không truyền role
      }
    });

    return NextResponse.json({ message: 'Đăng ký thành công', user: { id: user.id, email: user.email, role: user.role } }, { status: 201 });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi hệ thống' }, { status: 500 });
  }
}