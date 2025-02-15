// https://www.prisma.io/docs/orm/more/help-and-troubleshooting/nextjs-help
// Worst part of this is that it's not even guaranteed to work

import { PrismaClient, type Prisma } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()
export { Prisma }

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
