import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      
      {/* 1. HERO SECTION (BANNER CHÍNH): PHÂN CHIA 2 CỘT HIỆN ĐẠI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 lg:pt-16 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Cột trái: Nội dung chữ */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
              ✨ Nền tảng kết nối gia sư công nghệ mới
            </span>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.15]">
              Mở Khóa Tiềm Năng <br />
              Cùng <span className="text-blue-600">Gia Sư Chuyên Nghiệp</span>
            </h1>
            
            <p className="text-base sm:text-lg text-gray-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              Hàng ngàn gia sư xuất sắc đang chờ đón bạn. Lựa chọn linh hoạt, học tập hiệu quả và chinh phục mọi mục tiêu học thuật cùng TutorConnect.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-2">
              <Link href="/tutors" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 text-center">
                Tìm Gia Sư Ngay
              </Link>
              <Link href="/become-tutor" className="w-full sm:w-auto border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold px-8 py-4 rounded-xl transition-all transform hover:-translate-y-0.5 text-center">
                Đăng Ký Làm Gia Sư
              </Link>
            </div>
          </div>

          {/* Cột phải: Dùng thẻ img thường để tránh lỗi bảo mật config */}
          <div className="lg:col-span-6 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-indigo-600/10 rounded-3xl blur-2xl -z-10 transform scale-95" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100 aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" 
                alt="Học nhóm hiện đại" 
                className="object-cover w-full h-full"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 2. KHỐI TÍNH NĂNG (FEATURES SECTION): CÓ HÌNH ẢNH MINH HỌA XỊN SÒ */}
      <section className="py-20 bg-gray-50/60 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Tại sao chọn TutorConnect?
            </h2>
            <p className="mt-4 text-lg text-gray-500 font-medium">
              Giải pháp toàn diện giúp trải nghiệm học tập của bạn trở nên đơn giản và an tâm hơn bao giờ hết.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80" 
                  alt="Gia sư kiểm duyệt"
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Gia sư được kiểm duyệt</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  100% hồ sơ, bằng cấp và kỹ năng sư phạm được đội ngũ Admin phê duyệt gắt gao trước khi hiển thị công khai trên hệ thống.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80" 
                  alt="Đặt lịch linh hoạt"
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Đặt lịch học linh hoạt</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  Hệ thống quản lý lịch trống trực quan giúp bạn chủ động đăng ký ca học phù hợp nhất với quỹ thời gian biểu cá nhân.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80" 
                  alt="Đánh giá chân thực"
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Đánh giá khách quan</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  Hàng ngàn phản hồi chân thực từ những học viên đi trước sẽ là cơ sở đáng tin cậy để bạn lựa chọn được người đồng hành ưng ý.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}