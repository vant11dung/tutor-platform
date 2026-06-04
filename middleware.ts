import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Nếu vào trang Gia sư nhưng không phải role TUTOR -> Đá về trang chủ
    if (path.startsWith("/tutor") && token?.role !== "TUTOR") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    // Nếu vào trang Admin nhưng không phải role ADMIN -> Đá về trang chủ
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      // Yêu cầu phải có token (đã đăng nhập) mới được cho qua các route cấu hình bên dưới
      authorized: ({ token }) => !!token,
    },
  }
);

// Khai báo những đường dẫn cần được bảo vệ
export const config = { 
  matcher: ["/tutor/:path*", "/admin/:path*", "/student/:path*"] 
};