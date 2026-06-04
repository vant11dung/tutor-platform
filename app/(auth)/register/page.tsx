'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'STUDENT' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      router.push('/login');
    } else {
      const data = await res.json();
      setError(data.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        {/* Tiêu đề đen đậm rõ ràng */}
        <h2 className="text-3xl font-black text-center text-gray-900">Tạo tài khoản mới</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm text-center font-bold">{error}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* ✨ ĐÃ CẢI TIẾN: Thêm text-gray-900 (chữ gõ cực rõ), placeholder-gray-600 (chữ gợi ý đậm nét) và border-gray-400 */}
            <input
              type="text" required placeholder="Họ và tên"
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder-gray-600 font-semibold bg-white"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <input
              type="email" required placeholder="Email"
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder-gray-600 font-semibold bg-white"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <input
              type="password" required placeholder="Mật khẩu"
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder-gray-600 font-semibold bg-white"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            
            <div>
              {/* ✨ ĐÃ CẢI TIẾN: Tăng nhãn từ text-gray-700 lên text-gray-900 font-bold */}
              <label className="block text-sm font-bold text-gray-900 mb-2">Bạn muốn đăng ký làm:</label>
              {/* ✨ ĐÃ CẢI TIẾN: Thêm text-gray-900 font-semibold cho thanh chọn Dropdown */}
              <select 
                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 font-semibold"
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="STUDENT" className="text-gray-900">Học sinh (Tìm gia sư)</option>
                <option value="TUTOR" className="text-gray-900">Gia sư (Đi dạy)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition">
            Đăng Ký
          </button>
        </form>
        
        {/* ✨ ĐÃ CẢI TIẾN: Chuyển dòng chữ điều hướng từ màu xám mờ text-gray-600 sang màu đen rõ text-gray-900, nút Đăng nhập đổi thành font-black */}
        <p className="text-center text-sm text-gray-900 font-medium">
          Đã có tài khoản? <Link href="/login" className="text-blue-600 hover:underline font-black">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}