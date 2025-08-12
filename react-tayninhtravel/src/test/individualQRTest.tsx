import React, { useState } from 'react';
import { Button, Card, Space, Typography, Row, Col } from 'antd';
import { TourBookingGuest, CreateTourBookingRequest } from '../types/individualQR';
import IndividualQRDisplay from '../components/common/IndividualQRDisplay';
import { validateBookingRequest } from '../services/tourBookingService';

const { Title, Text } = Typography;

/**
 * 🧪 Individual QR System Test Component
 * Test component để verify individual QR system integration
 */
const IndividualQRTest: React.FC = () => {
  
  // Mock test data
  const mockGuests: TourBookingGuest[] = [
    {
      id: 'guest-1',
      tourBookingId: 'booking-123',
      guestName: 'Nguyen Van A',
      guestEmail: 'nguyenvana@test.com',
      guestPhone: '0123456789',
      isCheckedIn: false,
      qrCodeData: JSON.stringify({
        guestId: 'guest-1',
        guestName: 'Nguyen Van A',
        guestEmail: 'nguyenvana@test.com',
        bookingId: 'booking-123',
        bookingCode: 'TNT-2024-001',
        tourOperationId: 'tour-op-1',
        tourSlotId: 'slot-1',
        totalPrice: 500000,
        numberOfGuests: 2,
        tourTitle: 'Tay Ninh Temple Tour',
        tourDate: new Date().toISOString(),
        generatedAt: new Date().toISOString(),
        version: '3.0',
        type: 'IndividualGuest'
      }),
      createdAt: new Date().toISOString()
    },
    {
      id: 'guest-2',
      tourBookingId: 'booking-123',
      guestName: 'Tran Thi B',
      guestEmail: 'tranthib@test.com',
      guestPhone: '0987654321',
      isCheckedIn: true,
      checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      checkInNotes: 'Đã check-in thành công',
      qrCodeData: JSON.stringify({
        guestId: 'guest-2',
        guestName: 'Tran Thi B',
        guestEmail: 'tranthib@test.com',
        bookingId: 'booking-123',
        bookingCode: 'TNT-2024-001',
        tourOperationId: 'tour-op-1',
        tourSlotId: 'slot-1',
        totalPrice: 500000,
        numberOfGuests: 2,
        tourTitle: 'Tay Ninh Temple Tour',
        tourDate: new Date().toISOString(),
        generatedAt: new Date().toISOString(),
        version: '3.0',
        type: 'IndividualGuest'
      }),
      createdAt: new Date().toISOString()
    }
  ];

  const mockBookingRequest: CreateTourBookingRequest = {
    tourSlotId: 'slot-123',
    numberOfGuests: 2,
    contactPhone: '0123456789',
    specialRequests: 'Ăn chay, không cay',
    guests: [
      {
        guestName: 'Nguyen Van A',
        guestEmail: 'nguyenvana@test.com',
        guestPhone: '0123456789'
      },
      {
        guestName: 'Tran Thi B',
        guestEmail: 'tranthib@test.com',
        guestPhone: '0987654321'
      }
    ]
  };

  const [testResults, setTestResults] = useState<string[]>([]);
  
  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // Test validation function
  const testValidation = () => {
    const validation = validateBookingRequest(mockBookingRequest);
    
    if (validation.isValid) {
      addTestResult('✅ Validation PASSED - Individual QR booking request is valid');
    } else {
      addTestResult(`❌ Validation FAILED - Errors: ${validation.errors.join(', ')}`);
    }
  };

  // Test invalid request (duplicate emails)
  const testInvalidRequest = () => {
    const invalidRequest = {
      ...mockBookingRequest,
      guests: [
        { guestName: 'Test 1', guestEmail: 'same@test.com' },
        { guestName: 'Test 2', guestEmail: 'same@test.com' } // Duplicate email
      ]
    };

    const validation = validateBookingRequest(invalidRequest);
    
    if (!validation.isValid) {
      addTestResult('✅ Validation PASSED - Correctly rejected duplicate emails');
    } else {
      addTestResult('❌ Validation FAILED - Should have rejected duplicate emails');
    }
  };

  // Test guest count mismatch
  const testGuestCountMismatch = () => {
    const invalidRequest = {
      ...mockBookingRequest,
      numberOfGuests: 3, // Mismatch with guests.length (2)
    };

    const validation = validateBookingRequest(invalidRequest);
    
    if (!validation.isValid) {
      addTestResult('✅ Validation PASSED - Correctly rejected guest count mismatch');
    } else {
      addTestResult('❌ Validation FAILED - Should have rejected guest count mismatch');
    }
  };

  const runAllTests = () => {
    setTestResults([]);
    addTestResult('🚀 Starting Individual QR System Tests...');
    
    testValidation();
    testInvalidRequest();
    testGuestCountMismatch();
    
    addTestResult('🏁 All tests completed!');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>🧪 Individual QR System Tests</Title>
      
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        
        {/* Test Controls */}
        <Card title="Test Controls">
          <Space>
            <Button type="primary" onClick={runAllTests}>
              Run All Tests
            </Button>
            <Button onClick={testValidation}>
              Test Validation
            </Button>
            <Button onClick={testInvalidRequest}>
              Test Invalid Request
            </Button>
            <Button onClick={testGuestCountMismatch}>
              Test Guest Count Mismatch
            </Button>
            <Button onClick={clearResults}>
              Clear Results
            </Button>
          </Space>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card title="Test Results">
            <div style={{ 
              background: '#f6f8fa', 
              padding: 12, 
              borderRadius: 6, 
              fontFamily: 'monospace',
              fontSize: '13px',
              maxHeight: 200,
              overflow: 'auto'
            }}>
              {testResults.map((result, index) => (
                <div key={index} style={{ marginBottom: 4 }}>
                  {result}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* QR Display Test */}
        <Card title="QR Display Component Test">
          <IndividualQRDisplay
            guests={mockGuests}
            bookingCode="TNT-2024-001"
            tourTitle="Tay Ninh Temple Tour"
            totalPrice={500000}
            tourDate={new Date().toISOString()}
          />
        </Card>

        {/* Mock Data Display */}
        <Row gutter={16}>
          <Col span={12}>
            <Card title="Mock Booking Request" size="small">
              <pre style={{ fontSize: 12, overflow: 'auto' }}>
                {JSON.stringify(mockBookingRequest, null, 2)}
              </pre>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Mock Guests Data" size="small">
              <pre style={{ fontSize: 12, overflow: 'auto' }}>
                {JSON.stringify(mockGuests, null, 2)}
              </pre>
            </Card>
          </Col>
        </Row>

      </Space>
    </div>
  );
};

export default IndividualQRTest;