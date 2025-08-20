import { message } from 'antd';
import { TourBookingGuest } from '../types/individualQR';

/**
 * Download individual QR code as PNG image
 */
export const downloadQRCode = (qrCodeData: string, guestName: string, bookingCode?: string): void => {
  if (!qrCodeData) {
    message.error('Không có dữ liệu QR code');
    return;
  }

  try {
    // Create a temporary canvas to generate QR code
    const canvas = document.createElement('canvas');
    const size = 300;
    canvas.width = size;
    canvas.height = size;

    // Using qrcode library to generate QR to canvas
    import('qrcode').then(QRCode => {
      QRCode.toCanvas(canvas, qrCodeData, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) {
          message.error('Lỗi tạo QR code');
          return;
        }

        // Create download link
        const link = document.createElement('a');
        link.download = `QR_${guestName.replace(/\s+/g, '_')}_${bookingCode || 'booking'}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        message.success(`Đã tải QR code cho ${guestName}`);
      });
    }).catch(() => {
      message.error('Không thể load QR code library');
    });
  } catch (error) {
    console.error('Error downloading QR code:', error);
    message.error('Có lỗi khi tải QR code');
  }
};

/**
 * Share QR code data via Web Share API or clipboard
 */
export const shareQRCode = async (qrCodeData: string, guestName: string, tourTitle?: string): Promise<void> => {
  if (!qrCodeData) {
    message.error('Không có dữ liệu QR code');
    return;
  }

  try {
    // Try Web Share API first (mobile devices)
    if (navigator.share) {
      await navigator.share({
        title: `QR Code - ${guestName}`,
        text: `QR Code cho ${guestName} - Tour: ${tourTitle || 'Tour Experience'}`,
        url: `data:text/plain,${encodeURIComponent(qrCodeData)}`
      });
      message.success('Đã chia sẻ QR code');
    } else if (navigator.clipboard) {
      // Fallback: Copy QR data to clipboard
      await navigator.clipboard.writeText(qrCodeData);
      message.success(`Đã copy QR code data cho ${guestName}`);
    } else {
      // Last fallback: Show QR data in a modal/alert
      const textarea = document.createElement('textarea');
      textarea.value = qrCodeData;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      message.success(`Đã copy QR code data cho ${guestName}`);
    }
  } catch (error) {
    console.error('Error sharing QR code:', error);
    message.error('Có lỗi khi chia sẻ QR code');
  }
};

/**
 * Print all QR codes in a formatted layout
 */
export const printAllQRCodes = (
  guests: TourBookingGuest[],
  bookingCode?: string,
  tourTitle?: string,
  tourDate?: string
): void => {
  const validGuests = guests.filter(g => g.qrCodeData);
  
  if (validGuests.length === 0) {
    message.warning('Không có QR code nào để in');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    message.error('Không thể mở cửa sổ in');
    return;
  }

  const qrCodesHtml = validGuests.map((guest, index) => `
    <div style="page-break-after: ${index < validGuests.length - 1 ? 'always' : 'auto'}; padding: 30px; text-align: center; min-height: 90vh;">
      <div style="border: 2px solid #1890ff; border-radius: 8px; padding: 20px; max-width: 400px; margin: 0 auto;">
        <h1 style="color: #1890ff; margin-bottom: 20px; font-size: 24px;">🎫 Tour Ticket</h1>
        
        <div style="margin-bottom: 20px;">
          <h2 style="margin-bottom: 5px; font-size: 20px;">${guest.guestName}</h2>
          <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${guest.guestEmail}</p>
          ${guest.guestPhone ? `<p style="margin: 5px 0; color: #666;"><strong>Phone:</strong> ${guest.guestPhone}</p>` : ''}
        </div>
        
        ${bookingCode ? `<p style="margin: 10px 0; font-size: 16px;"><strong>Booking Code:</strong> ${bookingCode}</p>` : ''}
        ${tourTitle ? `<p style="margin: 10px 0; font-size: 14px;"><strong>Tour:</strong> ${tourTitle}</p>` : ''}
        ${tourDate ? `<p style="margin: 10px 0; font-size: 14px;"><strong>Date:</strong> ${new Date(tourDate).toLocaleDateString('vi-VN')}</p>` : ''}
        
        <div style="margin: 30px 0;">
          <canvas id="qr-${guest.id}" width="250" height="250" style="border: 1px solid #ddd;"></canvas>
        </div>
        
        <div style="background: #f0f8ff; padding: 15px; border-radius: 4px; font-size: 12px; color: #1890ff;">
          <strong>📋 Hướng dẫn sử dụng:</strong>
          <ul style="text-align: left; margin: 10px 0 0 0; padding-left: 20px;">
            <li>Xuất trình QR code này cho hướng dẫn viên</li>
            <li>Đến điểm khởi hành sớm 15 phút</li>
            <li>Mang theo giấy tờ tùy thân</li>
          </ul>
        </div>
      </div>
    </div>
  `).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>QR Codes - ${tourTitle || 'Tour Booking'}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 0; 
            background: white;
          }
          @media print { 
            body { margin: 0; }
            .no-print { display: none; }
          }
          canvas { 
            max-width: 100%; 
            height: auto; 
          }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
      </head>
      <body>
        ${qrCodesHtml}
        <script>
          window.onload = function() {
            let loadedCount = 0;
            const totalQRs = ${validGuests.length};
            
            ${validGuests.map(guest => `
              QRCode.toCanvas(document.getElementById('qr-${guest.id}'), '${guest.qrCodeData}', {
                width: 250,
                height: 250,
                margin: 2,
                color: {
                  dark: '#000000',
                  light: '#FFFFFF'
                }
              }, function(error) {
                if (!error) {
                  loadedCount++;
                  if (loadedCount === totalQRs) {
                    setTimeout(() => {
                      window.print();
                      setTimeout(() => window.close(), 1000);
                    }, 500);
                  }
                }
              });
            `).join('')}
          };
        </script>
      </body>
    </html>
  `);

  message.success(`Đang chuẩn bị in ${validGuests.length} QR code(s)`);
};

/**
 * Download all QR codes as individual files
 */
export const downloadAllQRCodes = (
  guests: TourBookingGuest[],
  bookingCode?: string
): void => {
  const validGuests = guests.filter(g => g.qrCodeData);
  
  if (validGuests.length === 0) {
    message.warning('Không có QR code nào để tải');
    return;
  }

  message.info(`Đang tải ${validGuests.length} QR code(s)...`);
  
  validGuests.forEach((guest, index) => {
    setTimeout(() => {
      downloadQRCode(guest.qrCodeData!, guest.guestName, bookingCode);
    }, index * 800); // Stagger downloads to avoid browser blocking
  });
};

/**
 * Validate QR code data format
 */
export const isValidQRData = (qrData?: string): boolean => {
  if (!qrData) return false;
  
  try {
    const parsed = JSON.parse(qrData);
    return parsed.guestId && parsed.guestName && parsed.bookingId;
  } catch {
    return false;
  }
};

/**
 * Extract guest info from QR code data (for debugging/display)
 */
export const parseQRData = (qrData: string): any => {
  try {
    return JSON.parse(qrData);
  } catch {
    return null;
  }
};

/**
 * Format QR code data for display (truncated)
 */
export const formatQRDataPreview = (qrData?: string, maxLength = 50): string => {
  if (!qrData) return 'N/A';
  
  if (qrData.length <= maxLength) {
    return qrData;
  }
  
  return qrData.substring(0, maxLength) + '...';
};

export default {
  downloadQRCode,
  shareQRCode,
  printAllQRCodes,
  downloadAllQRCodes,
  isValidQRData,
  parseQRData,
  formatQRDataPreview
};