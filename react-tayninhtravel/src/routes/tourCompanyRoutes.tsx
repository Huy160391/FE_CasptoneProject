import IncidentManagement from "@/pages/tourcompany/IncidentManagement";
import RevenueDashboard from "@/pages/tourcompany/RevenueDashboard";
import ReviewHistory from "@/pages/tourcompany/ReviewHistory";
import TourCompanyDashboard from "@/pages/tourcompany/TourCompanyDashboard";
import TourCompanyProfile from "@/pages/tourcompany/TourCompanyProfile";
import TourCompanyWalletManagement from "@/pages/tourcompany/TourCompanyWalletManagement";
import TourDetailsManagement from "@/pages/tourcompany/TourDetailsManagement";
import TourManagement from "@/pages/tourcompany/TourManagement";
import TourTemplateManagement from "@/pages/tourcompany/TourTemplateManagement";
import TransactionHistory from "@/pages/tourcompany/TransactionHistory";
import DetailedAnalytics from "@/pages/tourcompany/DetailedAnalytics";
import { RouteObject } from "react-router-dom";

export const tourCompanyRoutes: RouteObject[] = [
  {
    path: "",
    children: [
      {
        path: "dashboard",
        element: <TourCompanyDashboard />,
      },
      {
        path: "tour-templates",
        element: <TourTemplateManagement />,
      },
      {
        path: "tours",
        element: <TourDetailsManagement />,
      },
      {
        path: "tours-old",
        element: <TourManagement />,
      },
      {
        path: "transactions",
        element: <TransactionHistory />,
      },
      {
        path: "reviews",
        element: <ReviewHistory />,
      },
      {
        path: "revenue",
        element: <RevenueDashboard />,
      },
      {
        path: "analytics",
        element: <DetailedAnalytics />,
      },
      {
        path: "wallet",
        element: <TourCompanyWalletManagement />,
      },
      {
        path: "incidents",
        element: <IncidentManagement />,
      },
      {
        path: "profile",
        element: <TourCompanyProfile />,
      },
    ],
  },
];
