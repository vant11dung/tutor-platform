'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';

type Booking = {
  id: string;
  slot: string;
  totalPrice: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  tutor: { 
    id: string; 
    user: { name: string; email: string };
    tutorProfile?: { teachingMode: 'ONLINE' | 'OFFLINE' | 'BOTH' }; // ✨ THÊM ĐỂ ĐỒNG BỘ TRƯỜNG DỮ LIỆU
  };
};

export default function StudentDashboardPro() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewTutorId, setReviewTutorId] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  
  // Thêm State để chuyển đổi giữa dạng Bảng và dạng Thời khóa biểu trực quan
  const [activeTab, setActiveTab] = useState<'table' | 'calendar'>('calendar');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/student/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      toast.error('Không thể tải lịch học.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadToast = toast.loading('Đang gửi đánh giá...');
    try {
      const res = await fetch('/api/student/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorId: reviewTutorId, ...reviewData })
      });
      if (res.ok) {
        toast.success('Cảm ơn phản hồi quý giá của bạn! ❤️', { id: loadToast });
        setReviewTutorId(null);
      } else {
        toast.error('Gửi đánh giá thất bại.', { id: loadToast });
      }
    } catch {
      toast.error('Lỗi kết nối.', { id: loadToast });
    }
  };

  // --- LOGIC XỬ LÝ THỜI KHÓA BIỂU TUẦN ---
  const daysOfWeek = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
  
  // ✨ ĐÃ SỬA: Hàm lọc lịch học thông minh xử lý triệt để lỗi lệch chữ "CN" và "Chủ Nhật"
  const getBookingsForDay = (day: string) => {
    return bookings.filter(b => {
      // 1. Không hiển thị các lịch bị hủy (REJECTED)
      if (b.status === 'REJECTED') return false;
      
      // 2. Nếu cột hiện tại là "Chủ Nhật", chấp nhận cả ca học chứa chữ "CN" hoặc chứa chữ "Chủ Nhật"
      if (day === "Chủ Nhật") {
        return b.slot.includes("CN") || b.slot.includes("Chủ Nhật");
      }
      
      // 3. Các thứ khác (Thứ 2 -> Thứ 7) so sánh chuỗi như bình thường
      return b.slot.includes(day);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Banner Học Sinh Tươi Mới */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-black">Xin chào, {session?.user?.name}! 👋</h1>
            <p className="text-emerald-100 mt-1">Hôm nay bạn muốn học môn gì nào? Quản lý lịch học thông minh, tránh trùng lịch.</p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Khối quản lý lịch dạy & Thời khóa biểu */}
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100/50 p-8">
          
          {/* Tiêu đề + Nút thêm gia sư */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg">📅</span>
              Lịch trình học tập của tôi
            </h2>
            <div className="flex items-center gap-2">
              <Link href="/tutors" className="text-sm font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl transition whitespace-nowrap">
                ➕ Thuê thêm Gia sư
              </Link>
            </div>
          </div>

          {/* THANH CHUYỂN TAB: Thời khóa biểu tuần <-> Bảng danh sách */}
          <div className="flex p-1 bg-gray-100 rounded-xl max-w-md mb-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 py-2 rounded-lg text-center transition ${activeTab === 'calendar' ? 'bg-white text-emerald-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900'}`}
            >
              🗓️ Thời khóa biểu tuần
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`flex-1 py-2 rounded-lg text-center transition ${activeTab === 'table' ? 'bg-white text-emerald-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900'}`}
            >
              📋 Danh sách chi tiết
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-400 animate-pulse">Đang đồng bộ lịch học...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">Bạn chưa có lịch học nào được đăng ký.</p>
            </div>
          ) : (
            <>
              {/* TÁC VỤ 1: HIỂN THỊ DẠNG THỜI KHÓA BIỂU TUẦN TRỰC QUAN */}
              {activeTab === 'calendar' && (
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {daysOfWeek.map((day) => {
                    const dayBookings = getBookingsForDay(day);
                    return (
                      <div key={day} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col min-h-[220px]">
                        <div className="text-center font-bold text-sm text-gray-700 pb-2 border-b border-gray-200 mb-3">
                          {day}
                        </div>
                        
                        <div className="space-y-3 flex-1 flex flex-col justify-start">
                          {dayBookings.length === 0 ? (
                            <div className="text-center text-xs text-gray-300 italic my-auto">
                              Trống lịch
                            </div>
                          ) : (
                            dayBookings.map((booking) => {
                              // Tách lấy phần ca học nhỏ bên trong dấu ngoặc đơn hoặc chuỗi đằng sau dấu gạch ngang
                              const shortTime = booking.slot.split('-')[1] || booking.slot;
                              
                              return (
                                <div 
                                  key={booking.id} 
                                  className={`p-2.5 rounded-xl border text-xs relative group transition shadow-sm ${
                                    booking.status === 'APPROVED' 
                                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                                      : 'bg-amber-50/70 border-amber-200 text-amber-900'
                                  }`}
                                >
                                  <div className="font-bold truncate" title={booking.tutor.user.name}>
                                    👨‍🏫 {booking.tutor.user.name}
                                  </div>
                                  
                                  {/* ✨ THÊM MỚI: Hiển thị hình thức học nhỏ gọn ở lịch tuần */}
                                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                    {booking.tutor.tutorProfile?.teachingMode === 'ONLINE' ? '🌐 Online' :
                                     booking.tutor.tutorProfile?.teachingMode === 'OFFLINE' ? '🏠 Offline' : '🔄 On/Off'}
                                  </div>

                                  <div className="text-[11px] opacity-80 mt-1 font-medium">
                                    🕒 {shortTime.replace('Sáng', '').replace('Chiều', '').replace('Tối', '').trim()}
                                  </div>
                                  <div className="mt-1.5 flex justify-between items-center text-[10px]">
                                    <span className={`px-1.5 py-0.5 rounded-md font-bold ${
                                      booking.status === 'APPROVED' ? 'bg-emerald-200/60' : 'bg-amber-200/60'
                                    }`}>
                                      {booking.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TÁC VỤ 2: HIỂN THỊ DẠNG BẢNG CHI TIẾT (CODE GỐC CỦA BẠN) */}
              {activeTab === 'table' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-4">Gia Sư Giảng Dạy</th>
                        <th className="pb-4">Thời Gian Học (Ca)</th>
                        <th className="pb-4">Tổng Học Phí</th>
                        <th className="pb-4">Trạng Thái Lớp</th>
                        <th className="pb-4 text-center">Đánh Giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50/50 transition">
                          <td className="py-4 font-semibold text-gray-900">
                            <div>{booking.tutor.user.name}</div>
                            {/* ✨ THÊM MỚI: Dòng hiển thị hình thức học dưới dạng text phụ nhỏ */}
                            <div className="text-xs font-normal text-slate-400 mt-1">
                              {booking.tutor.tutorProfile?.teachingMode === 'ONLINE' ? '🌐 Học Online' :
                               booking.tutor.tutorProfile?.teachingMode === 'OFFLINE' ? '🏠 Học Offline' : '🔄 Cả Online & Offline'}
                            </div>
                          </td>
                          <td className="py-4 text-gray-600 font-medium">
                            <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100">{booking.slot}</span>
                          </td>
                          <td className="py-4 font-bold text-gray-900">{booking.totalPrice.toLocaleString('vi-VN')}đ</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              booking.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              booking.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {booking.status === 'PENDING' ? '⏳ Chờ duyệt' : booking.status === 'APPROVED' ? '✅ Đã xác nhận' : '❌ Đã hủy'}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            {booking.status === 'APPROVED' ? (
                              <button onClick={() => setReviewTutorId(booking.tutor.id)} className="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold text-xs px-3 py-1.5 rounded-xl shadow-md hover:brightness-105 transition">
                                ⭐ Viết Review
                              </button>
                            ) : (
                              <span className="text-gray-300 italic text-xs">Chưa diễn ra</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Feedback (Code Gốc Giữ Nguyên Đẹp Lộng Lẫy) */}
        {reviewTutorId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Để lại Đánh giá</h3>
              <p className="text-xs text-gray-500 mb-4">Phản hồi của bạn giúp cải thiện chất lượng gia sư trên hệ thống.</p>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Đánh giá độ hài lòng</label>
                  <div className="flex gap-2 text-2xl justify-center bg-gray-50 p-3 rounded-2xl">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} onClick={() => setReviewData({...reviewData, rating: star})} className={`cursor-pointer transition ${reviewData.rating >= star ? 'text-amber-400 scale-110' : 'text-gray-300'}`}>★</span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Lời nhận xét</label>
                  <textarea required rows={3} onChange={(e) => setReviewData({...reviewData, comment: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm" placeholder="Gia sư giảng bài rất nhiệt tình..." />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setReviewTutorId(null)} className="px-4 py-2 text-gray-500 text-sm font-medium hover:bg-gray-100 rounded-xl">Đóng</button>
                  <button type="submit" className="px-5 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition">Gửi đánh giá</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}