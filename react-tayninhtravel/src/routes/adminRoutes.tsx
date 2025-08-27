import { AdminWithdrawalManagement } from "@/components/admin";
import AdminRevenueDashboard from "@/pages/admin/AdminRevenueDashboard";
import Blogs from "@/pages/admin/Blogs";
import CVManagement from "@/pages/admin/CVManagement";
import Dashboard from "@/pages/admin/Dashboard";
import Orders from "@/pages/admin/Orders";
import ShopManagement from "@/pages/admin/ShopManagement";
import ShopRegistrationManagement from "@/pages/admin/ShopRegistrationManagement";
import SupportTickets from "@/pages/admin/SupportTickets";
import TourGuideManagement from "@/pages/admin/TourGuideManagement";
import TourStatusManagement from "@/pages/admin/TourStatusManagement";
import Tours from "@/pages/admin/Tours";
import UserManagement from "@/pages/admin/UserManagement";
import VoucherManagement from "@/pages/admin/VoucherManagement";
import TourCompanyManagement from '@/pages/admin/TourCompanyManagement';
import { RouteObject } from "react-router-dom";

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
      {
        path: "tour-guides",
        element: <TourGuideManagement />,
      },
      {
        path: "CVManagement",
        element: <CVManagement />,
      },
      {
        path: "shops",
        element: <ShopManagement />,
      },
      {
        path: "shop-registrations",
        element: <ShopRegistrationManagement />,
      },
      {
        path: "withdrawal-requests",
        element: <AdminWithdrawalManagement />,
      },
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "vouchers",
        element: <VoucherManagement />,
      },
      {
        path: "tours",
        element: <Tours />,
      },
      {
        path: "tour-companies",
        element: <TourCompanyManagement />,
      },
      {
        path: "blogs",
        element: <Blogs />,
      },
      {
        path: "support-tickets",
        element: <SupportTickets />,
      },
      {
        path: "revenue-dashboard",
        element: <AdminRevenueDashboard />,
      },
      {
        path: "tour-status-management",
        element: <TourStatusManagement />,
      },
    ],
  },
];
