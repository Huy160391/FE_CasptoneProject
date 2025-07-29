/**
 * Mock data for testing Dashboard invitation display
 */

export const mockInvitationWithMessage = {
    id: 'test-invitation-1',
    tourDetails: {
        id: 'tour-1',
        title: 'Tour Tây Ninh - Núi Bà Đen',
        description: 'Khám phá vẻ đẹp thiêng liêng của Núi Bà Đen, ngọn núi cao nhất Đông Nam Bộ. Tour bao gồm tham quan chùa Bà Đen, cáp treo lên đỉnh núi, và thưởng thức các món ăn đặc sản địa phương.',
        location: 'Tây Ninh',
        startDate: '2025-08-15T08:00:00Z',
        endDate: '2025-08-15T18:00:00Z',
        price: 850000,
        maxParticipants: 25,
        duration: '1 ngày',
        category: 'Tâm linh - Văn hóa'
    },
    guide: {
        id: 'guide-1',
        name: 'Nguyễn Văn A',
        email: 'guide@example.com'
    },
    createdBy: {
        id: 'company-1',
        name: 'Công ty Du lịch Sài Gòn Tourist'
    },
    invitationType: 'Manual',
    status: 'Pending',
    invitedAt: '2025-07-29T10:30:00Z',
    expiresAt: '2025-08-05T23:59:59Z',
    invitationMessage: 'Chào bạn! Chúng tôi rất mong muốn được hợp tác với bạn cho tour Núi Bà Đen này. Đây là một tour đặc biệt dành cho khách nước ngoài, yêu cầu hướng dẫn viên có kỹ năng tiếng Anh tốt và hiểu biết sâu về văn hóa tâm linh Việt Nam. Tour sẽ có 20 khách Âu - Mỹ, họ rất quan tâm đến lịch sử và văn hóa địa phương. Vui lòng xác nhận nếu bạn có thể đáp ứng các yêu cầu này. Cảm ơn bạn!'
};

export const mockInvitationWithoutMessage = {
    id: 'test-invitation-2',
    tourDetails: {
        id: 'tour-2',
        title: 'Tour Cao Đài Tây Ninh',
        description: 'Tham quan Tòa Thánh Cao Đài, tìm hiểu về tôn giáo độc đáo của Việt Nam.',
        location: 'Tây Ninh',
        startDate: '2025-08-20T07:00:00Z',
        endDate: '2025-08-20T17:00:00Z',
        price: 650000,
        maxParticipants: 30,
        duration: '1 ngày',
        category: 'Tâm linh - Văn hóa'
    },
    guide: {
        id: 'guide-1',
        name: 'Nguyễn Văn A',
        email: 'guide@example.com'
    },
    createdBy: {
        id: 'company-2',
        name: 'Công ty Du lịch Đồng Nai'
    },
    invitationType: 'Automatic',
    status: 'Pending',
    invitedAt: '2025-07-30T09:15:00Z',
    expiresAt: '2025-08-10T23:59:59Z',
    invitationMessage: null
};

export const mockUrgentInvitation = {
    id: 'test-invitation-3',
    tourDetails: {
        id: 'tour-3',
        title: 'Tour Khẩn Cấp - Cần Thơ',
        description: 'Tour thay thế gấp do hướng dẫn viên chính bị ốm.',
        location: 'Cần Thơ',
        startDate: '2025-07-31T06:00:00Z',
        endDate: '2025-08-01T20:00:00Z',
        price: 1200000,
        maxParticipants: 15,
        duration: '2 ngày 1 đêm',
        category: 'Miền Tây - Sông nước'
    },
    guide: {
        id: 'guide-1',
        name: 'Nguyễn Văn A',
        email: 'guide@example.com'
    },
    createdBy: {
        id: 'company-3',
        name: 'Mekong Delta Tours'
    },
    invitationType: 'Manual',
    status: 'Pending',
    invitedAt: '2025-07-30T14:00:00Z',
    expiresAt: '2025-07-30T20:00:00Z', // Expires in few hours - URGENT
    invitationMessage: 'KHẨN CẤP: Hướng dẫn viên chính của chúng tôi đột ngột bị ốm và không thể tham gia tour Cần Thơ ngày mai. Chúng tôi rất cần bạn thay thế gấp. Tour có 15 khách VIP từ Nhật Bản, yêu cầu dịch vụ chất lượng cao. Phí hướng dẫn sẽ được tăng thêm 50% do tính chất khẩn cấp. Vui lòng phản hồi ngay nếu có thể nhận tour này. Xin cảm ơn!'
};

// Test function to log mock data
export const testMockData = () => {
    console.log('🧪 Testing Mock Invitation Data');
    console.log('================================');
    
    console.log('✅ Invitation WITH message:');
    console.log('- Title:', mockInvitationWithMessage.tourDetails.title);
    console.log('- Company:', mockInvitationWithMessage.createdBy.name);
    console.log('- Message:', mockInvitationWithMessage.invitationMessage);
    console.log('- Type:', mockInvitationWithMessage.invitationType);
    console.log('');
    
    console.log('✅ Invitation WITHOUT message:');
    console.log('- Title:', mockInvitationWithoutMessage.tourDetails.title);
    console.log('- Company:', mockInvitationWithoutMessage.createdBy.name);
    console.log('- Message:', mockInvitationWithoutMessage.invitationMessage);
    console.log('- Type:', mockInvitationWithoutMessage.invitationType);
    console.log('');
    
    console.log('🚨 URGENT Invitation:');
    console.log('- Title:', mockUrgentInvitation.tourDetails.title);
    console.log('- Company:', mockUrgentInvitation.createdBy.name);
    console.log('- Expires:', new Date(mockUrgentInvitation.expiresAt).toLocaleString('vi-VN'));
    console.log('- Message:', mockUrgentInvitation.invitationMessage);
    console.log('');
    
    console.log('🎯 Expected Dashboard Display:');
    console.log('1. Basic info always visible');
    console.log('2. "💬 Có tin nhắn đặc biệt" indicator for invitations with message');
    console.log('3. Expanded details show full information');
    console.log('4. Invitation message displayed in blue box when expanded');
    console.log('5. Urgent invitations have red styling');
    console.log('6. Quick accept disabled for invitations with message');
};

export default {
    mockInvitationWithMessage,
    mockInvitationWithoutMessage,
    mockUrgentInvitation,
    testMockData
};