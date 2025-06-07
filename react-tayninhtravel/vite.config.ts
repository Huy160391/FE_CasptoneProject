import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    const isProd = mode === 'production'

    return {
        plugins: [
            react(),
            // Custom plugin to remove console logs in production
            {
                name: 'remove-console-in-prod',
                transform(code, id) {
                    if (isProd && (id.endsWith('.js') || id.endsWith('.jsx') || id.endsWith('.ts') || id.endsWith('.tsx'))) {
                        // Sử dụng phương pháp an toàn hơn cho việc thay thế console
                        // Tránh các regex phức tạp có thể gây lỗi cú pháp
                        try {
                            // Chỉ áp dụng cho mã nguồn của bạn, không phải thư viện bên thứ ba
                            if (id.indexOf('node_modules') === -1) {
                                return code.replace(/console\.(log|warn|error)\s*\([^;]*\)\s*;/g, '// console removed;');
                            }
                        } catch (e) {
                            console.warn('Error in console removal plugin:', e);
                        }
                    }
                    return code;
                }
            }
        ],
        resolve: {
            alias: {
                '@': resolve(__dirname, './src')
            }
        }
    }
})
