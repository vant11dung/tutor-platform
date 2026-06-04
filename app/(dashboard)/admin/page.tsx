'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // ✨ Đã kích hoạt sử dụng trường này

type TutorProfile = {
  id: string;
  bio: string;
  hourlyRate: number;
  subjects: string[];
  certificates: string[]; // Khai báo thêm trường bằng cấp
  teachingMode: 'ONLINE' | 'OFFLINE' | 'BOTH'; // ✨ THÊM TRƯỜNG HÌNH THỨC DẠY
  user: {
    name: string;
    email: string;
    avatar: string | null; // Khai báo thêm avatar
  };
};

export default function AdminDashboardPro() {
  const { data: session } = useSession();
  const [profiles, setProfiles] = useState<TutorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ✨ THÊM DÒNG NÀY: Để lấy đường dẫn hiện tại và làm sáng Tab tương ứng
  const pathname = usePathname();

  // Mở ảnh phóng to
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 💰 THÊM MỚI STATE: Phục vụ quản lý dòng tiền trêu
  const [payments, setPayments] = useState<any[]>([]);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState(true);

  useEffect(() => {
    // Tùy theo URL hành trình để gọi API chính xác bồ nhé
    if (pathname === '/admin/payments') {
      fetchPayments();
    } else {
      fetchPendingProfiles();
    }
  }, [pathname]);

  const fetchPendingProfiles = async () => {
    try {
      const res = await fetch('/api/admin/tutors');
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách');
    } finally {
      setIsLoading(false);
    }
  };

  // 💰 THÊM MỚI LỆNH: Lấy danh sách giao dịch ảo từ phía học sinh chuyển tới gia sư
  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách dòng tiền');
    } finally {
      setIsPaymentsLoading(false);
    }
  };

  const handleUpdateStatus = async (profileId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`Bạn có chắc muốn ${newStatus === 'APPROVED' ? 'DUYỆT' : 'TỪ CHỐI'} hồ sơ này?`)) return;

    const loadToast = toast.loading('Đang xử lý...');
    try {
      const res = await fetch('/api/admin/tutors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, newStatus })
      });

      if (res.ok) {
        setProfiles(profiles.filter(p => p.id !== profileId));
        toast.success(newStatus === 'APPROVED' ? 'Đã phê duyệt hồ sơ!' : 'Đã từ chối hồ sơ.', { id: loadToast });
      } else {
        toast.error('Có lỗi xảy ra!', { id: loadToast });
      }
    } catch (error) {
      toast.error('Lỗi kết nối', { id: loadToast });
    } finally {
        // Đảm bảo đóng loading toast nếu có vấn đề
        toast.dismiss(loadToast);
    }
  };

  // 💰 THÊM MỚI LỆNH: Admin bấm nút giả vờ giải ngân tiền cho gia sư
  const handleTransferToTutor = async (bookingId: string) => {
    if (!confirm("Bồ có chắc chắn muốn giả vờ chuyển tiền cho gia sư này không? Hệ thống sẽ trừ tiền quỹ ảo!")) return;

    const loadToast = toast.loading('Đang xử lý chuyển tiền...');
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });

      if (res.ok) {
        toast.success("Đã chuyển thành công! Tiền ảo hệ thống đã được gửi đi.", { id: loadToast });
        fetchPayments(); // Tải lại dữ liệu bảng dòng tiền
      } else {
        toast.error('Lỗi hệ thống khi chuyển tiền.', { id: loadToast });
      }
    } catch (error) {
      toast.error('Lỗi kết nối', { id: loadToast });
    } finally {
      toast.dismiss(loadToast);
    }
  };

  // Màn hình loading riêng biệt cho từng Tab để không làm vỡ giao diện
  if (pathname === '/admin/payments' && isPaymentsLoading) {
    return <div className="text-center py-20 text-slate-500 font-medium">Đang tải luồng tiền hệ thống...</div>;
  }
  if (pathname !== '/admin/payments' && isLoading) {
    return <div className="text-center py-20 text-gray-500 font-medium">Đang tải dữ liệu hồ sơ...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Tiêu đề chính */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Quản trị viên</h1>
            <p className="text-slate-500 mt-2">Duyệt hồ sơ gia sư và quản lý chất lượng nền tảng.</p>
          </div>
          
          {/* ✨ ĐÃ CẢI TIẾN: Badge hiển thị động theo Tab */}
          <div className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/30">
            {pathname === '/admin/payments' 
              ? `${payments.filter(p => p.status === 'PENDING').length} giao dịch giữ tiền`
              : `${profiles.length} hồ sơ chờ duyệt`
            }
          </div>
        </div>

        {/* Thanh điều hướng chuyển đổi (Tabs) giữa các mục quản lý */}
        <div className="flex gap-6 border-b border-slate-200 mb-8">
          <Link 
            href="/admin" 
            className={`pb-4 text-sm font-bold transition-all border-b-2 tracking-wide ${
              pathname === '/admin' 
                ? 'border-blue-600 text-blue-600 font-black' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            📋 Duyệt Hồ Sơ Gia Sư
          </Link>
          
          <Link 
            href="/admin/bookings" 
            className={`pb-4 text-sm font-bold transition-all border-b-2 tracking-wide ${
              pathname === '/admin/bookings' 
                ? 'border-blue-600 text-blue-600 font-black' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            ⏳ Duyệt Lịch Thuê Lớp
          </Link>

          {/* 💰 THÊM MỚI TAB LINK: Nút bấm sang trang Quản lý dòng tiền */}
          <Link 
            href="/admin/payments" 
            className={`pb-4 text-sm font-bold transition-all border-b-2 tracking-wide ${
              pathname === '/admin/payments' 
                ? 'border-blue-600 text-blue-600 font-black' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            💰 Quản Lý Dòng Tiền
          </Link>
        </div>

        {/* 🌟 ĐÃ BIẾN ĐỔI: Chuyển nội dung hiển thị dựa theo URL hiện tại */}
        {pathname === '/admin/payments' ? (
          /* ==================== GIAO DIỆN QUẢN LÝ DÒNG TIỀN ==================== */
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-700 font-bold text-sm">
                    <th className="p-5">Người chuyển (Học sinh)</th>
                    <th className="p-5">Số tiền ảo nhận</th>
                    <th className="p-5">Người nhận (Gia sư)</th>
                    <th className="p-5">Trạng thái quỹ</th>
                    <th className="p-5 text-center">Hành động điều phối</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-600">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-5 text-slate-800">{p.student?.name || "Học sinh ẩn danh"}</td>
                      <td className="p-5 text-blue-600 font-black text-base">{Number(p.totalPrice).toLocaleString('vi-VN')} đ</td>
                      <td className="p-5 text-slate-800">{p.tutor?.user?.name || "Gia sư"}</td>
                      <td className="p-5">
                        {p.status === 'PENDING' ? (
                          <span className="bg-amber-50 border border-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold inline-block">
                            Hệ thống đang giữ tiền
                          </span>
                        ) : (
                          <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold inline-block">
                            Đã giải ngân cho Gia sư
                          </span>
                        )}
                      </td>
                      <td className="p-5 text-center">
                        {p.status === 'PENDING' ? (
                          <button
                            onClick={() => handleTransferToTutor(p.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-xl font-bold shadow-md shadow-blue-600/20 transition transform active:scale-95"
                          >
                            💸 Chuyển cho Gia sư
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic font-medium">Giao dịch hoàn tất</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {payments.length === 0 && (
              <div className="p-16 text-center">
                <div className="text-5xl mb-3">💸</div>
                <h3 className="text-lg font-bold text-slate-800">Chưa có giao dịch nào</h3>
                <p className="text-slate-500 mt-1">Nền tảng chưa ghi nhận dòng tiền nào được đẩy lên hệ thống.</p>
              </div>
            )}
          </div>
        ) : (
          /* ==================== GIỮ NGUYÊN: HỒ SƠ GIA SƯ BAN ĐẦU ==================== */
          profiles.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-16 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-slate-800">Tất cả đã được xử lý!</h3>
              <p className="text-slate-500 mt-2">Hiện tại không có hồ sơ mới nào cần duyệt.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {profiles.map((profile) => (
                <div key={profile.id} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 flex flex-col h-full hover:-translate-y-1 transition transform duration-300">
                  
                  {/* 1. Header: Avatar + Tên */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex-shrink-0">
                      {profile.user.avatar ? (
                        <img src={profile.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl uppercase">
                          {profile.user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg line-clamp-1">{profile.user.name}</h3>
                      <p className="text-sm text-slate-500">{profile.user.email}</p>
                    </div>
                  </div>

                  {/* 2. Body: Môn học, Giá, Giới thiệu */}
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Môn dạy</span>
                        <div className="flex flex-wrap gap-1">
                          {profile.subjects.map((sub, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-md font-medium">{sub}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Mức lương</span>
                        <span className="text-slate-800 font-bold">{profile.hourlyRate.toLocaleString('vi-VN')} đ/h</span>
                      </div>
                    </div>

                    {/* ✨ THÊM MỚI: Hiển thị hình thức giảng dạy */}
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Hình thức giảng dạy</span>
                      <span className={`text-xs px-2.5 py-1 rounded-md font-bold inline-block border ${
                        profile.teachingMode === 'ONLINE' ? 'bg-cyan-50 border-cyan-100 text-cyan-600' :
                        profile.teachingMode === 'OFFLINE' ? 'bg-orange-50 border-orange-100 text-orange-600' : 
                        'bg-purple-50 border-purple-100 text-purple-600'
                      }`}>
                        {profile.teachingMode === 'ONLINE' ? '🌐 Học Online' :
                         profile.teachingMode === 'OFFLINE' ? '🏠 Học Offline' : '🔄 Cả Online & Offline'}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Giới thiệu bản thân</span>
                      <p className="text-sm text-slate-600 line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100">{profile.bio}</p>
                    </div>

                    {/* 3. Ảnh Chứng Chỉ */}
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Bằng cấp & Minh chứng ({profile.certificates?.length || 0})</span>
                      {profile.certificates && profile.certificates.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                          {profile.certificates.map((cert, idx) => (
                            <img 
                              key={idx} 
                              src={cert} 
                              onClick={() => setPreviewImage(cert)}
                              className="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition border border-slate-200 flex-shrink-0" 
                              alt={`Cert ${idx}`} 
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-rose-500 bg-rose-50 p-2 rounded-md font-medium">⚠️ Chưa cung cấp bằng cấp</div>
                      )}
                    </div>
                  </div>

                  {/* 4. Footer: Nút Hành động */}
                  <div className="mt-6 flex gap-3 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => handleUpdateStatus(profile.id, 'REJECTED')}
                      className="flex-1 bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 py-2.5 rounded-xl font-bold transition"
                    >
                      Từ chối
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(profile.id, 'APPROVED')}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-bold transition shadow-lg shadow-emerald-500/30"
                    >
                      Phê duyệt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Modal Phóng to ảnh bằng cấp */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl w-full h-full max-h-[80vh] flex items-center justify-center">
            <button className="absolute top-0 right-0 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 m-4 backdrop-blur-md transition">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <img src={previewImage} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}