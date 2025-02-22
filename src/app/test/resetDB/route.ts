import { type NextRequest, NextResponse } from 'next/server'
import path from 'node:path'
import fs from 'node:fs'

import { prisma } from '@/data/prisma'

export async function POST(req: NextRequest) {
    // This shouldn't even exist outside testing, but file-based routing...
    if (process.env.RCC_TESTING !== 'true') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.$disconnect()

    const dir = process.cwd()
    const destUrl = new URL(process.env.DATABASE_URL as string)
    if(destUrl.protocol !== 'file:') {
        throw new Error('Unknown DATABASE_URL protocol: ' + destUrl.protocol)
    }

    fs.copyFileSync(
        path.join(dir, 'test', 'dev.db'),
        path.join(dir, 'prisma', destUrl.pathname),
        0
    )

    await prisma.$connect()

    return NextResponse.json({ ok: true })
}
