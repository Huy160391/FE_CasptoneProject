import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    message,
    Tag,
    Card,
    Tabs,
    Dropdown,
    Modal,
    Tooltip
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    RocketOutlined,
    MoreOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import { usePreloadWizardData } from '../../hooks/usePreloadWizardData';
import {
    getTourDetailsList,
    deleteTourDetails,
    getTourTemplates,
    activatePublicTourDetails,
    handleApiError
} from '../../services/tourcompanyService';
import TourDetailsWizard from '../../components/tourcompany/TourDetailsWizard';
import TourDetailsModal from '../../components/tourcompany/TourDetailsModal';
import {
    TourDetails,
    TourTemplate,
    TourDetailsStatus
} from '../../types/tour';
import { mapStringToStatusEnum } from '../../utils/statusMapper';

import {
    getTourDetailsStatusLabel,
    getStatusColor
} from '../../constants/tourTemplate';


const { TabPane } = Tabs;

const TourDetailsManagement: React.FC = () => {
    const { token } = useAuthStore();

    // Preload wizard data when component mounts
    const { isPreloaded, templatesCount, shopsCount, guidesCount } = usePreloadWizardData();

    const [tourDetailsList, setTourDetailsList] = useState<TourDetails[]>([]);

    const [loading, setLoading] = useState(false);
    const [wizardVisible, setWizardVisible] = useState(false);
    const [selectedTourDetailsId, setSelectedTourDetailsId] = useState<string | null>(null);
    const [modalInitialTab, setModalInitialTab] = useState('details');
    const [activeTab, setActiveTab] = useState('tours');


    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Log preload status
    useEffect(() => {
        if (isPreloaded) {
            console.log('✅ Wizard data preloaded:', {
                templates: templatesCount,
                shops: shopsCount,
                guides: guidesCount
            });
        }
    }, [isPreloaded, templatesCount, shopsCount, guidesCount]);

    // Load data
    useEffect(() => {
        checkApiAndLoadData();
    }, []);

    const checkApiAndLoadData = async () => {
        try {
            await loadTourDetailsList();
            await loadTemplates();
        } catch (error) {
            message.error(handleApiError(error));
        }
    };

    const loadTourDetailsList = async (page?: number, size?: number) => {
        try {
            console.log('🔍 Loading TourDetails with token:', token ? 'Present' : 'Missing');
            setLoading(true);
            const pageIndex = (page || currentPage) - 1; // Convert to 0-based index
            const pageSizeToUse = size || pageSize;

            const response = await getTourDetailsList({
                pageIndex,
                pageSize: pageSizeToUse,
                includeInactive: true // Hiển thị tất cả tours bao gồm pending
            }, token ?? undefined);

            console.log('📡 TourDetails response structure:', {
                hasSuccess: 'success' in response,
                hasData: 'data' in response,
                statusCode: response.statusCode || 'N/A',
                dataType: typeof response.data,
                dataIsArray: Array.isArray(response.data)
            });

            console.log('📦 Raw TourDetails response:', response);

            // Backend trả về ResponseGetTourDetailsPaginatedDto
            if (response.success && response.data) {
                console.log('✅ TourDetails loaded successfully:', response.data.length, 'items');
                setTourDetailsList(response.data);
                setTotalCount(response.totalCount || 0);
            } else {
                console.error('❌ API Error:', response.message);
                message.error(response.message || 'Không thể tải danh sách tour details');
            }
        } catch (error) {
            console.error('❌ Load TourDetails Error:', error);
            message.error(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const loadTemplates = async () => {
        try {
            console.log('🔍 Loading templates with token:', token ? 'Present' : 'Missing');
            const response = await getTourTemplates({}, token ?? undefined);
            console.log('📡 Response structure:', {
                hasIsSuccess: 'isSuccess' in response,
                hasData: 'data' in response,
                hasStatusCode: 'statusCode' in response,
                statusCode: response.statusCode,
                dataType: typeof response.data,
                dataIsArray: Array.isArray(response.data)
            });

            // Check multiple possible response formats
            let templateItems: TourTemplate[] = [];

            if (response.statusCode === 200 && response.data) {
                // Format 1: Direct data array
                if (Array.isArray(response.data)) {
                    templateItems = response.data;
                    console.log('✅ Format 1: Direct array, templates:', templateItems.length);
                }
                // Backend should return direct array, but handle legacy formats
                else {
                    console.warn('⚠️ Unexpected response format, trying fallback:', response.data);
                    templateItems = [];
                }

                console.log('✅ Final templates loaded:', templateItems);
            } else {
                console.warn('⚠️ Templates API returned unsuccessful response:', response);
            }
        } catch (error) {
            console.error('❌ Error loading templates:', error);
            message.error(`Lỗi tải templates: ${handleApiError(error)}`);
        }
    };









    const handleWizardSuccess = () => {
        loadTourDetailsList();
    };

    // Pagination handlers
    const handlePageChange = (page: number, size?: number) => {
        setCurrentPage(page);
        if (size && size !== pageSize) {
            setPageSize(size);
        }
        loadTourDetailsList(page, size);
    };

    const handlePageSizeChange = (_current: number, size: number) => {
        setCurrentPage(1); // Reset to first page when changing page size
        setPageSize(size);
        loadTourDetailsList(1, size);
    };



    const handleDelete = async (id: string) => {
        try {
            const response = await deleteTourDetails(id, token ?? undefined);
            if (response.success) {
                message.success('Xóa tour details thành công');
                loadTourDetailsList();
            }
        } catch (error) {
            message.error(handleApiError(error));
        }
    };

    const handleViewDetails = (record: TourDetails) => {
        setSelectedTourDetailsId(record.id);
        setModalInitialTab('details');
        // Don't set detailModalVisible - use TourDetailsModal instead
    };

    const handleCreateOperation = (record: TourDetails) => {
        setSelectedTourDetailsId(record.id);
        setModalInitialTab('operation');
    };





    const handleActivatePublic = async (tourDetailsId: string) => {
        try {
            setLoading(true);
            const response = await activatePublicTourDetails(tourDetailsId, token ?? undefined);

            if (response.success) {
                message.success('Đã kích hoạt public cho TourDetails thành công! Khách hàng có thể booking tour này.');
                loadTourDetailsList(); // Reload để cập nhật status
            } else {
                message.error(response.message || 'Không thể kích hoạt public');
            }
        } catch (error) {
            message.error(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    // Create dropdown menu items for each record
    const getActionMenuItems = (record: TourDetails) => {
        const items = [
            {
                key: 'view',
                icon: <EyeOutlined style={{ color: '#1890ff' }} />,
                label: <span style={{ color: '#1890ff' }}>Xem chi tiết</span>,
                onClick: () => handleViewDetails(record)
            },
            {
                key: 'operation',
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                label: <span style={{ color: '#52c41a' }}>Quản lý vận hành</span>,
                onClick: () => handleCreateOperation(record)
            }
        ];

        // Add "Kích hoạt Public" option if status is WaitToPublic
        const statusEnum = mapStringToStatusEnum(record.status);
        if (statusEnum === TourDetailsStatus.WaitToPublic) {
            items.push({
                key: 'activate',
                icon: <RocketOutlined style={{ color: '#722ed1' }} />,
                label: <span style={{ color: '#722ed1' }}>Kích hoạt Public</span>,
                onClick: () => {
                    // Show confirmation modal
                    Modal.confirm({
                        title: 'Kích hoạt public cho TourDetails này?',
                        content: 'Sau khi kích hoạt, khách hàng có thể booking tour này.',
                        okText: 'Kích hoạt',
                        cancelText: 'Hủy',
                        onOk: () => handleActivatePublic(record.id)
                    });
                }
            });
        }

        // Add delete option with divider

        items.push({
            key: 'delete',
            icon: <DeleteOutlined />,
            label: <span style={{ color: '#ff4d4f' }}>Xóa tour</span>,
            onClick: () => {
                // Show confirmation modal
                Modal.confirm({
                    title: 'Bạn có chắc chắn muốn xóa?',
                    content: 'Hành động này không thể hoàn tác.',
                    okText: 'Có',
                    cancelText: 'Không',
                    okType: 'danger',
                    onOk: () => handleDelete(record.id)
                });
            }
        });

        return items;
    };

    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
        },
        {
            title: 'Template',
            dataIndex: 'tourTemplateName',
            key: 'templateTitle',
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                // Map string status from API to enum
                const statusEnum = mapStringToStatusEnum(status);
                return (
                    <Tag color={getStatusColor(statusEnum)}>
                        {getTourDetailsStatusLabel(statusEnum)}
                    </Tag>
                );
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 80,
            align: 'center' as const,
            render: (_: any, record: TourDetails) => (
                <Dropdown
                    menu={{
                        items: getActionMenuItems(record),
                        style: {
                            minWidth: '180px',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                    arrow={{ pointAtCenter: true }}
                >
                    <Tooltip title="Thao tác" placement="top">
                        <Button
                            type="text"
                            icon={<MoreOutlined style={{ fontSize: '16px' }} />}
                            style={{
                                border: 'none',
                                boxShadow: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: '6px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f0f0f0';
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        />
                    </Tooltip>
                </Dropdown>
            ),
        },
    ];

    return (
        <div>
            <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0 }}>🎯 Tour Management System</h2>
                        <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                            Quản lý tours với TourDetails APIs mới
                        </p>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            console.log('🧙‍♂️ Button clicked - Opening wizard...');
                            console.log('🧙‍♂️ Current wizardVisible state:', wizardVisible);
                            setWizardVisible(true);
                            console.log('🧙‍♂️ setWizardVisible(true) called');
                        }}
                    >
                        Tạo Tour (Wizard)
                    </Button>
                </div>



                <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
                    <TabPane
                        tab={
                            <span>
                                <EyeOutlined />
                                Tours List
                            </span>
                        }
                        key="tours"
                    >
                        <div>

                            <Table
                                columns={columns}
                                dataSource={tourDetailsList}
                                rowKey="id"
                                loading={loading}
                                pagination={{
                                    current: currentPage,
                                    pageSize: pageSize,
                                    total: totalCount,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} tours`,
                                    onChange: handlePageChange,
                                    onShowSizeChange: handlePageSizeChange,
                                    pageSizeOptions: ['10', '20', '50', '100'],
                                }}
                            />
                        </div>
                    </TabPane>

                </Tabs>
            </Card>






            {/* Tour Details Wizard */}
            <TourDetailsWizard
                visible={wizardVisible}
                onCancel={() => setWizardVisible(false)}
                onSuccess={handleWizardSuccess}
            />

            <TourDetailsModal
                visible={!!selectedTourDetailsId}
                tourDetailsId={selectedTourDetailsId}
                initialTab={modalInitialTab}
                onClose={() => {
                    setSelectedTourDetailsId(null);
                    setModalInitialTab('details');
                }}
                onUpdate={loadTourDetailsList}
            />
        </div>
    );
};

export default TourDetailsManagement;
