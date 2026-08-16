// Vite 生产环境配置文件，定义自然大厅打包、压缩和 Phaser 独立分包策略。
import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    logLevel: 'warning',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                passes: 2
            },
            mangle: true,
            format: {
                comments: false
            }
        }
    },
    server: {
        port: 8080
    }
});
