import './globals.css'
import Navbar from '@/components/Navbar'
import { Providers } from './Providers'
import { Toaster } from 'react-hot-toast' // Thêm dòng này
import { Be_Vietnam_Pro } from 'next/font/google';
import ChatBot from '@/components/ChatBot' // ✨ ĐÃ THÊM: Import ChatBot ở đây

const beVietnam = Be_Vietnam_Pro({ 
  subsets: ['vietnamese'], 
  weight: ['400', '500', '600', '700', '800'] 
});

export const metadata = {
  title: 'TutorConnect - Nền tảng Gia sư Hàng đầu',
  description: 'Kết nối học sinh và gia sư chuyên nghiệp',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={`${beVietnam.className} bg-gray-50 text-gray-900 antialiased`}>
        <Providers>
          <Navbar />
          {/* Cấu hình Toaster ở đây */}
          <Toaster position="top-right" reverseOrder={false} />
          
          <main className="pt-20 min-h-screen">
            {children}
          </main>

          {/* ✨ ĐÃ THÊM: Chatbot nổi giúp tìm kiếm gia sư */}
          <ChatBot />
        </Providers>
      </body>
    </html>
  )
}