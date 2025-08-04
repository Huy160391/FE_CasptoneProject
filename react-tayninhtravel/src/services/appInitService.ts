/**
 * App Initialization Service
 * Khởi tạo các service cần thiết khi app load
 */

import tokenExpirationService from './tokenExpirationService';

export const appInitService = {
    /**
     * Khởi tạo app - gọi khi app load lần đầu
     */
    initialize: (): void => {
        console.log('Initializing app services...');

        // Khởi tạo token expiration service
        tokenExpirationService.initialize();

        console.log('App services initialized successfully');
    },

    /**
     * Cleanup khi app unmount (nếu cần)
     */
    cleanup: (): void => {
        console.log('Cleaning up app services...');
        tokenExpirationService.clearExpirationTimer();
    }
};

export default appInitService;
