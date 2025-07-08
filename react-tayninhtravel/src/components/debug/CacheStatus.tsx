import React from 'react';
import { Card, Tag, Space, Typography, Descriptions, Button } from 'antd';
import { ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTourTemplateStore } from '../../store/useTourTemplateStore';

const { Text } = Typography;

const CacheStatus: React.FC = () => {
  const {
    templatesCache,
    shopsCache,
    guidesCache,
    templatesLoading,
    shopsLoading,
    guidesLoading,
    clearCache,
    cacheTimeout
  } = useTourTemplateStore();

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  const getCacheAge = (timestamp: number) => {
    const ageMs = Date.now() - timestamp;
    const ageMinutes = Math.floor(ageMs / (1000 * 60));
    const ageSeconds = Math.floor((ageMs % (1000 * 60)) / 1000);
    
    if (ageMinutes > 0) {
      return `${ageMinutes}m ${ageSeconds}s`;
    }
    return `${ageSeconds}s`;
  };

  const isCacheExpired = (timestamp: number) => {
    return Date.now() - timestamp > cacheTimeout;
  };

  const getCacheStatus = (cache: any, loading: boolean) => {
    if (loading) {
      return <Tag color="blue">Loading...</Tag>;
    }
    if (!cache) {
      return <Tag color="red">No Cache</Tag>;
    }
    if (isCacheExpired(cache.timestamp)) {
      return <Tag color="orange">Expired</Tag>;
    }
    return <Tag color="green">Fresh</Tag>;
  };

  return (
    <Card 
      title="Cache Status" 
      size="small"
      extra={
        <Space>
          <Button 
            size="small" 
            icon={<DeleteOutlined />} 
            onClick={clearCache}
            danger
          >
            Clear All
          </Button>
        </Space>
      }
    >
      <Descriptions column={1} size="small">
        <Descriptions.Item label="Templates">
          <Space>
            {getCacheStatus(templatesCache, templatesLoading)}
            {templatesCache && (
              <Text type="secondary">
                {templatesCache.data.length} items, 
                cached {getCacheAge(templatesCache.timestamp)} ago
              </Text>
            )}
          </Space>
        </Descriptions.Item>
        
        <Descriptions.Item label="Shops">
          <Space>
            {getCacheStatus(shopsCache, shopsLoading)}
            {shopsCache && (
              <Text type="secondary">
                {shopsCache.data.length} items, 
                cached {getCacheAge(shopsCache.timestamp)} ago
              </Text>
            )}
          </Space>
        </Descriptions.Item>
        
        <Descriptions.Item label="Guides">
          <Space>
            {getCacheStatus(guidesCache, guidesLoading)}
            {guidesCache && (
              <Text type="secondary">
                {guidesCache.data.length} items, 
                cached {getCacheAge(guidesCache.timestamp)} ago
              </Text>
            )}
          </Space>
        </Descriptions.Item>
        
        <Descriptions.Item label="Cache Timeout">
          <Text type="secondary">
            {Math.floor(cacheTimeout / (1000 * 60))} minutes
          </Text>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default CacheStatus;
