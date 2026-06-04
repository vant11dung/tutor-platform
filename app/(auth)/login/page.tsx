'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      // Đăng nhập thành công, tạm thời điều hướng về trang chủ
      // (Sau này ta sẽ viết Middleware để tự động đẩy về Dashboard tương ứng)
      router.push('/');
      router.refresh(); // Cập nhật lại trạng thái header
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-blue-900 overflow-hidden items-center justify-center">
        <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" alt="Login bg" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
        <div className="relative z-10 text-white p-12 max-w-lg">
          <h2 className="text-4xl font-bold mb-6">Chào mừng trở lại!</h2>
          <p className="text-lg text-blue-100">Đăng nhập để tiếp tục hành trình học tập hoặc quản lý lịch giảng dạy của bạn một cách dễ dàng nhất.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Đăng nhập</h2>
            <p className="mt-2 text-sm text-gray-600">
              Chưa có tài khoản? <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">Đăng ký ngay</Link>
            </p>
          </div>
          
          {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm text-center">{error}</div>}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <input type="email" required placeholder="Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) => setEmail(e.target.value)} />
              <input type="password" required placeholder="Mật khẩu"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition disabled:opacity-50">
              {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}