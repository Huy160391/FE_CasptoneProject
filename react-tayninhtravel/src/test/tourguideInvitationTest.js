// Test script để kiểm tra TourGuide Invitation APIs
import { getMyInvitations, acceptInvitation, rejectInvitation } from '../services/tourguideService';

// Test function để kiểm tra API
const testTourGuideInvitationAPIs = async () => {
    console.log('🧪 Testing TourGuide Invitation APIs...');

    try {
        // Test 1: Get my invitations
        console.log('\n📋 Test 1: Getting my invitations...');
        const invitationsResponse = await getMyInvitations();
        console.log('✅ Get invitations response:', invitationsResponse);

        if (invitationsResponse.success) {
            console.log('📊 Statistics:', invitationsResponse.data.statistics);
            console.log('📝 Invitations count:', invitationsResponse.data.invitations.length);

            // Log first invitation if exists
            if (invitationsResponse.data.invitations.length > 0) {
                const firstInvitation = invitationsResponse.data.invitations[0];
                console.log('📄 First invitation:', {
                    id: firstInvitation.id,
                    tourTitle: firstInvitation.tourDetails.title,
                    status: firstInvitation.status,
                    invitationType: firstInvitation.invitationType,
                    expiresAt: firstInvitation.expiresAt
                });

                // Test 2: Test accept invitation (only if pending)
                if (firstInvitation.status === 'Pending') {
                    console.log('\n✅ Test 2: Testing accept invitation...');
                    console.log('⚠️  Note: This is just a test call, not actually accepting');
                    // Uncomment below to actually test accept
                    // const acceptResponse = await acceptInvitation(firstInvitation.id, 'Test acceptance message');
                    // console.log('Accept response:', acceptResponse);
                }

                // Test 3: Test reject invitation (only if pending)
                if (firstInvitation.status === 'Pending') {
                    console.log('\n❌ Test 3: Testing reject invitation...');
                    console.log('⚠️  Note: This is just a test call, not actually rejecting');
                    // Uncomment below to actually test reject
                    // const rejectResponse = await rejectInvitation(firstInvitation.id, 'Test rejection reason');
                    // console.log('Reject response:', rejectResponse);
                }
            } else {
                console.log('ℹ️  No invitations found');
            }
        } else {
            console.error('❌ Failed to get invitations:', invitationsResponse.message);
        }

        // Test 4: Get invitations with status filter
        console.log('\n🔍 Test 4: Getting pending invitations only...');
        const pendingInvitationsResponse = await getMyInvitations('Pending');
        console.log('✅ Pending invitations response:', pendingInvitationsResponse);

    } catch (error) {
        console.error('❌ Test failed with error:', error);

        // Check if it's an authentication error
        if (error.response?.status === 401) {
            console.error('🔐 Authentication error - make sure you are logged in as a Tour Guide');
        } else if (error.response?.status === 403) {
            console.error('🚫 Authorization error - make sure you have Tour Guide role');
        } else if (error.response?.status === 404) {
            console.error('🔍 API endpoint not found - check the API URL');
        } else {
            console.error('🔧 Other error:', error.message);
        }
    }
};

// Function to check authentication status
const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    console.log('🔐 Authentication Status:');
    console.log('Token exists:', !!token);

    if (user) {
        try {
            const userData = JSON.parse(user);
            console.log('User role:', userData.role);
            console.log('User name:', userData.name);
            console.log('User email:', userData.email);

            if (userData.role !== 'Tour Guide') {
                console.warn('⚠️  Warning: Current user role is not "Tour Guide"');
            }
        } catch (e) {
            console.error('❌ Error parsing user data:', e);
        }
    } else {
        console.log('❌ No user data found');
    }
};

// Function to test API connectivity
const testAPIConnectivity = async () => {
    console.log('🌐 Testing API connectivity...');

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5267/api';
    console.log('API Base URL:', API_BASE_URL);

    try {
        const response = await fetch(`${API_BASE_URL}/TourGuideInvitation/my-invitations`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
            const data = await response.json();
            console.log('✅ API is accessible');
            console.log('Response data structure:', {
                success: data.success,
                statusCode: data.statusCode,
                message: data.message,
                hasInvitations: !!data.invitations,
                hasStatistics: !!data.statistics
            });
        } else {
            console.error('❌ API returned error status:', response.status);
            const errorText = await response.text();
            console.error('Error response:', errorText);
        }
    } catch (error) {
        console.error('❌ Network error:', error);
    }
};

// Export functions for use in browser console
window.testTourGuideInvitationAPIs = testTourGuideInvitationAPIs;
window.checkAuthStatus = checkAuthStatus;
window.testAPIConnectivity = testAPIConnectivity;

// Auto-run basic checks when script loads
console.log('🚀 TourGuide Invitation Test Script Loaded');
console.log('Available functions:');
console.log('- testTourGuideInvitationAPIs()');
console.log('- checkAuthStatus()');
console.log('- testAPIConnectivity()');

// Run basic checks
checkAuthStatus();

export { testTourGuideInvitationAPIs, checkAuthStatus, testAPIConnectivity };
