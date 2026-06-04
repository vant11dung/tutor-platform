'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ReviewFormProps {
  tutorId: string; // Nhận tutorId truyền từ trang page.tsx cha xuống
}

export default function ReviewForm({ tutorId }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(5); // Mặc định hiển thị 5 sao trực quan
  const [comment, setComment] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nội dung nhận xét!', { position: 'top-right' });
      return;
    }

    setIsSubmitting(true);
    const loadToast = toast.loading("Đang gửi đánh giá lên hệ thống...", { position: 'top-right' });

    try {
      const res = await fetch('/api/tutors/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tutorId, 
          rating, 
          comment: comment.trim(), 
          isAnonymous 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('🎉 Cảm ơn bạn đã gửi phản hồi!', { id: loadToast });
        setComment('');
        setRating(5);
        setIsAnonymous(false);
        router.refresh(); // Tải lại trang để cập nhật danh sách hiển thị review mới ngay lập tức
      } else {
        toast.error(data.message || 'Có lỗi xảy ra!', { id: loadToast });
      }
    } catch (error) {
      toast.error('Lỗi kết nối máy chủ!', { id: loadToast });
    } {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 mt-6 space-y-4 shadow-sm">
      <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
        <span>✍️</span> Để lại đánh giá của bạn
      </h3>
      
      {/* Chọn sao trực quan với hiệu ứng hover phóng to của bồ */}
      <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-100 w-fit shadow-sm">
        <span className="text-sm font-medium text-slate-500">Mức độ hài lòng:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className="text-2xl transition transform hover:scale-125 focus:outline-none"
            >
              {star <= rating ? '⭐' : '☆'}
            </button>
          ))}
        </div>
        <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">{rating} Sao</span>
      </div>

      {/* Input nhập nội dung */}
      <div>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Hãy chia sẻ cảm nhận chân thực của bạn về phong cách dạy học của gia sư này..."
          className="w-full rounded-xl border border-slate-200 p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder-slate-400 shadow-inner"
        />
      </div>

      {/* Chức năng ẩn danh & Nút gửi */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-600 font-medium select-none">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 transition cursor-pointer"
          />
          <span className="flex items-center gap-1">🕵️‍♂️ Gửi ẩn danh <span className="text-xs text-slate-400 font-normal">(Giấu tên thật của bạn)</span></span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </div>
    </form>
  );
}