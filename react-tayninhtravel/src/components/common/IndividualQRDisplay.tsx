import React from 'react';
import { Card, Button, Space, Typography, Row, Col, Divider, message } from 'antd';
import { DownloadOutlined, PrinterOutlined, ShareAltOutlined, } from '@ant-design/icons';
import QRCode from 'qrcode.react';
import { TourBookingGuest } from '../../types/individualQR';

const { Title, Text } = Typography;

interface IndividualQRDisplayProps {
  guests: TourBookingGuest[];
  bookingCode?: string;
  tourTitle?: string;
  totalPrice?: number;
  tourDate?: string;
}

const IndividualQRDisplay: React.FC<IndividualQRDisplayProps> = ({
  guests,
  bookingCode,
  tourTitle
}) => {

  // Download single QR code
  const downloadQRCode = (qrCodeData: string, guestName: string) => {
    if (!qrCodeData) return;

    try {
      const canvas = document.createElement('canvas');
      new (window as any).QRCode(canvas, {
        text: qrCodeData,
        width: 300,
        height: 300,
        correctLevel: (window as any).QRCode.CorrectLevel.M
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `QR_${guestName.replace(/\s+/g, '_')}_${bookingCode || 'booking'}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success(`Đã tải QR code cho ${guestName}`);
    } catch (error) {
      message.error('Có lỗi khi tải QR code');
    }
  };

  // Share QR code (copy to clipboard or share API)
  const shareQRCode = async (qrCodeData: string, guestName: string) => {
    if (!qrCodeData) return;

    try {
      if (navigator.share) {
        // Use Web Share API if available
        await navigator.share({
          title: `QR Code - ${guestName}`,
          text: `QR Code cho ${guestName} - Tour: ${tourTitle || 'Tour Experience'}`,
          url: `data:text/plain,${encodeURIComponent(qrCodeData)}`
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(qrCodeData);
        message.success(`Đã copy QR code data cho ${guestName}`);
      }
    } catch (error) {
      message.error('Có lỗi khi chia sẻ QR code');
    }
  };

  // Print all QR codes
  const printAllQRCodes = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      message.error('Không thể mở cửa sổ in');
      return;
    }

    const qrCodesHtml = guests.map((guest, index) =>
      guest.qrCodeData ? `
        <div style="page-break-after: ${index < guests.length - 1 ? 'always' : 'auto'}; padding: 20px; text-align: center;">
          <h2 style="margin-bottom: 10px;">${guest.guestName}</h2>
          <p style="margin-bottom: 5px;"><strong>Email:</strong> ${guest.guestEmail}</p>
          ${guest.guestPhone ? `<p style="margin-bottom: 5px;"><strong>Phone:</strong> ${guest.guestPhone}</p>` : ''}
          <p style="margin-bottom: 15px;"><strong>Booking:</strong> ${bookingCode || 'N/A'}</p>
          ${tourTitle ? `<p style="margin-bottom: 15px;"><strong>Tour:</strong> ${tourTitle}</p>` : ''}
          <div style="display: flex; justify-content: center; margin: 20px 0;">
            <canvas id="qr-${guest.id}" width="200" height="200"></canvas>
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            Vui lòng xuất trình QR code này cho hướng dẫn viên để check-in
          </p>
        </div>
      ` : ''
    ).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes - ${tourTitle || 'Tour Booking'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            @media print { 
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
        </head>
        <body>
          ${qrCodesHtml}
          <script>
            // Generate QR codes after page loads
            window.onload = function() {
              ${guests.map(guest =>
      guest.qrCodeData ? `
                  QRCode.toCanvas(document.getElementById('qr-${guest.id}'), '${guest.qrCodeData}', {
                    width: 200,
                    height: 200
                  });
                ` : ''
    ).join('')}
              
              setTimeout(() => window.print(), 500);
            };
          </script>
        </body>
      </html>
    `);
  };

  // Download all QR codes as ZIP (simplified version - just download individually)
  const downloadAllQRCodes = () => {
    guests.forEach((guest, index) => {
      if (guest.qrCodeData) {
        setTimeout(() => {
          downloadQRCode(guest.qrCodeData!, guest.guestName);
        }, index * 500); // Delay to avoid browser blocking multiple downloads
      }
    });
  };

  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString('vi-VN');
  };

  return (
    <div className="individual-qr-section">
      <Title level={4} style={{ marginBottom: 16 }}>
        🎫 QR Codes cá nhân
      </Title>

      {/* Bulk Actions */}
      {guests.some(g => g.qrCodeData) && (
        <div style={{ marginBottom: 24 }}>
          <Space>
            <Button
              icon={<PrinterOutlined />}
              onClick={printAllQRCodes}
              type="primary"
            >
              In tất cả QR codes
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={downloadAllQRCodes}
            >
              Tải tất cả QR codes
            </Button>
          </Space>
        </div>
      )}

      {/* Individual QR Cards */}
      <Row gutter={[16, 16]}>
        {guests.map((guest) => (
          <Col xs={24} sm={12} md={8} lg={6} key={guest.id}>
            <Card
              size="small"
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text strong>{guest.guestName}</Text>
                  {/* <Tag
                    color={guest.isCheckedIn ? 'success' : 'default'}
                    icon={guest.isCheckedIn ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                  >
                    {guest.isCheckedIn ? 'Đã check-in' : 'Chưa check-in'}
                  </Tag> */}
                </div>
              }
              style={{ height: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                {/* Guest Info */}
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Email:</Text>
                  <br />
                  <Text style={{ fontSize: 13, wordBreak: 'break-all' }}>{guest.guestEmail}</Text>
                </div>

                {guest.guestPhone && (
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Phone:</Text>
                    <br />
                    <Text style={{ fontSize: 13 }}>{guest.guestPhone}</Text>
                  </div>
                )}

                {/* QR Code */}
                <Divider style={{ margin: '8px 0' }} />

                {guest.qrCodeData ? (
                  <div style={{ textAlign: 'center' }}>
                    <QRCode
                      value={guest.qrCodeData}
                      size={120}
                      level="M"
                      includeMargin
                    />

                    {/* QR Actions */}
                    <div style={{ marginTop: 8 }}>
                      <Space size="small">
                        <Button
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => downloadQRCode(guest.qrCodeData!, guest.guestName)}
                          title="Tải QR code"
                        />
                        <Button
                          size="small"
                          icon={<ShareAltOutlined />}
                          onClick={() => shareQRCode(guest.qrCodeData!, guest.guestName)}
                          title="Chia sẻ QR code"
                        />
                      </Space>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      ⏳ QR code sẽ được tạo sau khi thanh toán
                    </Text>
                  </div>
                )}

                {/* Check-in Status */}
                {guest.isCheckedIn && guest.checkInTime && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      Check-in: {formatDateTime(guest.checkInTime)}
                    </Text>
                    {guest.checkInNotes && (
                      <>
                        <br />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Ghi chú: {guest.checkInNotes}
                        </Text>
                      </>
                    )}
                  </div>
                )}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* No Guests */}
      {guests.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text type="secondary">Không có thông tin khách hàng</Text>
        </div>
      )}
    </div>
  );
};

export default IndividualQRDisplay;