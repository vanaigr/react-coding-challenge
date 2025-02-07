import path from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const projRoot = import.meta.dirname

const srcDir = path.join(projRoot, 'src')
const buildBir = path.join(projRoot, 'build')
const publicDir = path.join(srcDir, 'public')

export default defineConfig((_) => {
    return {
        root: srcDir,
        publicDir: publicDir,
        resolve: {
            alias: {
                '@': srcDir,
            },
        },
        server: { port: 3000 },
        preview: { port: 3000 },
        build: {
            outDir: buildBir,
            emptyOutDir: true,
        },
        plugins: [
            tailwindcss(),
            react(),
        ],
    }
})
