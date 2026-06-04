'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingWidgetProps {
  tutorId: string;
  hourlyRate: number;
  availableSlotsString: string; // ✨ THÊM TRƯỜNG NÀY: Nhận chuỗi JSON lịch rảnh của gia sư từ database
}

export default function BookingWidget({ tutorId, hourlyRate, availableSlotsString }: BookingWidgetProps) {
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<boolean>(false); // 🌟 Quản lý ẩn/hiện Modal QR
  const router = useRouter();

  // ✨ ĐỔI Ở ĐÂY: Giải nén chuỗi JSON của gia sư thành mảng, nếu lỗi hoặc trống thì trả về mảng rỗng []
  let tutorSlots: string[] = [];
  try {
    tutorSlots = JSON.parse(availableSlotsString || '[]');
  } catch (e) {
    tutorSlots = [];
  }

  // Giả định mỗi ca học kéo dài 3 tiếng để tính tổng tiền mẫu
  const hoursPerSlot = 3;
  const totalPrice = hourlyRate * hoursPerSlot;

  // 1. Khi bấm nút "Xác Nhận Thuê Gia Sư" trên web, không gọi API ngay mà hiện Modal QR lên
  const handleBooking = () => {
    if (!selectedSlot) {
      alert("Vui lòng chọn một ca học bạn muốn đăng ký!");
      return;
    }
    setShowQRModal(true);
  };

  // 2. Khi bấm "Xác nhận đã chuyển khoản" trong Modal, lúc này mới gọi API lưu vào DB
  const handleConfirmPayment = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/student/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorId,
          slot: selectedSlot,
          totalPrice
        })
      });

      const data = await res.json();

      if (!res.ok) {
        // NẾU TRÙNG LỊCH HOẶC CÓ LỖI -> Hiển thị thông báo đỏ/cảnh báo từ backend trả về
        alert(`⚠️ Kháng nghị đặt lịch:\n${data.message}`);
        setLoading(false);
        return;
      }

      // NẾU THÀNH CÔNG
      alert("🎉 Đặt lịch thành công! Yêu cầu của bạn đã được gửi lên hệ thống và ở trạng thái chờ Admin duyệt.");
      setShowQRModal(false); // Đóng modal sau khi đặt chỗ thành công
      router.push('/student'); // Chuyển hướng học sinh về trang lịch học của mình
      router.refresh();

    } catch (error) {
      alert("Có lỗi kết nối mạng xảy ra!");
    } finally { // <--- Thêm một chữ 'l' ở đây nha bồ
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Lịch giảng dạy & Đặt chỗ</h3>
      
      <div className="mb-4">
        <span className="text-2xl font-extrabold text-blue-600">{hourlyRate.toLocaleString('vi-VN')}đ</span>
        <span className="text-gray-500 text-sm"> / giờ</span>
      </div>

      {/* Danh sách chọn ca */}
      <div className="space-y-2 mb-6">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Chọn ca học trống:</label>
        
        {/* ✨ THAY ĐỔI: Nếu gia sư chưa cài đặt ca rảnh nào thì hiện thông báo cảnh báo */}
        {tutorSlots.length === 0 ? (
          <div className="text-sm text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-100 italic">
            ⚠️ Gia sư này hiện chưa cập nhật lịch rảnh trên hồ sơ cá nhân!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
            {tutorSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  selectedSlot === slot
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                🟢 {slot}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hiển thị tính tiền */}
      {selectedSlot && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2 mb-6 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Thời lượng ca học:</span>
            <span className="font-medium text-gray-800">{hoursPerSlot} giờ</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
            <span>Tổng tạm tính:</span>
            <span className="text-blue-600">{totalPrice.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      )}

      {/* Nút bấm hành động */}
      {/* ✨ THAY ĐỔI: Khóa nút bấm (disabled) nếu gia sư không có lịch rảnh nào */}
      <button
        onClick={handleBooking}
        disabled={loading || tutorSlots.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-center"
      >
        {loading ? 'Đang xử lý đặt lịch...' : tutorSlots.length === 0 ? 'Gia sư không có lịch trống' : 'Xác Nhận Thuê Gia Sư'}
      </button>
      
      <p className="text-center text-xs text-gray-400 mt-3">
        Lịch học sau khi thuê sẽ ở trạng thái chờ duyệt cho đến khi được Admin phê duyệt chốt lớp.
      </p>

      {/* 🌟 MODAL HIỆN QR THANH TOÁN (CHỈ HIỆN KHI BẤM NÚT VÀ ĐÃ CHỌN CA) */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-gray-900 mb-2">Quét Mã Thanh Toán</h3>
            <p className="text-sm text-gray-600 mb-4">
              Vui lòng chuyển khoản đúng số tiền <span className="font-bold text-blue-600">{totalPrice.toLocaleString('vi-VN')}đ</span> để hoàn tất đặt lịch.
            </p>
            
            {/* Ảnh QR của bạn */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4 inline-block">
              <img src="/qr-payment.png" alt="QR Thanh toán" className="w-48 h-48 object-contain mx-auto" />
            </div>

            <div className="space-y-2">
              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold transition shadow-lg shadow-green-600/20 disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Xác nhận đã chuyển khoản"}
              </button>
              
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium py-1"
              >
                Hủy giao dịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}