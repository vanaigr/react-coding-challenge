// @ts-check
import path from 'node:path'
import proc from 'node:child_process'

proc.spawnSync(
    path.join(import.meta.dirname, '..', 'node_modules', '.bin', 'next'),
    ['dev', '--turbopack'],
    {
        env: {
            ...process.env,
            RCC_TESTING: 'true',
            DATABASE_URL: 'file:./test.db',
        },
        stdio: 'inherit',
    }
)
