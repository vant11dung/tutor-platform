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
    <div className="min-h-[calc(100vh-80px)] flex bg-gray-50">
      {/* Banner bên trái */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
        <img 
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" 
          alt="Login bg" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" 
        />
        <div className="relative z-10 text-white p-12 max-w-lg">
          <h2 className="text-4xl font-bold mb-6 drop-shadow-sm">Chào mừng trở lại!</h2>
          <p className="text-lg text-slate-200 leading-relaxed">
            Đăng nhập để tiếp tục hành trình học tập hoặc quản lý lịch giảng dạy của bạn một cách dễ dàng nhất.
          </p>
        </div>
      </div>

      {/* Form đăng nhập bên phải */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Đăng nhập</h2>
            <p className="mt-2 text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>
          
          {/* Thông báo lỗi rõ ràng hơn */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input 
                  type="email" 
                  required 
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}