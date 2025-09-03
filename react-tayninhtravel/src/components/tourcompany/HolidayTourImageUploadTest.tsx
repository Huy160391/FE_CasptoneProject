import React, { useState } from "react";
import { Button, Card, Space, Typography, Upload, message, Row, Col, Alert } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { publicService } from "../../services/publicService";

const { Title, Text, Paragraph } = Typography;

const HolidayTourImageUploadTest: React.FC = () => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      
      // Sử dụng API upload thật
      const imageUrl = await publicService.uploadImage(file);
      
      if (imageUrl) {
        setImageUrls((prev) => [...prev, imageUrl]);
        message.success("Ảnh đã được tải lên thành công");
        console.log("Uploaded image URL:", imageUrl);
      } else {
        message.error("Lỗi khi tải ảnh lên. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      message.error("Lỗi khi tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
    
    return false; // Prevent default upload
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
    message.success("Đã xóa ảnh");
  };

  const testApiCall = () => {
    const testData = {
      title: "Test Holiday Tour",
      startLocation: "TP.HCM",
      endLocation: "Tây Ninh", 
      templateType: "FreeScenic",
      tourDate: "2025-11-06T07:00:00.000+07:00",
      images: imageUrls
    };
    
    console.log("Test API call data:", JSON.stringify(testData, null, 2));
    alert(`API sẽ gửi ${imageUrls.length} ảnh. Check console để xem chi tiết.`);
  };

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Card>
        <Title level={2}>Holiday Tour Image Upload Test</Title>
        <Paragraph>
          Test upload ảnh thật cho Holiday Tour sử dụng API <code>/Image/Upload</code>
        </Paragraph>
        
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Text strong>Upload ảnh (tối đa 5 ảnh):</Text>
            
            <div style={{ marginTop: 16 }}>
              {/* Hiển thị ảnh đã upload */}
              {imageUrls.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Row gutter={[8, 8]}>
                    {imageUrls.map((url, index) => (
                      <Col key={index} span={6}>
                        <div style={{ position: 'relative', border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
                          <img 
                            src={url} 
                            alt={`Tour image ${index + 1}`}
                            style={{ width: '100%', height: 100, objectFit: 'cover' }}
                          />
                          <Button
                            type="text"
                            danger
                            size="small"
                            onClick={() => handleRemoveImage(index)}
                            style={{ 
                              position: 'absolute', 
                              top: 4, 
                              right: 4, 
                              background: 'rgba(255,255,255,0.8)',
                              minWidth: 24,
                              height: 24
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
              
              {/* Upload button */}
              <Upload
                listType="picture-card"
                beforeUpload={handleImageUpload}
                showUploadList={false}
                disabled={imageUrls.length >= 5 || uploading}
              >
                {imageUrls.length < 5 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>
                      {uploading ? "Đang tải..." : `Tải lên (${imageUrls.length}/5)`}
                    </div>
                  </div>
                )}
              </Upload>
              
              {imageUrls.length >= 5 && (
                <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                  Đã đạt giới hạn tối đa 5 ảnh
                </div>
              )}
            </div>
          </div>

          {imageUrls.length > 0 && (
            <Alert
              message="Ảnh đã upload thành công"
              description={
                <div>
                  <p><strong>Số lượng ảnh:</strong> {imageUrls.length}</p>
                  <p><strong>URLs:</strong></p>
                  <ul style={{ marginTop: 8 }}>
                    {imageUrls.map((url, index) => (
                      <li key={index} style={{ wordBreak: "break-all", marginBottom: 4 }}>
                        <code>{url}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              }
              type="success"
              style={{ marginTop: 16 }}
            />
          )}

          <div>
            <Title level={4}>API Integration:</Title>
            <ul>
              <li><strong>Endpoint:</strong> <code>POST /Image/Upload</code></li>
              <li><strong>Service:</strong> <code>publicService.uploadImage()</code></li>
              <li><strong>Response:</strong> <code>{"{ urls: string[] }"}</code></li>
              <li><strong>Max files:</strong> 5 ảnh</li>
            </ul>
          </div>

          <Button 
            type="primary" 
            onClick={testApiCall}
            disabled={imageUrls.length === 0}
          >
            Test API Call Data (Check Console)
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default HolidayTourImageUploadTest;
