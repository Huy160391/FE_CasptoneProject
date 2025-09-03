import React, { useState } from "react";
import { Button, Card, Space, Typography, DatePicker, Alert } from "antd";
import { Dayjs } from "dayjs";

const { Title, Text, Paragraph } = Typography;

const HolidayTourDateTest: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [formattedResult, setFormattedResult] = useState<string>("");

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
    if (date) {
      // Backend chỉ cần DateOnly format
      const formatted = date.format("YYYY-MM-DD");
      setFormattedResult(formatted);
    } else {
      setFormattedResult("");
    }
  };

  const testCurrentLogic = () => {
    if (selectedDate) {
      const testData = {
        title: "Test Holiday Tour",
        startLocation: "TP.HCM",
        endLocation: "Tây Ninh",
        templateType: "FreeScenic",
        tourDate: formattedResult,
        images: []
      };
      
      console.log("Test request data:", JSON.stringify(testData, null, 2));
      alert("Check console for formatted request data");
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Card>
        <Title level={2}>Holiday Tour Date Format Test</Title>
        <Paragraph>
          Test để kiểm tra format date cho Holiday Tour API.
          Backend cần format: <code>YYYY-MM-DD</code> (DateOnly)
        </Paragraph>
        
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Text strong>Chọn ngày:</Text>
            <br />
            <DatePicker
              style={{ width: "100%", marginTop: 8 }}
              placeholder="Chọn ngày cho Holiday Tour"
              onChange={handleDateChange}
              format="DD/MM/YYYY"
            />
          </div>

          {selectedDate && (
            <Alert
              message="Kết quả format"
              description={
                <div>
                  <p><strong>Ngày đã chọn:</strong> {selectedDate.format("DD/MM/YYYY")}</p>
                  <p><strong>Format gửi backend (DateOnly):</strong></p>
                  <code style={{ 
                    background: "#f5f5f5", 
                    padding: "4px 8px", 
                    borderRadius: "4px",
                    display: "block",
                    marginTop: "8px",
                    wordBreak: "break-all"
                  }}>
                    {formattedResult}
                  </code>
                </div>
              }
              type="info"
              style={{ marginTop: 16 }}
            />
          )}

          <div>
            <Title level={4}>So sánh format:</Title>
            <ul>
              <li><strong>Cũ (lỗi):</strong> <code>"2025-11-02T07:00:00.000+07:00"</code> (DateTime)</li>
              <li><strong>Mới (đúng):</strong> <code>"{formattedResult || "2025-11-02"}"</code> (DateOnly)</li>
            </ul>
          </div>

          <Button 
            type="primary" 
            onClick={testCurrentLogic}
            disabled={!selectedDate}
          >
            Test Request Data (Check Console)
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default HolidayTourDateTest;
