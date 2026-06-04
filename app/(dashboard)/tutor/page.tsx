'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const SHIFTS = ['Sáng (08:00 - 12:00)', 'Chiều (13:00 - 17:00)', 'Tối (18:00 - 22:00)'];

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function TutorDashboardPro() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('profile');
  
  const [formData, setFormData] = useState({ bio: '', hourlyRate: '', subjects: '', teachingMode: 'ONLINE' });
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [certBase64s, setCertBase64s] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const toggleTimeSlot = (day: string, shift: string) => {
    const slotStr = `${day}-${shift}`;
    if (selectedSlots.includes(slotStr)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slotStr));
    } else {
      setSelectedSlots([...selectedSlots, slotStr]);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setAvatarBase64(base64);
    }
  };

  const handleCertChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newBase64s = await Promise.all(files.map(file => fileToBase64(file)));
    setCertBase64s([...certBase64s, ...newBase64s]);
  };

  const handleSubmitCV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlots.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 buổi trống để nhận lịch!');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Đang lưu hồ sơ...');

    try {
      const res = await fetch('/api/tutor/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hourlyRate: formData.hourlyRate.replace(/\D/g, ''), // Loại bỏ dấu phẩy trước khi gửi API
          availability: selectedSlots,
          avatar: avatarBase64,
          certificates: certBase64s
        })
      });

      if (res.ok) {
        toast.success('Lưu hồ sơ thành công! Đang chờ Admin duyệt.', { id: loadingToast });
      } else {
        toast.error('Có lỗi xảy ra, vui lòng thử lại.', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Lỗi kết nối mạng.', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings') {
      const fetchTeachingSchedule = async () => {
        setIsLoadingBookings(true);
        try {
          const res = await fetch('/api/tutor/bookings'); 
          if (res.ok) {
            const data = await res.json();
            setBookings(data);
          }
        } catch (error) {
          console.error('Lỗi tải lịch dạy:', error);
          toast.error('Không thể kết nối để lấy lịch dạy.');
        } finally {
          setIsLoadingBookings(false);
        }
      };
      fetchTeachingSchedule();
    }
  }, [activeTab]);

  // ✨ HÀM TRÍCH XUẤT THỨ TỪ CHUỖI TEXT ĐỂ ĐỒNG BỘ LOGIC KHÔNG BỊ LỆCH
  const getDayFromSlotText = (slotStr: string): string => {
    if (!slotStr) return '';
    if (slotStr.includes('Thứ 2')) return 'Thứ 2';
    if (slotStr.includes('Thứ 3')) return 'Thứ 3';
    if (slotStr.includes('Thứ 4')) return 'Thứ 4';
    if (slotStr.includes('Thứ 5')) return 'Thứ 5';
    if (slotStr.includes('Thứ 6')) return 'Thứ 6';
    if (slotStr.includes('Thứ 7')) return 'Thứ 7';
    if (slotStr.includes('CN') || slotStr.includes('Chủ Nhật')) return 'CN';
    return '';
  };

  // ✨ HÀM TRÍCH XUẤT GIỜ HỌC ĐỂ HIỂN THỊ ĐẸP MẮT
  const getTimeFromSlotText = (slotStr: string, fallbackDate: string): string => {
    if (!slotStr) return new Date(fallbackDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
    const match = slotStr.match(/\((.*?)\)/);
    return match ? match[1] : slotStr;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 mb-8 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-white/10 flex items-center justify-center backdrop-blur-sm">
                {avatarBase64 ? (
                  <img src={avatarBase64} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold">{session?.user?.name?.charAt(0) || 'T'}</span>
                )}
              </div>
              <label className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">Xin chào, Gia sư {session?.user?.name}!</h1>
              <p className="text-blue-200 mt-1">Cập nhật hồ sơ thật đẹp để thu hút học sinh nhé.</p>
            </div>
          </div>
          <div className="flex bg-white/20 p-1 rounded-xl backdrop-blur-md relative z-10">
            <button onClick={() => setActiveTab('profile')} className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition ${activeTab === 'profile' ? 'bg-white text-indigo-700 shadow-md' : 'text-white hover:bg-white/10'}`}>Cập nhật CV</button>
            <button onClick={() => setActiveTab('bookings')} className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition ${activeTab === 'bookings' ? 'bg-white text-indigo-700 shadow-md' : 'text-white hover:bg-white/10'}`}>Lịch dạy</button>
          </div>
        </div>

        {/* TAB 1 */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmitCV} className="space-y-8">
            <div className="bg-white rounded-3xl shadow-xl border border-indigo-50 p-8 transform transition hover:shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></span>
                Thông tin chuyên môn
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Giới thiệu bản thân & Kinh nghiệm</label>
                  <textarea required onChange={(e) => setFormData({...formData, bio: e.target.value})} rows={4} className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition" placeholder="Hãy viết gì đó thật ấn tượng về kỹ năng sư phạm của bạn..." />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Môn giảng dạy (Cách bởi dấu phẩy)</label>
                    <input required onChange={(e) => setFormData({...formData, subjects: e.target.value})} type="text" className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition" placeholder="VD: Toán, Tiếng Anh giao tiếp" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Học phí yêu cầu / Giờ (VNĐ)</label>
                    <input 
                      required 
                      type="text" 
                      inputMode="numeric"
                      value={formData.hourlyRate}
                      onChange={(e) => {
                        // Chỉ lấy các ký tự số
                        const rawValue = e.target.value.replace(/\D/g, '');
                        // Định dạng thêm dấu phẩy ngăn cách hàng nghìn
                        const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                        setFormData({...formData, hourlyRate: formattedValue});
                      }} 
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition" 
                      placeholder="VD: 200,000" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hình thức giảng dạy</label>
                    <select 
                      required 
                      value={formData.teachingMode}
                      onChange={(e) => setFormData({...formData, teachingMode: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-800 font-medium outline-none transition cursor-pointer"
                    >
                      <option value="ONLINE">🌐 Học Online</option>
                      <option value="OFFLINE">🏠 Học Offline (Trực tiếp)</option>
                      <option value="BOTH">🔄 Cả hai hình thức (On / Off)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Lịch rảnh */}
            <div className="bg-white rounded-3xl shadow-xl border border-indigo-50 p-8 transform transition hover:shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <span className="bg-green-100 text-green-600 p-2 rounded-lg"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></span>
                Thiết lập Lịch rảnh
              </h2>
              <p className="text-gray-500 mb-6">Click vào các ô trống bên dưới để chọn thời gian bạn có thể nhận lớp.</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-3"></th>
                      {DAYS.map(day => <th key={day} className="p-3 font-bold text-gray-700 bg-gray-50 rounded-t-lg">{day}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {SHIFTS.map((shift, sIdx) => (
                      <tr key={sIdx}>
                        <td className="p-3 text-sm font-semibold text-gray-600 bg-gray-50 text-left w-40">{shift}</td>
                        {DAYS.map((day, dIdx) => {
                          const slotStr = `${day}-${shift}`;
                          const isSelected = selectedSlots.includes(slotStr);
                          return (
                            <td key={dIdx} className="p-1 border border-gray-100">
                              <div onClick={() => toggleTimeSlot(day, shift)} className={`w-full h-12 rounded-lg cursor-pointer flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-indigo-500 shadow-inner scale-95' : 'bg-gray-50 hover:bg-indigo-100'}`}>
                                {isSelected && <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bằng cấp */}
            <div className="bg-white rounded-3xl shadow-xl border border-indigo-50 p-8 transform transition hover:shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <span className="bg-orange-100 text-orange-600 p-2 rounded-lg"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></span>
                Bằng cấp & Chứng chỉ
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                {certBase64s.map((src, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden h-32 border-2 border-gray-200 group">
                    <img src={src} className="w-full h-full object-cover" alt="Certificate" />
                    <button type="button" onClick={() => setCertBase64s(certBase64s.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                <label className="border-2 border-dashed border-indigo-300 rounded-xl h-32 flex flex-col items-center justify-center text-indigo-500 hover:bg-indigo-50 hover:border-indigo-500 transition cursor-pointer">
                  <span className="text-sm font-medium">Tải ảnh lên</span>
                  <input type="file" hidden multiple accept="image/*" onChange={handleCertChange} />
                </label>
              </div>
            </div>

            <div className="pt-6">
              <button disabled={isSubmitting} type="submit" className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-1 text-lg disabled:opacity-50">
                {isSubmitting ? 'Đang xử lý...' : '🚀 Gửi Hồ Sơ Xét Duyệt'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: LICH DẠY ĐÃ ĐƯỢC FIX LOGIC DỒNG BỘ CHUỖI TEXT THÀNH CÔNG */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl shadow-xl border border-indigo-50 p-8 sm:p-12 text-left">
            <div className="mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                Lịch trình giảng dạy của tôi
              </h2>
              <p className="text-gray-500 mt-1">Thời khóa biểu chi tiết theo tuần dựa trên ca đăng ký thực tế.</p>
            </div>

            {isLoadingBookings ? (
              <div className="text-center py-12 text-gray-400 font-medium animate-pulse">
                ⏳ Đang đồng bộ thời khóa biểu...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {DAYS.map((day, dIdx) => {
                  
                  // ✨ FIX CHÍNH: Lọc lịch dạy bằng cách map chuỗi text ca học (ví dụ: b.slot) thay vì getDay() thời gian thực
                  const dayBookings = bookings.filter((b: any) => {
                    // Hãy thay thế 'b.slot' hoặc 'b.timeSlot' bằng tên trường lưu chuỗi text "CN-Tối..." của DB bạn nhé
                    const targetSlotString = b.slot || b.timeSlot || b.schedule || '';
                    const bookingDay = getDayFromSlotText(targetSlotString);
                    
                    // So khớp ngày (Chuẩn hóa 'CN' của DB và danh sách DAYS)
                    const currentTargetDay = day === 'CN' ? 'CN' : day;
                    return bookingDay === currentTargetDay;
                  });

                  return (
                    <div key={dIdx} className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 flex flex-col min-h-[280px]">
                      <div className="text-center font-bold text-gray-700 pb-3 mb-3 border-b border-gray-200/60 text-sm">
                        {day}
                      </div>

                      <div className="flex-1 space-y-3 flex flex-col justify-start">
                        {dayBookings.length > 0 ? (
                          dayBookings.map((booking: any) => {
                            const targetSlotString = booking.slot || booking.timeSlot || booking.schedule || '';
                            return (
                              <div key={booking.id} className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-3 text-left shadow-sm transition transform hover:scale-[1.03] duration-150">
                                <p className="font-bold text-gray-800 text-xs truncate" title={booking.student?.user?.name}>
                                  👨‍🎓 {booking.student?.user?.name || 'Học sinh'}
                                </p>
                                <p className="text-[11px] text-gray-500 mt-1 font-medium flex items-center gap-1">
                                  ⏰ {getTimeFromSlotText(targetSlotString, booking.startTime)}
                                </p>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-[9px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md border border-green-200">
                                    Đã duyệt
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex-1 flex items-center justify-center text-gray-300 text-xs italic py-12">
                            Trống lịch
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}