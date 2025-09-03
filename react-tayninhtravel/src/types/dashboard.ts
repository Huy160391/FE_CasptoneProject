// Dashboard Types for TourCompany

export interface TourCompanyDashboardStatistics {
  companyInfo: CompanyInfoDto;
  revenueMetrics: RevenueMetricsDto;
  bookingMetrics: BookingMetricsDto;
  tourMetrics: TourMetricsDto;
  customerMetrics: CustomerMetricsDto;
  performanceIndicators: PerformanceIndicatorsDto;
  trends: TrendsDto;
}

export interface CompanyInfoDto {
  companyId: string;
  companyName: string;
  period: {
    year: number;
    month?: number;
    periodType: "monthly" | "yearly";
  };
}

export interface RevenueMetricsDto {
  // New fields for pre-tax and after-tax revenue
  totalRevenueBeforeTax: number;
  totalRevenueAfterTax: number;
  previousPeriodRevenueBeforeTax: number;
  previousPeriodRevenueAfterTax: number;
  revenueBeforeTaxGrowth: number;

  // Legacy fields for backward compatibility
  totalRevenue: number;
  previousPeriodRevenue: number;
  revenueGrowth: number;
  averageRevenuePerBooking: number;
  projectedRevenue: number;

  // Additional fields
  totalVAT: number;
  totalPlatformCommission: number;
}

export interface BookingMetricsDto {
  totalBookings: number;
  successfulBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  cancellationRate: number;
  bookingGrowth: number;
  averageBookingValue: number;
}

export interface TourMetricsDto {
  activeTours: number;
  totalToursCreated: number;
  cancelledTours: number;
  pendingTours: number;
  averageOccupancyRate: number;
  mostPopularTourId: string;
  mostPopularTourName: string;
  averageRating: number;
}

export interface CustomerMetricsDto {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  averageGroupSize: number;
}

export interface PerformanceIndicatorsDto {
  onTimeCompletionRate: number;
  customerSatisfactionScore: number;
  guideRating: number;
  incidentRate: number;
}

export interface TrendsDto {
  dailyBookings: DailyBookingDto[];
  weeklyRevenue: WeeklyRevenueDto[];
}

export interface DailyBookingDto {
  date: string;
  bookings: number;
  revenue: number;
}

export interface WeeklyRevenueDto {
  week: string;
  revenue: number;
  bookings: number;
}

// Detailed Analytics Types
export interface TourCompanyDetailedAnalytics {
  analyticsInfo: AnalyticsInfoDto;
  revenueAnalytics: RevenueAnalyticsDto;
  bookingAnalytics: BookingAnalyticsDto;
  customerAnalytics: CustomerAnalyticsDto;
  performanceAnalytics: PerformanceAnalyticsDto;
  competitiveAnalysis: CompetitiveAnalysisDto;
  forecasting: ForecastingDto;
}

export interface AnalyticsInfoDto {
  companyId: string;
  period: AnalyticsPeriodDto;
}

export interface AnalyticsPeriodDto {
  year: number;
  month?: number;
  tourId?: string;
  analyticsType: string;
  granularity: string;
}

export interface RevenueAnalyticsDto {
  revenueBreakdown: RevenueBreakdownDto;
  profitabilityAnalysis: ProfitabilityAnalysisDto;
}

export interface RevenueBreakdownDto {
  tourRevenue: TourRevenueDto[];
  monthlyRevenue: MonthlyRevenueDto[];
  revenueBySource: RevenueBySourceDto;
}

export interface RevenueBySourceDto {
  directBooking: number;
  partnerBooking: number;
  walkInBooking: number;
}

export interface TourRevenueDto {
  tourId: string;
  tourName: string;
  revenue: number;
  bookings: number;
  averagePrice: number;
  revenueShare: number;
}

export interface MonthlyRevenueDto {
  month: string;
  revenue: number;
  bookings: number;
  growth: number;
}

export interface ProfitabilityAnalysisDto {
  grossRevenue: number;
  operatingCosts: number;
  grossProfit: number;
  profitMargin: number;
  costPerBooking: number;
}

