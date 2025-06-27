import { useState, useEffect } from 'react';
import { Card, Tabs } from 'antd';
import { UserOutlined, HistoryOutlined, ShoppingOutlined, CommentOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { userService } from '@/services/userService';
import type { UserSupportTicket } from '@/types/support';
import ProfileInfo from './ProfileInfo';
import BookingHistory from './BookingHistory';
import TransactionHistory from './TransactionHistory';
import CommentHistory from './CommentHistory';
import SupportTicketHistory from './SupportTicketHistory';
import RegisterHistory from './RegisterHistory';
import './Profile.scss';

const Profile = () => {
    const { t } = useTranslation();
    const { user, updateUser } = useAuthStore();
    const [ticketsLoading, setTicketsLoading] = useState(false);
    const [supportTickets, setSupportTickets] = useState<UserSupportTicket[]>([]);

    // Mock data - sẽ được thay thế bằng API call thực tế
    const bookingHistory = [
        {
            id: 1,
            tourName: 'Tour Tây Ninh 1 ngày',
            date: '2024-03-15',
            status: 'completed',
            price: '1,500,000 ₫',
        },
        {
            id: 2,
            tourName: 'Tour Núi Bà Đen',
            date: '2024-03-20',
            status: 'upcoming',
            price: '2,000,000 ₫',
        },
    ];

    const transactionHistory = [
        {
            id: 1,
            type: 'Tour booking',
            amount: '1,500,000 ₫',
            date: '2024-03-15',
            status: 'completed',
        },
        {
            id: 2,
            type: 'Product purchase',
            amount: '850,000 ₫',
            date: '2024-03-18',
            status: 'completed',
        },
    ];

    const commentHistory = [
        {
            id: 1,
            tourName: 'Tour Tây Ninh 1 ngày',
            rating: 5,
            comment: 'Tour rất tuyệt vời, hướng dẫn viên nhiệt tình!',
            date: '2024-03-16',
        },
        {
            id: 2,
            tourName: 'Tour Núi Bà Đen',
            rating: 4,
            comment: 'Cảnh đẹp, giá cả hợp lý.',
            date: '2024-03-21',
        },
    ];

    // Fetch support tickets
    useEffect(() => {
        const fetchSupportTickets = async () => {
            if (!user) return;

            try {
                setTicketsLoading(true);
                const tickets = await userService.getUserSupportTickets();
                setSupportTickets(tickets);
            } catch (error: any) {
                console.error('Error fetching support tickets:', error);
                // Removing error message to avoid "No tickets found" notification
            } finally {
                setTicketsLoading(false);
            }
        };

        fetchSupportTickets();
    }, [user, t]);

    if (!user) {
        return null;
    }

    return (
        <div className="profile-page">
            <div className="container">
                <Card className="profile-card">
                    <Tabs
                        defaultActiveKey="personal"
                        items={[
                            {
                                key: "personal",
                                label: (
                                    <span>
                                        <UserOutlined />
                                        {t('profile.personalInfo')}
                                    </span>
                                ),
                                children: (
                                    <ProfileInfo
                                        user={user}
                                        updateUser={updateUser}
                                    />
                                )
                            },
                            {
                                key: "bookings",
                                label: (
                                    <span>
                                        <HistoryOutlined />
                                        {t('profile.bookingHistory')}
                                    </span>
                                ),
                                children: (
                                    <BookingHistory data={bookingHistory} />
                                )
                            },
                            {
                                key: "transactions",
                                label: (
                                    <span>
                                        <ShoppingOutlined />
                                        {t('profile.transactionHistory')}
                                    </span>
                                ),
                                children: (
                                    <TransactionHistory data={transactionHistory} />
                                )
                            },
                            {
                                key: "comments",
                                label: (
                                    <span>
                                        <CommentOutlined />
                                        {t('profile.commentHistory')}
                                    </span>
                                ),
                                children: (
                                    <CommentHistory data={commentHistory} />
                                )
                            },
                            {
                                key: "support-tickets",
                                label: (
                                    <span>
                                        <QuestionCircleOutlined />
                                        {t('profile.supportTickets')}
                                    </span>
                                ),
                                children: (
                                    <SupportTicketHistory data={supportTickets} loading={ticketsLoading} />
                                )
                            },
                            {
                                key: "register-history",
                                label: (
                                    <span>
                                        <UserOutlined />
                                        {t('profile.registerHistory.title', 'Register History')}
                                    </span>
                                ),
                                children: (
                                    <RegisterHistory />
                                )
                            }
                        ]}
                    />
                </Card>
            </div>
        </div>
    );
};

export default Profile;