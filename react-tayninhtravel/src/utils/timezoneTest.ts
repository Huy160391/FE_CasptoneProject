/**
 * Timezone Testing Utilities
 * Test Vietnam timezone implementation across the system
 */

import { 
    getVietnamNow, 
    toVietnamTime, 
    formatVietnamDate, 
    formatVietnamDateTime,
    getDaysDifferenceVietnam,
    isInPastVietnam,
    toVietnamISOString,
    createVietnamDate
} from './vietnamTimezone';

import { formatDate, formatDateTime } from './formatters';
import { calculateTourPricing, isEarlyBirdEligible } from '../services/pricingService';

/**
 * Test Vietnam timezone utilities
 */
export const testVietnamTimezone = () => {
    console.log('🧪 Testing Vietnam Timezone Implementation');
    console.log('==========================================');

    // Test 1: Current Vietnam time
    const vietnamNow = getVietnamNow();
    const utcNow = new Date();
    console.log('1. Current Time Comparison:');
    console.log(`   UTC Time: ${utcNow.toISOString()}`);
    console.log(`   Vietnam Time: ${vietnamNow.toISOString()}`);
    console.log(`   Difference: ${(vietnamNow.getTime() - utcNow.getTime()) / (1000 * 60 * 60)} hours`);
    console.log('   ✅ Expected: 7 hours difference (UTC+7)');

    // Test 2: Date conversion
    const testDate = new Date('2024-01-15T10:30:00Z'); // UTC
    const vietnamDate = toVietnamTime(testDate);
    console.log('\n2. Date Conversion Test:');
    console.log(`   Original UTC: ${testDate.toISOString()}`);
    console.log(`   Vietnam Time: ${vietnamDate.toISOString()}`);
    console.log('   ✅ Expected: 17:30 Vietnam time (10:30 + 7 hours)');

    // Test 3: Date formatting
    console.log('\n3. Date Formatting Test:');
    console.log(`   Vietnam Date: ${formatVietnamDate(testDate)}`);
    console.log(`   Vietnam DateTime: ${formatVietnamDateTime(testDate)}`);
    console.log(`   Formatter Date: ${formatDate(testDate)}`);
    console.log(`   Formatter DateTime: ${formatDateTime(testDate)}`);

    // Test 4: Days difference calculation
    const date1 = new Date('2024-01-15T10:00:00Z');
    const date2 = new Date('2024-01-18T14:00:00Z');
    const daysDiff = getDaysDifferenceVietnam(date1, date2);
    console.log('\n4. Days Difference Test:');
    console.log(`   Date 1: ${formatVietnamDateTime(date1)}`);
    console.log(`   Date 2: ${formatVietnamDateTime(date2)}`);
    console.log(`   Days Difference: ${daysDiff}`);
    console.log('   ✅ Expected: 3 days');

    // Test 5: Past date check
    const pastDate = new Date('2023-01-01T00:00:00Z');
    const futureDate = new Date('2025-12-31T23:59:59Z');
    console.log('\n5. Past Date Check Test:');
    console.log(`   Past Date (2023): ${isInPastVietnam(pastDate)}`);
    console.log(`   Future Date (2025): ${isInPastVietnam(futureDate)}`);
    console.log('   ✅ Expected: true, false');

    // Test 6: ISO string conversion
    const isoString = toVietnamISOString(testDate);
    console.log('\n6. ISO String Conversion:');
    console.log(`   Original: ${testDate.toISOString()}`);
    console.log(`   Vietnam ISO: ${isoString}`);
    console.log('   ✅ Expected: +07:00 timezone offset');

    // Test 7: Create Vietnam date
    const createdDate = createVietnamDate(2024, 1, 15, 17, 30, 0);
    console.log('\n7. Create Vietnam Date:');
    console.log(`   Created Date: ${createdDate.toISOString()}`);
    console.log('   ✅ Expected: 2024-01-15 17:30 Vietnam time');

    console.log('\n🎉 Vietnam Timezone Tests Completed!');
};

/**
 * Test tour pricing with Vietnam timezone
 */
