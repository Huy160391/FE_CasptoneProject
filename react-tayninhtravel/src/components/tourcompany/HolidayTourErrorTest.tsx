import React, { useState } from "react";
import { Button, Card, Space, Typography, message } from "antd";
import { createHolidayTourTemplateEnhanced } from "../../services/tourcompanyService";
import { TourTemplateType } from "../../types/tour";
import HolidayTourErrorDisplay from "./HolidayTourErrorDisplay";

const { Title, Text } = Typography;

const HolidayTourErrorTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState({
    validationErrors: [] as string[],
    fieldErrors: {} as Record<string, string[]>,
    showDetails: false,
  });

  const testInvalidDate = async () => {
    setLoading(true);
    try {
      const response = await createHolidayTourTemplateEnhanced({
        title: "Test Tour",
        templateType: TourTemplateType.FreeScenic,
        startLocation: "TP.HCM",
        endLocation: "Tây Ninh",
        tourDate: "2025-01-05", // This should trigger 30-day rule error
        images: [],
      }, "test-token");

      if (!response.success) {
        setErrorState({
          validationErrors: response.validationErrors || [],
          fieldErrors: response.fieldErrors || {},
          showDetails: true,
        });
        message.error("Test completed - Check error display below");
      } else {
        message.success("Unexpected success - this should have failed");
      }
    } catch (error) {
      console.error("Test error:", error);
      message.error("Test failed with exception");
    } finally {
      setLoading(false);
    }
  };

  const testEmptyFields = async () => {
    setLoading(true);
    try {
      const response = await createHolidayTourTemplateEnhanced({
        title: "", // Empty title should trigger validation error
        templateType: TourTemplateType.FreeScenic,
        startLocation: "",
        endLocation: "",
        tourDate: "2025-03-15",
        images: [],
      }, "test-token");

      if (!response.success) {
        setErrorState({
          validationErrors: response.validationErrors || [],
          fieldErrors: response.fieldErrors || {},
          showDetails: true,
        });
        message.error("Test completed - Check error display below");
      } else {
        message.success("Unexpected success - this should have failed");
      }
    } catch (error) {
      console.error("Test error:", error);
      message.error("Test failed with exception");
    } finally {
      setLoading(false);
    }
  };

  const clearErrors = () => {
    setErrorState({
      validationErrors: [],
      fieldErrors: {},
      showDetails: false,
    });
  };

  const toggleDetails = () => {
    setErrorState(prev => ({
      ...prev,
      showDetails: !prev.showDetails,
    }));
  };

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Card>
        <Title level={2}>Holiday Tour Error Handling Test</Title>
        <Text>
          This component tests the error handling functionality without requiring a full form.
        </Text>
        
        <div style={{ margin: "24px 0" }}>
          <Space>
            <Button 
              type="primary" 
              onClick={testInvalidDate}
              loading={loading}
            >
              Test Invalid Date (30-day rule)
            </Button>
            <Button 
              onClick={testEmptyFields}
              loading={loading}
            >
              Test Empty Fields
            </Button>
            <Button onClick={clearErrors}>
              Clear Errors
            </Button>
          </Space>
        </div>

        <HolidayTourErrorDisplay
          validationErrors={errorState.validationErrors}
          fieldErrors={errorState.fieldErrors}
          showDetails={errorState.showDetails}
          onToggleDetails={toggleDetails}
          onDismiss={clearErrors}
        />
      </Card>
    </div>
  );
};

export default HolidayTourErrorTest;
