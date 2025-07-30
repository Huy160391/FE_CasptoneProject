/**
 * Test Schedule Conflict Error Parsing
 */

// Test message from API response
const testMessage = "❌ KHÔNG THỂ CHẤP NHẬN: Bạn đã đồng ý tham gia tour khác cùng thời gian biểu. Tour hiện tại: Thứ 7 - Tháng 9/2025. Tour bị trùng: Tour 'test' (Thứ 7 - Tháng 9/2025). Vui lòng kiểm tra lại lịch của bạn.";

// Test parsing function
function testScheduleConflictParsing(errorMessage) {
    console.log('🧪 Testing schedule conflict parsing');
    console.log('📝 Input message:', errorMessage);
    console.log('================================');
    
    // Extract tour information from error message if available
    let conflictingTours = [];
    let currentTour = '';
    
    // Try to extract current tour info
    const currentTourMatch = errorMessage.match(/Tour hiện tại:\s*([^.]+)/);
    if (currentTourMatch) {
        currentTour = currentTourMatch[1].trim();
        console.log('✅ Current tour extracted:', currentTour);
    } else {
        console.log('❌ Current tour not found');
    }
    
    // Try to extract conflicting tour info - Updated regex for new format
    const conflictTourMatch = errorMessage.match(/Tour bị trùng:\s*Tour\s*'([^']+)'\s*\(([^)]+)\)/);
    if (conflictTourMatch) {
        const tourName = conflictTourMatch[1];
        const tourTime = conflictTourMatch[2];
        conflictingTours.push(`${tourName} (${tourTime})`);
        console.log('✅ Conflicting tour extracted:', `${tourName} (${tourTime})`);
    } else {
        console.log('❌ Conflicting tour not found with new regex');
        
        // Fallback: try old regex pattern
        const tourMatches = errorMessage.match(/Tour.*?(?=Tour|$)/g);
        conflictingTours = tourMatches ? tourMatches.slice(0, 3) : [];
        console.log('🔄 Fallback regex result:', conflictingTours);
    }
    
    console.log('================================');
    console.log('🎯 Final extracted info:');
    console.log('- Current tour:', currentTour || 'Not found');
    console.log('- Conflicting tours:', conflictingTours.length > 0 ? conflictingTours : 'Not found');
    console.log('');
    
    return { currentTour, conflictingTours };
}

// Test with actual API response
console.log('🚀 Running Schedule Conflict Parsing Test');
console.log('==========================================');

const result = testScheduleConflictParsing(testMessage);

// Expected results
const expected = {
    currentTour: 'Thứ 7 - Tháng 9/2025',
    conflictingTours: ['test (Thứ 7 - Tháng 9/2025)']
};

console.log('📊 Test Results:');
console.log('================');
console.log('✅ Current tour match:', result.currentTour === expected.currentTour);
console.log('✅ Conflicting tours match:', JSON.stringify(result.conflictingTours) === JSON.stringify(expected.conflictingTours));

if (result.currentTour === expected.currentTour && 
    JSON.stringify(result.conflictingTours) === JSON.stringify(expected.conflictingTours)) {
    console.log('🎉 ALL TESTS PASSED!');
} else {
    console.log('❌ TESTS FAILED!');
    console.log('Expected:', expected);
    console.log('Actual:', result);
}

// Test edge cases
console.log('\n🧪 Testing Edge Cases:');
console.log('======================');

// Test case 1: Empty message
testScheduleConflictParsing('');

// Test case 2: Different format
testScheduleConflictParsing('❌ XUNG ĐỘT THỜI GIAN BIỂU: Bạn đã đăng ký tham gia tour thác cùng thời gian biểu. Tour hiện tại: Chủ nhật - Tháng 8/2025. Tour bị trùng: Tour "Tour Núi Bà Đen - Tháng tới" (Chủ nhật - Tháng 8/2025)');

// Test case 3: English message
testScheduleConflictParsing('Schedule conflict detected for tour booking');

export { testScheduleConflictParsing };
export default testMessage;