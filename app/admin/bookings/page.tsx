'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

type BookingAdminType = {
  id: string;
  slot: string;
  totalPrice: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  student: { name: string; email: string };
  tutor: { user: { name: string } };
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingAdminType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminBookings();
  }, []);

  const loadAdminBookings = async () => {
    try {
      const res = await fetch('/api/admin/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch {
      toast.error("Không thể tải danh sách lịch học!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    const confirmAction = confirm(`Bạn có chắc chắn muốn ${newStatus === 'APPROVED' ? 'PHÊ DUYỆT' : 'TỪ CHỐI'} yêu cầu đặt lớp này?`);
    if (!confirmAction) return;

    const activeToast = toast.loading("Đang cập nhật...");
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: newStatus })
      });

      if (res.ok) {
        toast.success("Cập nhật trạng thái lớp thành công! 🎉", { id: activeToast });
        loadAdminBookings(); // Tải lại danh sách
      } else {
        toast.error("Cập nhật thất bại.", { id: activeToast });
      }
    } catch {
      toast.error("Lỗi kết nối mạng.", { id: activeToast });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">🛡️ Admin Dashboard: Quản Lý Lịch Thuê Gia Sư</h1>
          <p className="text-sm text-gray-500 mt-1">Duyệt hoặc từ chối các yêu cầu kết nối học tập giữa Học sinh và Gia sư trên hệ thống.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Đang tải dữ liệu lớp học...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Hiện tại chưa có lượt đăng ký thuê gia sư nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
                    <th className="p-4">Học Sinh Đăng Ký</th>
                    <th className="p-4">Gia Sư Được Thuê</th>
                    <th className="p-4">Ca Học Đăng Ký</th>
                    <th className="p-4">Học Phí</th>
                    <th className="p-4">Trạng Thái</th>
                    <th className="p-4 text-center">Hành Động Chốt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                  {bookings.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{item.student.name}</div>
                        <div className="text-xs text-gray-400">{item.student.email}</div>
                      </td>
                      <td className="p-4 font-semibold text-gray-800">👨‍🏫 {item.tutor.user.name}</td>
                      <td className="p-4">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium border border-blue-100">
                          {item.slot}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-gray-900">{item.totalPrice.toLocaleString('vi-VN')}đ</td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          item.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          item.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {item.status === 'PENDING' ? '⏳ Chờ Admin Duyệt' : item.status === 'APPROVED' ? '✅ Đã Chốt Học' : '❌ Đã Từ Chối'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {item.status === 'PENDING' ? (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
                            >
                              Phê Duyệt
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'REJECTED')}
                              className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
                            >
                              Từ Chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Đã xử lý xong</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}