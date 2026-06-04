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
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex bg-gray-100">
      {/* Banner bên trái - Tăng độ tương phản chữ */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black overflow-hidden items-center justify-center">
        <img 
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" 
          alt="Login bg" 
          className="absolute inset-0 w-full h-full object-cover opacity-40" 
        />
        <div className="relative z-10 text-white p-12 max-w-lg bg-black/40 backdrop-blur-sm rounded-2xl">
          <h2 className="text-4xl font-black mb-4 text-white">Chào mừng trở lại!</h2>
          <p className="text-lg text-gray-100 font-medium leading-relaxed">
            Đăng nhập để tiếp tục hành trình học tập hoặc quản lý lịch giảng dạy của bạn một cách dễ dàng nhất.
          </p>
        </div>
      </div>

      {/* Form đăng nhập bên phải - Siêu rõ ràng */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full space-y-8 p-8 border border-gray-200 rounded-2xl shadow-xl bg-white">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Đăng nhập</h2>
            <p className="mt-2 text-sm text-gray-600 font-medium">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="font-bold text-blue-600 hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-700 p-4 rounded-xl text-sm font-bold text-center">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Ô NHẬP EMAIL */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Địa chỉ Email:
                </label>
                <input 
                  type="email" 
                  required 
                  placeholder="Nhập email của bạn (ví dụ: name@example.com)"
                  className="w-full px-4 py-3.5 bg-gray-100 border-2 border-gray-400 rounded-xl text-black font-medium placeholder-gray-500 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>

              {/* Ô NHẬP MẬT KHẨU */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Mật khẩu của bạn:
                </label>
                <input 
                  type="password" 
                  required 
                  placeholder="Nhập mật khẩu"
                  className="w-full px-4 py-3.5 bg-gray-100 border-2 border-gray-400 rounded-xl text-black font-medium placeholder-gray-500 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? 'Đang xử lý...' : 'ĐĂNG NHẬP NGAY'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}