import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    const isProd = mode === 'production'

    return {
        plugins: [
            react()
            // Tạm thời vô hiệu hóa plugin remove console để tránh lỗi build
            // Có thể bật lại sau khi cải thiện regex
        ],
        resolve: {
            alias: {
                '@': resolve(__dirname, './src')
            }
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ['react', 'react-dom'],
                        antd: ['antd'],
                        icons: ['@ant-design/icons'],
                        router: ['react-router-dom'],
                        i18n: ['i18next', 'react-i18next'],
                        axios: ['axios']
                    }
                }
            },
            chunkSizeWarningLimit: 1000
        }
    }
})
