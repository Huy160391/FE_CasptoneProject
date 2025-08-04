/**
 * Token Expiration Service
 * Quản lý việc theo dõi và tự động logout khi token hết hạn
 */

let expirationTimer: NodeJS.Timeout | null = null;
let isTimerActive = false;

export const tokenExpirationService = {
    /**
     * Bắt đầu theo dõi thời gian hết hạn token
     * @param tokenExpirationTime - Thời gian hết hạn từ API (format: 2025-08-01T13:21:49.058+07:00)
     */
    startExpirationTimer: (tokenExpirationTime: string): void => {
        // Clear timer cũ nếu có
        tokenExpirationService.clearExpirationTimer();

        try {
            const expirationDate = new Date(tokenExpirationTime);
            const currentTime = new Date();
            const timeUntilExpiration = expirationDate.getTime() - currentTime.getTime();

            console.log('Token expiration setup:');
            console.log('- Current time:', currentTime.toISOString());
            console.log('- Expiration time:', expirationDate.toISOString());
            console.log('- Time until expiration (ms):', timeUntilExpiration);
            console.log('- Time until expiration (minutes):', Math.round(timeUntilExpiration / 1000 / 60));

            // Nếu token đã hết hạn
            if (timeUntilExpiration <= 0) {
                console.warn('Token already expired, logging out immediately');
                tokenExpirationService.handleTokenExpiration();
                return;
            }

            // Set timer để tự động logout khi hết hạn
            expirationTimer = setTimeout(() => {
                console.log('Token expired, auto logout triggered');
                tokenExpirationService.handleTokenExpiration();
            }, timeUntilExpiration);

            isTimerActive = true;
            console.log('Token expiration timer started successfully');

        } catch (error) {
            console.error('Error parsing token expiration time:', error);
            console.error('Invalid expiration time format:', tokenExpirationTime);
        }
    },

    /**
     * Xử lý khi token hết hạn
     */
    handleTokenExpiration: (): void => {
        console.log('Handling token expiration - clearing localStorage and redirecting');

        // Clear tất cả thông tin auth trong localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpirationTime');

        // Clear timer
        tokenExpirationService.clearExpirationTimer();

        // Hiển thị thông báo cho user (optional)
        if (typeof window !== 'undefined') {
            // Có thể show notification hoặc toast ở đây
            console.log('Session expired. Please login again.');
        }

        // Redirect về trang login
        if (typeof window !== 'undefined' && window.location) {
            // Kiểm tra nếu không phải đang ở trang login thì mới redirect
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        // Trigger custom event để các component khác có thể listen
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('tokenExpired'));
        }
    },

    /**
     * Clear timer hết hạn
     */
    clearExpirationTimer: (): void => {
        if (expirationTimer) {
            clearTimeout(expirationTimer);
            expirationTimer = null;
            isTimerActive = false;
            console.log('Token expiration timer cleared');
        }
    },

    /**
     * Kiểm tra timer có đang active không
     */
    isTimerRunning: (): boolean => {
        return isTimerActive;
    },

    /**
     * Kiểm tra token có hết hạn không (sync check)
     * @param tokenExpirationTime - Thời gian hết hạn từ localStorage
     * @returns true nếu token đã hết hạn
     */
    isTokenExpired: (tokenExpirationTime: string): boolean => {
        try {
            const expirationDate = new Date(tokenExpirationTime);
            const currentTime = new Date();
            return currentTime.getTime() >= expirationDate.getTime();
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true; // Coi như hết hạn nếu không parse được
        }
    },

    /**
     * Khởi tạo service khi app load (check existing token)
     */
    initialize: (): void => {
        try {
            const tokenExpirationTime = localStorage.getItem('tokenExpirationTime');
            const token = localStorage.getItem('token');

            if (token && tokenExpirationTime) {
                // Kiểm tra token đã hết hạn chưa
                if (tokenExpirationService.isTokenExpired(tokenExpirationTime)) {
                    console.log('Found expired token on initialization, clearing');
                    tokenExpirationService.handleTokenExpiration();
                } else {
                    console.log('Found valid token on initialization, starting timer');
                    tokenExpirationService.startExpirationTimer(tokenExpirationTime);
                }
            }
        } catch (error) {
            console.error('Error initializing token expiration service:', error);
        }
    }
};

export default tokenExpirationService;