export interface BookingAnalyticsDto {
  bookingPatterns: BookingPatternsDto;
  conversionMetrics: ConversionMetricsDto;
  advanceBookingAnalysis: AdvanceBookingAnalysisDto;
}

export interface BookingPatternsDto {
  peakDays: string[];
  peakHours: string[];
  seasonalTrends: SeasonalTrendDto[];
}

export interface SeasonalTrendDto {
  season: string;
  months: string[];
  bookingIncrease: number;
}

export interface ConversionMetricsDto {
  inquiryToBookingRate: number;
  bookingToCompletionRate: number;
  cancellationReasons: CancellationReasonDto[];
}

export interface CancellationReasonDto {
  reason: string;
  percentage: number;
}

export interface AdvanceBookingAnalysisDto {
  averageAdvanceBookingDays: number;
  lastMinuteBookings: number;
  earlyBirdBookings: number;
}

export interface CustomerAnalyticsDto {
  demographics: DemographicsDto;
  loyaltyMetrics: LoyaltyMetricsDto;
}

export interface DemographicsDto {
  ageGroups: AgeGroupDto[];
  customerOrigin: CustomerOriginDto[];
  groupTypes: GroupTypesDto;
}

export interface GroupTypesDto {
  family: number;
  friends: number;
  couple: number;
  solo: number;
}

export interface AgeGroupDto {
  ageRange: string;
  percentage: number;
  averageSpending: number;
}

export interface CustomerOriginDto {
  location: string;
  percentage: number;
  bookings: number;
}

export interface LoyaltyMetricsDto {
  repeatCustomerRate: number;
  averageCustomerLifetimeValue: number;
  referralRate: number;
  topCustomers: TopCustomerDto[];
}

export interface TopCustomerDto {
  customerId: string;
  totalBookings: number;
  totalSpent: number;
}

export interface PerformanceAnalyticsDto {
  operationalMetrics: OperationalMetricsDto;
  qualityMetrics: QualityMetricsDto;
}

export interface OperationalMetricsDto {
  tourCompletionRate: number;
  onTimeStartRate: number;
  guidePerformance: GuidePerformanceDto[];
}

export interface GuidePerformanceDto {
  guideId: string;
  guideName: string;
  toursCompleted: number;
  averageRating: number;
  customerFeedbackScore: number;
}

export interface QualityMetricsDto {
  averageRating: number;
  ratingDistribution: {
    "5star": number;
    "4star": number;
    "3star": number;
    "2star": number;
    "1star": number;
  };
  commonComplaints: ComplaintDto[];
  improvementAreas: string[];
}

export interface ComplaintDto {
  issue: string;
  frequency: number;
}

export interface CompetitiveAnalysisDto {
  marketPosition: MarketPositionDto;
  benchmarking: BenchmarkingDto;
}

export interface MarketPositionDto {
  marketShare: number;
  rankingInCategory: number;
  pricePositioning: string;
  uniqueSellingPoints: string[];
}

export interface BenchmarkingDto {
  industryAverageRating: number;
  industryAverageCancellationRate: number;
  industryAveragePrice: number;
}

export interface ForecastingDto {
  nextMonthPrediction: NextMonthPredictionDto;
  seasonalForecast: SeasonalForecastDto[];
  recommendations: string[];
}

export interface NextMonthPredictionDto {
  expectedBookings: number;
  expectedRevenue: number;
  confidence: number;
}

export interface SeasonalForecastDto {
  month: string;
  predictedBookings: number;
  predictedRevenue: number;
}

// API Request/Response Types
export interface DashboardStatisticsParams {
  year?: number;
  month?: number;
  compareWithPrevious?: boolean;
}

export interface DetailedAnalyticsParams {
  year?: number;
  month?: number;
  tourId?: string;
  analyticsType?:
    | "overview"
    | "revenue"
    | "bookings"
    | "customers"
    | "performance";
  granularity?: "daily" | "weekly" | "monthly";
}
