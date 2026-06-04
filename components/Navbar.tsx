'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();

  // 1. Hàm xác định đường dẫn dựa trên Role
  const getDashboardLink = () => {
    const role = (session?.user as any)?.role;
    if (role === 'ADMIN') return '/admin';
    if (role === 'TUTOR') return '/tutor';
    return '/student';
  };

  // 2. Hàm tự động đổi tên nút bấm cực sang xịn mịn dựa trên Role
  const getButtonText = () => {
    const role = (session?.user as any)?.role;
    if (role === 'ADMIN') return 'Quản Lý Hệ Thống';
    if (role === 'TUTOR') return 'Không Gian Gia Sư';
    return 'Lịch Học Của Tôi'; // Mặc định cho học sinh
  };

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Bên trái: Logo + Chữ */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2.5 text-2xl font-black text-blue-600 tracking-tighter hover:opacity-90 transition">
              {/* ✨ ĐÃ CẢI TIẾN: Thêm rounded-xl bo góc mềm mại, shadow-sm đổ bóng nhẹ và bg-slate-50 tạo nền */}
              <img 
                src="/logo.png" 
                alt="TutorConnect Logo" 
                className="w-10 h-10 object-contain rounded-xl bg-slate-50 p-1 border border-gray-100/50 shadow-sm" 
              />
              <span>TutorConnect</span>
            </Link>
          </div>
          
          {/* Ở giữa: Các liên kết */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/tutors" className="text-gray-600 hover:text-blue-600 font-medium transition">Tìm Gia Sư</Link>
            <Link href="/register" className="text-gray-600 hover:text-blue-600 font-medium transition">Trở thành Gia Sư</Link>
          </div>

          {/* Bên phải: Nút Đăng nhập / User Menu cá nhân hóa */}
          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : status === 'authenticated' ? (
              <div className="flex items-center gap-4">
                
                {/* NÚT BẤM ĐÃ ĐƯỢC CẢI TIẾN TÊN THEO ROLE Ở ĐÂY */}
                <Link 
                  href={getDashboardLink()} 
                  className="text-sm font-bold text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 px-4 py-2.5 rounded-xl transition-all duration-200 border border-blue-100 shadow-sm"
                >
                  {getButtonText()}
                </Link>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm uppercase shadow-inner">
                    {session?.user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 max-w-[100px] truncate hidden sm:inline">
                    {session?.user?.name}
                  </span>
                </div>

                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm font-medium text-gray-400 hover:text-red-500 transition duration-150"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-semibold transition shadow-lg shadow-blue-600/30">
                Đăng Nhập
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}