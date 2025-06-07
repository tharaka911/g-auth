import { PrismaClient } from '@prisma/client'
import { ENV } from './auth/config'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: ENV.DATABASE_URL
    }
  }
})

if (!ENV.IS_PRODUCTION) globalForPrisma.prisma = prisma