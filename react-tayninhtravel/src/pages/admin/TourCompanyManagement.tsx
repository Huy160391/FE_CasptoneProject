import { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Input,
    Space,
    message,
    Avatar
} from 'antd';
import {
    SearchOutlined,
    EyeOutlined,
    UserOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { adminService } from '@/services/adminService';
import './ShopManagement.scss'; // Reuse shop management styles
import CompanyModal from './CompanyModal';
import './CompanyModal.scss';

interface TourCompany {
    id: string;
    userId: string;
    companyName: string;
    wallet: number;
    revenueHold: number;
    description?: string | null;
    address?: string | null;
    website?: string | null;
    businessLicense?: string | null;
    isActive: boolean;
    email: string;
    fullName: string;
    phoneNumber: string;
    logoUrl?: string;
    rating?: number;
    createdAt?: string;
    updatedAt?: string;
    tourCount?: number;
}

const TourCompanyManagement = () => {
    const [companies, setCompanies] = useState<TourCompany[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalCompany, setModalCompany] = useState<TourCompany | null>(null);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [modalEdit, setModalEdit] = useState(false);

    useEffect(() => {
        const fetchCompanies = async () => {
            setLoading(true);
            try {
                const res = await adminService.getTourCompanies({ pageIndex, pageSize, textSearch: search });
                setCompanies(res.data || []);
                setTotalCount(res.totalCount || res.totalRecord || 0);
            } catch (err) {
                message.error('Không thể tải danh sách công ty du lịch');
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, [pageIndex, pageSize, search]);

    const columns: ColumnsType<TourCompany> = [
        {
            title: 'Tên công ty',
            dataIndex: 'companyName',
            key: 'companyName',
            render: (text, record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} src={record.logoUrl} />
                    <span>{text}</span>
                </Space>
            ),
        },
        {
            title: 'Đại diện',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Giấy phép',
            dataIndex: 'businessLicense',
            key: 'businessLicense',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'status',
            align: 'center',
            render: (isActive: boolean) => (
                <span style={{ color: isActive ? '#52c41a' : '#faad14', fontWeight: 500 }}>
                    {isActive ? 'Hoạt động' : 'Tạm dừng'}
                </span>
            ),
            filters: [
                { text: 'Hoạt động', value: true },
                { text: 'Tạm dừng', value: false },
            ],
            onFilter: (value, record) => record.isActive === value,
        },
        {
            title: 'Số tour công khai',
            dataIndex: 'publicTour',
            key: 'publicTour',
            align: 'center',
            render: (count?: number) => <span>{count ?? 0}</span>,
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} size="small" onClick={() => { setModalCompany(record); setModalOpen(true); setModalEdit(false); }}>Xem</Button>
                    {/* <Button icon={<EditOutlined />} size="small" onClick={() => { setModalCompany(record); setModalOpen(true); setModalEdit(true); }}>Sửa</Button> */}
                </Space>
            ),
        },
    ];

    return (
        <div className="company-management-page">
            <div className="header-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Danh sách công ty</h1>
                <Input
                    placeholder="Tìm kiếm tên công ty, đại diện..."
                    prefix={<SearchOutlined />}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: 250, marginLeft: 'auto' }}
                    allowClear
                    value={search}
                />
            </div>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={companies}
                loading={loading}
                pagination={{
                    pageSize,
                    current: pageIndex + 1,
                    total: totalCount,
                    showSizeChanger: true,
                    onChange: (page, size) => {
                        setPageIndex(page - 1);
                        setPageSize(size);
                    },
                }}
                className="companies-table"
                onRow={record => ({
                    onClick: () => setModalCompany(record)
                })}
            />

            <CompanyModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                company={modalCompany}
                isEdit={modalEdit}
                onEdit={updated => {
                    setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));
                    setModalCompany(updated);
                    setModalEdit(false);
                }}
            />
        </div>
    );
}


export default TourCompanyManagement;
