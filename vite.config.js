import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const page = fileURLToPath(new URL('./src/site.html', import.meta.url))
const localLogo = fileURLToPath(new URL('./public/scale-logo.png', import.meta.url))
const desktopLogo = '/Users/manu/Desktop/1x/AssScale Logo 1.png'
const logoPath = () => (existsSync(localLogo) ? localLogo : existsSync(desktopLogo) ? desktopLogo : null)

export default defineConfig({
    plugins: [
        {
            name: 'scale-page',
            transformIndexHtml: { order: 'pre', handler: () => readFileSync(page, 'utf8') },
            configureServer(server) {
                server.watcher.add(page)
                server.watcher.on('change', (f) => { if (f === page) server.ws.send({ type: 'full-reload' }) })
                server.middlewares.use('/scale-logo.png', (req, res, next) => {
                    const file = logoPath()
                    if (!file) return next()
                    res.setHeader('Content-Type', 'image/png')
                    res.setHeader('Cache-Control', 'no-cache')
                    res.end(readFileSync(file))
                })
            },
            generateBundle() {
                const file = logoPath()
                if (file && file !== localLogo) this.emitFile({ type: 'asset', fileName: 'scale-logo.png', source: readFileSync(file) })
            },
        },
    ],
})
