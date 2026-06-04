'use client';
import { useState, useRef, useEffect } from 'react';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; content: string }>>([
    { role: 'model', content: 'Xin chào! Mình là TutorConnect AI. Mình có thể giúp bạn tìm kiếm gia sư theo môn học, hình thức dạy Online/Offline hoặc tìm gia sư có đánh giá cao tốt nhất nè! ✨' }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!input.trim() || loading) return;

  const userMsg = input.trim();
  setInput('');
  setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
  setLoading(true);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMsg }] }),
    });
    
    const data = await res.json();
    
    // ✨ CẢI TIẾN: Nếu Server trả về lỗi (Status 500, 400...), hiện luôn ra màn hình
    if (!res.ok) {
      setMessages((prev) => [...prev, { role: 'model', content: `❌ Lỗi Server: ${data.message || 'Không có phản hồi'}` }]);
      return;
    }

    if (data.content) {
      setMessages((prev) => [...prev, { role: 'model', content: data.content }]);
    }
  } catch (error) {
    console.error(error);
    setMessages((prev) => [...prev, { role: 'model', content: '❌ Lỗi kết nối mạng hoặc sập server rồi bồ ơi!' }]);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Nút bấm tròn mở Chatbot */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center animate-bounce"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" />
          </svg>
        </button>
      )}

      {/* Cửa sổ Chat nhỏ nhắn xinh xắn */}
      {isOpen && (
        <div className="bg-white w-[360px] h-[500px] rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300">
          {/* Thanh Tiêu Đề */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping"></div>
              <span className="font-bold text-sm tracking-wide">TutorConnect AI Trợ Lý</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Vùng chứa tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-400 border border-gray-100 rounded-2xl rounded-tl-none px-4 py-2 text-xs flex gap-1 items-center shadow-sm">
                  <span className="animate-pulse">TutorConnect đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Ô Nhập Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập môn học, tìm dạy onl..."
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-700"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition disabled:opacity-50"
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </div>
  );
}