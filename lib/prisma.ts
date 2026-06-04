import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// 1. Tạo một Pool kết nối từ thư viện 'pg' sử dụng biến DATABASE_URL từ Supabase
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

// 2. Bọc Pool kết nối này vào Adapter của Prisma 7
const adapter = new PrismaPg(pool)

// 3. Tránh việc tạo quá nhiều kết nối trùng lặp khi Hot Reload ở môi trường dev
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, // Ép PrismaClient dùng bộ chuyển đổi mã JavaScript Driver này
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma