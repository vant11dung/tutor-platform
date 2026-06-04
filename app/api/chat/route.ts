import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai"; 
import { prisma } from "@/lib/prisma"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  let tutorContext = "Hiện tại không có dữ liệu gia sư cụ thể.";
  
  try {
    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1].content;

    try {
      const tutors = await prisma.tutorProfile.findMany({
        where: { status: "APPROVED" },
        include: {
          user: { select: { name: true } },
          reviews: { select: { rating: true } }, 
        },
      });

      if (tutors && tutors.length > 0) {
        tutorContext = tutors.map((t) => {
          const avgRating = t.reviews?.length 
            ? (t.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / t.reviews.length).toFixed(1)
            : "5.0";

          return `- Gia sư: ${t.user?.name || "Ẩn danh"}
            • ID: ${t.userId}
            • Môn học: ${t.subjects ? (Array.isArray(t.subjects) ? t.subjects.join(", ") : t.subjects) : "Chưa cập nhật"}
            • Hình thức: ${t.teachingMethod || "ONLINE"}
            • Học phí: ${t.hourlyRate ? t.hourlyRate.toLocaleString('vi-VN') : "0"} VNĐ/giờ
            • Đánh giá: ${avgRating}/5 sao`;
        }).join("\n\n");
      }
    } catch (dbError: any) {
      console.error("⚠️ Lỗi truy vấn Prisma (DB):", dbError.message);
      tutorContext = "(Lưu ý trợ lý: Hệ thống kết nối database gia sư đang tạm bảo trì, hãy thông báo khéo léo cho người dùng)";
    }

    const systemPrompt = `Bạn là trợ lý ảo thông minh tên "TutorConnect AI". Nhiệm vụ của bạn là giúp học sinh tìm kiếm gia sư phù hợp từ danh sách dưới đây.
    
DANH SÁCH GIA SƯ HIỆN CÓ:
${tutorContext}

YÊU CẦU TRẢ LỜI:
1. Tư vấn dựa trên danh sách có sẵn. Nếu trống, hãy trả lời thân thiện và hỗ trợ các thắc mắc chung.
2. Trả lời ngắn gọn bằng tiếng Việt, sử dụng Markdown icon sinh động.`;

    // ✨ ĐÃ SỬA: Đổi tên model để tránh lỗi 404 v1beta của Google
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
    const response = await model.generateContent(`${systemPrompt}\n\nCâu hỏi của học sinh: ${userMessage}`);
    
    const botReply = response.response.text();
    return NextResponse.json({ role: "model", content: botReply });

  } catch (error: any) {
    console.error("❌ Lỗi Chatbot Tổng:", error);
    return NextResponse.json(
      { message: `Chi tiết lỗi: ${error.message || "Không xác định được nguyên nhân"}` }, 
      { status: 500 }
    );
  }
}