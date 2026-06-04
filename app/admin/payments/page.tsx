'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminPaymentsDashboard() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  // Lấy dữ liệu dòng tiền từ API backend
  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      } else {
        toast.error('Lỗi khi tải danh sách dòng tiền');
      }
    } catch (error) {
      toast.error('Lỗi kết nối hệ thống');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý kích hoạt giải ngân tiền cho gia sư
  const handleTransferToTutor = async (bookingId: string) => {
    if (!confirm("Bạn có chắc chắn muốn giải ngân số tiền này cho gia sư không?")) return;

    const loadToast = toast.loading('Đang xử lý chuyển tiền...');
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });

      if (res.ok) {
        toast.success("Đã giải ngân thành công cho gia sư!", { id: loadToast });
        fetchPayments(); // Cập nhật lại danh sách sau khi giải ngân thành công
      } else {
        toast.error('Lỗi hệ thống khi chuyển tiền.', { id: loadToast });
      }
    } catch (error) {
      toast.error('Lỗi kết nối', { id: loadToast });
    } finally {
      toast.dismiss(loadToast);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-slate-500 font-medium">Đang tải luồng tiền hệ thống...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Tiêu đề chính */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800">💰 Quản Lý Dòng Tiền</h1>
            <p className="text-slate-500 mt-2">Theo dõi quỹ hệ thống và thực hiện giải ngân thủ công cho các lớp học hoàn thành.</p>
          </div>
          
          <div className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/30">
            {payments.filter(p => p.status === 'PENDING').length} giao dịch tạm giữ
          </div>
        </div>

        {/* Bảng quản lý và điều phối giải ngân */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-700 font-bold text-sm">
                  <th className="p-5">Người chuyển (Học sinh)</th>
                  <th className="p-5">Số tiền nhận</th>
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
                    
                    {/* Cột trạng thái quỹ */}
                    <td className="p-5">
                      {p.status === 'PENDING' ? (
                        <span className="bg-amber-50 border border-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold inline-block">
                          🔒 Hệ thống đang giữ tiền
                        </span>
                      ) : (
                        <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold inline-block">
                          ✅ Đã giải ngân cho Gia sư
                        </span>
                      )}
                    </td>

                    {/* Cột nút bấm hành động */}
                    <td className="p-5 text-center">
                      {p.status === 'PENDING' ? (
                        <button
                          onClick={() => handleTransferToTutor(p.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-xl font-bold shadow-md shadow-blue-600/20 transition transform active:scale-95"
                        >
                          💸 Giải ngân cho Gia sư
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

          {/* Trạng thái danh sách trống */}
          {payments.length === 0 && (
            <div className="p-16 text-center">
              <div className="text-5xl mb-3">💸</div>
              <h3 className="text-lg font-bold text-slate-800">Chưa có giao dịch nào</h3>
              <p className="text-slate-500 mt-1">Nền tảng chưa ghi nhận dòng tiền nào được đẩy lên hệ thống.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}