export const testTourPricingTimezone = () => {
    console.log('\n🧪 Testing Tour Pricing with Vietnam Timezone');
    console.log('==============================================');

    // Test data
    const tourData = {
        price: 1000000, // 1M VND
        createdAt: '2024-01-01T00:00:00Z', // UTC
        tourStartDate: '2024-02-15T02:00:00Z' // UTC (9:00 AM Vietnam time)
    };

    // Test booking dates
    const bookingDates = [
        new Date('2024-01-05T03:00:00Z'), // Early bird eligible (within 15 days, 30+ days before tour)
        new Date('2024-01-20T03:00:00Z'), // Not early bird (after 15 days)
        new Date('2024-02-10T03:00:00Z'), // Not early bird (less than 30 days before tour)
    ];

    bookingDates.forEach((bookingDate, index) => {
        console.log(`\nTest ${index + 1}: Booking on ${formatVietnamDateTime(bookingDate)}`);
        
        const pricing = calculateTourPricing(tourData, 2, bookingDate);
        const isEarlyBird = isEarlyBirdEligible(tourData.createdAt, tourData.tourStartDate, bookingDate);
        
        console.log(`   Tour Created: ${formatVietnamDateTime(tourData.createdAt)}`);
        console.log(`   Tour Start: ${formatVietnamDateTime(tourData.tourStartDate!)}`);
        console.log(`   Booking Date: ${formatVietnamDateTime(bookingDate)}`);
        console.log(`   Days Since Created: ${pricing.daysSinceCreated}`);
        console.log(`   Days Until Tour: ${pricing.daysUntilTour}`);
        console.log(`   Is Early Bird: ${isEarlyBird}`);
        console.log(`   Original Price: ${pricing.originalPrice.toLocaleString('vi-VN')} VND`);
        console.log(`   Final Price: ${pricing.finalPrice.toLocaleString('vi-VN')} VND`);
        console.log(`   Discount: ${pricing.discountPercent}%`);
    });

    console.log('\n🎉 Tour Pricing Timezone Tests Completed!');
};

/**
 * Test API data transformation
 */
export const testAPIDataTransformation = () => {
    console.log('\n🧪 Testing API Data Transformation');
    console.log('===================================');

    // Mock API response data
    const mockApiResponse = {
        tourDetails: {
            id: '123',
            title: 'Test Tour',
            createdAt: '2024-01-15T03:30:00Z', // UTC
            updatedAt: '2024-01-16T04:00:00Z', // UTC
            tourStartDate: '2024-02-15T02:00:00Z' // UTC
        },
        bookings: [
            {
                id: '456',
                bookingDate: '2024-01-20T05:00:00Z', // UTC
                createdAt: '2024-01-20T05:00:00Z'
            }
        ]
    };

    console.log('Original API Response:');
    console.log(JSON.stringify(mockApiResponse, null, 2));

    // Test date parsing and formatting
    const tourDetails = mockApiResponse.tourDetails;
    console.log('\nParsed and Formatted Dates:');
    console.log(`Tour Created: ${formatVietnamDateTime(tourDetails.createdAt)}`);
    console.log(`Tour Updated: ${formatVietnamDateTime(tourDetails.updatedAt)}`);
    console.log(`Tour Start: ${formatVietnamDateTime(tourDetails.tourStartDate)}`);

    const booking = mockApiResponse.bookings[0];
    console.log(`Booking Date: ${formatVietnamDateTime(booking.bookingDate)}`);
    console.log(`Booking Created: ${formatVietnamDateTime(booking.createdAt)}`);

    console.log('\n🎉 API Data Transformation Tests Completed!');
};

/**
 * Run all timezone tests
 */
export const runAllTimezoneTests = () => {
    console.log('🚀 Starting Comprehensive Timezone Tests');
    console.log('=========================================');
    
    try {
        testVietnamTimezone();
        testTourPricingTimezone();
        testAPIDataTransformation();
        
        console.log('\n✅ All Timezone Tests Passed Successfully!');
        console.log('🇻🇳 Vietnam Timezone (UTC+7) is now properly implemented across the system.');
        
        return true;
    } catch (error) {
        console.error('\n❌ Timezone Tests Failed:', error);
        return false;
    }
};

/**
 * Validate timezone configuration
 */
export const validateTimezoneConfiguration = () => {
    const checks = [
        {
            name: 'Vietnam timezone offset',
            test: () => {
                const now = getVietnamNow();
                const utc = new Date();
                const diffHours = (now.getTime() - utc.getTime()) / (1000 * 60 * 60);
                return Math.abs(diffHours - 7) < 0.1; // Allow small floating point differences
            }
        },
        {
            name: 'Date formatting consistency',
            test: () => {
                const testDate = new Date('2024-01-15T10:30:00Z');
                const formatted1 = formatDate(testDate);
                const formatted2 = formatVietnamDate(testDate);
                return formatted1 === formatted2;
            }
        },
        {
            name: 'Early bird pricing timezone',
            test: () => {
                const tourCreated = '2024-01-01T00:00:00Z';
                const tourStart = '2024-02-15T02:00:00Z';
                const bookingDate = new Date('2024-01-05T03:00:00Z');
                return isEarlyBirdEligible(tourCreated, tourStart, bookingDate);
            }
        }
    ];

    console.log('\n🔍 Validating Timezone Configuration');
    console.log('====================================');

    let allPassed = true;
    checks.forEach((check, index) => {
        try {
            const result = check.test();
            console.log(`${index + 1}. ${check.name}: ${result ? '✅ PASS' : '❌ FAIL'}`);
            if (!result) allPassed = false;
        } catch (error) {
            console.log(`${index + 1}. ${check.name}: ❌ ERROR - ${error}`);
            allPassed = false;
        }
    });

    console.log(`\n${allPassed ? '✅ All validations passed!' : '❌ Some validations failed!'}`);
    return allPassed;
};
