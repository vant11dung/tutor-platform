'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Cập nhật Type để TypeScript nhận diện thêm thuộc tính teachingMode
type TutorProfile = {
  id: string;
  bio: string;
  hourlyRate: number;
  subjects: string[];
  teachingMode: string;
  user: {
    name: string;
    avatar: string | null;
  };
};

// 1. Hàm tiện ích dùng để render Badge hình thức học
const renderTeachingMode = (mode: string) => {
  switch (mode) {
    case 'ONLINE':
      return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-100">🌐 Online</span>;
    case 'OFFLINE':
      return <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-md border border-orange-100">🏠 Offline</span>;
    case 'BOTH':
      return <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 text-xs font-semibold px-2.5 py-1 rounded-md border border-purple-100">🔄 On / Off</span>;
    default:
      return <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-md">🌐 Online</span>;
  }
};

export default function TutorsSearchPage() {
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✨ MỚI: Khai báo state để lưu chế độ lọc (Mặc định là 'ALL' - Tất cả)
  const [filterMode, setFilterMode] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // ✨ CẬP NHẬT EFFECT: Chạy lại mỗi khi gõ từ khóa HOẶC khi bấm nút đổi bộ lọc Online/Offline
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTutors(searchTerm, filterMode);
    }, 300); // Giảm xuống 0.3s cho phản hồi nhanh hơn

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterMode]);

  // ✨ CẬP NHẬT HÀM FETCH: Truyền thêm dữ liệu 'mode' lên API backend
  const fetchTutors = async (search: string, mode: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tutors?search=${encodeURIComponent(search)}&mode=${mode}`);
      if (res.ok) {
        const data = await res.json();
        setTutors(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header & Search Bar */}
      <div className="bg-blue-900 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-white mb-6">
            Tìm Gia Sư Phù Hợp Với Bạn
          </h1>
          <p className="text-blue-200 text-lg mb-8">
            Hàng trăm gia sư chất lượng cao đã được kiểm duyệt đang chờ bạn.
          </p>
          
          <div className="relative max-w-2xl mx-auto shadow-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm theo môn học (VD: Toán, Tiếng Anh) hoặc tên gia sư..."
              className="block w-full pl-12 pr-4 py-4 rounded-full border-0 focus:ring-4 focus:ring-blue-400 outline-none text-lg text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* ✨ MỚI THÊM: Giao diện cụm nút bấm bộ lọc bo tròn bo sát theo thiết kế của bồ */}
          <div className="flex justify-center gap-2 mt-6">
            <div className="inline-flex bg-white/10 p-1 rounded-full backdrop-blur-sm border border-white/10">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  filterMode === 'ALL'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterMode('ONLINE')}
                className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  filterMode === 'ONLINE'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                🌐 Dạy Online
              </button>
              <button
                onClick={() => setFilterMode('OFFLINE')}
                className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  filterMode === 'OFFLINE'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                🏠 Dạy Offline
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Tutor List */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6">
        {isLoading ? (
          <div className="text-center py-20 text-gray-500 font-medium text-lg">Đang tìm kiếm gia sư...</div>
        ) : tutors.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-500">Thử tìm kiếm với một môn học hoặc từ khóa khác nhé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tutors.map((tutor) => (
              <div key={tutor.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border-2 border-blue-100 flex-shrink-0 shadow-inner flex items-center justify-center text-white font-bold text-2xl uppercase">
                      {tutor.user.avatar ? (
                         <img src={tutor.user.avatar} alt={tutor.user.name} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center">
                           {tutor.user.name.charAt(0)}
                         </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-gray-900 text-xl">{tutor.user.name}</h3>
                      <p className="text-blue-600 font-semibold">{tutor.hourlyRate.toLocaleString('vi-VN')} đ/giờ</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {tutor.subjects.map((sub, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium border border-blue-100">
                          {sub}
                        </span>
                      ))}
                      {renderTeachingMode(tutor.teachingMode)}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-3 mb-6">
                    {tutor.bio}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                  <Link href={`/tutors/${tutor.id}`} className="flex-1 text-center bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium transition">
                    Xem Hồ Sơ
                  </Link>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition shadow-md shadow-blue-600/20">
                    Đặt Lịch Ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}