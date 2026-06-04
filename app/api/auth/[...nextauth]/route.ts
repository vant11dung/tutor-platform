import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Vui lòng nhập email và mật khẩu');
        }

        // Tìm user trong database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error('Không tìm thấy tài khoản với email này');
        }

        // So sánh mật khẩu
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Mật khẩu không chính xác');
        }

        // Trả về dữ liệu user để đưa vào Session
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role // Quan trọng: Truyền Role vào để phân quyền
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Khi user đăng nhập thành công, nhét Role vào Token
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Đưa Role từ Token ra Session để Frontend có thể đọc được
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login', // Nơi NextAuth sẽ đá user về nếu chưa đăng nhập
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };