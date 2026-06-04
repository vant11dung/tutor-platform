import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import BookingWidget from './BookingWidget';
import ReviewForm from './ReviewForm';
import CertificateViewer from './CertificateViewer';

interface PageProps {
  // Sửa kiểu dữ liệu params thành Promise theo đúng chuẩn Next.js 15
  params: Promise<{
    id: string;
  }>;
}

export default async function TutorDetailPage({ params }: PageProps) {
  // Giải nén params bằng await để tránh bị lỗi undefined trong Next.js 15
  const { id } = await params;

  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: id },
    include: {
      user: {
        select: { name: true, email: true, avatar: true }
      },
      reviews: {
        include: {
          student: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' } // Sắp xếp nhận xét mới nhất lên đầu
      }
    }
  });

  if (!tutor || tutor.status !== 'APPROVED') {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Banner / Cover Image */}
      <div className="h-64 bg-gradient-to-r from-blue-900 to-cyan-700 w-full object-cover relative">
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Cột trái: Thông tin chi tiết */}
          <div className="w-full lg:w-2/3 space-y-8">
            
            {/* Header Profile */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-white p-1.5 shadow-lg border border-gray-100 flex-shrink-0 flex items-center justify-center">
                  {tutor.user.avatar ? (
                     <img src={tutor.user.avatar} alt={tutor.user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                     <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-5xl uppercase">
                        {tutor.user.name.charAt(0)}
                     </div>
                  )}
                </div>

                <div className="text-center sm:text-left pt-2">
                  <h1 className="text-3xl font-extrabold text-gray-900">{tutor.user.name}</h1>
                  <p className="text-gray-500 font-medium mt-1">Gia sư chuyên nghiệp</p>
                  
                  {/* ✨ ĐÃ THÊM: Badge hình thức dạy trên trang chi tiết (Căn giữa mobile, căn trái desktop) */}
                  <div className="mt-3 flex justify-center sm:justify-start gap-2">
                    {tutor.teachingMode === 'ONLINE' && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">🌐 Dạy Online</span>}
                    {tutor.teachingMode === 'OFFLINE' && <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">🏠 Dạy Offline (Trực tiếp)</span>}
                    {tutor.teachingMode === 'BOTH' && <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">🔄 Dạy Online & Offline</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Giới thiệu bản thân */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Giới thiệu bản thân</h2>
              <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                {tutor.bio}
              </div>
            </div>

            {/* ✨ ĐÃ THÊM: KHỐI BẰNG CẤP & CHỨNG CHỈ (Hiển thị ngay dưới giới thiệu bản thân) */}
            <CertificateViewer certificates={tutor.certificates} />

            {/* Khối Đánh giá từ học sinh */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 pb-4 border-b border-gray-100 flex items-center justify-between">
                <span>Đánh giá từ học sinh ({tutor.reviews.length})</span>
              </h2> 

              {/* Form viết đánh giá */}
              <ReviewForm tutorId={tutor.id} />

              {tutor.reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm khóa học!
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  {tutor.reviews.map((review: any) => {
                    const isAnon = review.isAnonymous;
                    const displayName = isAnon ? "Học sinh ẩn danh" : review.student.name;
                    const displayAvatar = isAnon ? "👤" : review.student.name.charAt(0);

                    return (
                      <div key={review.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${isAnon ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-600'}`}>
                            {displayAvatar}
                          </div>
                          <div>
                            <span className="font-bold text-gray-800 text-sm block">{displayName}</span>
                            <div className="flex text-yellow-400 mt-0.5 scale-90 origin-left">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm pl-12 whitespace-pre-wrap leading-relaxed">{review.comment}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Cột phải: Widget Đặt lịch */}
          <div className="w-full lg:w-1/3">
            <BookingWidget 
              tutorId={tutor.id} 
              hourlyRate={tutor.hourlyRate} 
              availableSlotsString={JSON.stringify(tutor.availability || [])}
            />
          </div>

        </div>
      </div>
    </div>
  );
}