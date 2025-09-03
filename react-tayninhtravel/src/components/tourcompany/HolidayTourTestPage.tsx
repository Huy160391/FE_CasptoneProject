import React, { useState } from "react";
import { Button, Card, Space, Typography, Divider } from "antd";
import HolidayTourForm from "./HolidayTourForm";

const { Title, Text } = Typography;

const HolidayTourTestPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    console.log("Holiday Tour created successfully!");
    setShowForm(false);
  };

  const handleCancel = () => {
    console.log("Holiday Tour form cancelled");
    setShowForm(false);
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card>
        <Title level={2}>Holiday Tour Error Handling Test</Title>
        <Text>
          This page is for testing the enhanced error handling for Holiday Tour creation.
          The form will display detailed validation errors from the backend.
        </Text>
        
        <Divider />
        
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Title level={4}>Test Scenarios:</Title>
            <ul>
              <li><strong>Invalid Date:</strong> Try selecting a date less than 30 days from today</li>
              <li><strong>Empty Fields:</strong> Submit form with empty required fields</li>
              <li><strong>Invalid Title:</strong> Enter a title with less than 5 characters</li>
              <li><strong>Future Date Limit:</strong> Try selecting a date more than 2 years in the future</li>
            </ul>
          </div>
          
          <div>
            <Title level={4}>Expected Error Handling:</Title>
            <ul>
              <li>Field-specific errors should appear on individual form fields</li>
              <li>General validation errors should be displayed in a categorized error panel</li>
              <li>Date validation should show helpful guidance messages</li>
              <li>Error panel should be collapsible and dismissible</li>
            </ul>
          </div>
          
          <Button 
            type="primary" 
            size="large"
            onClick={() => setShowForm(true)}
          >
            Open Holiday Tour Form
          </Button>
        </Space>
      </Card>

      <HolidayTourForm
        visible={showForm}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default HolidayTourTestPage;
