import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/admin/PermissionGuard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";

import Index from "./pages/Index";
import PlayBooking from "./pages/PlayBooking";
import BirthdayEvents from "./pages/BirthdayEvents";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import AdminLogin from "./pages/AdminLogin";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import NotFound from "./pages/NotFound";

// Admin pages with layout
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboardContent from "./pages/admin/AdminDashboardContent";
import AdminTicketing from "./pages/admin/AdminTicketing";
import AdminCreateTicket from "./pages/admin/AdminCreateTicket";
import AdminGateLogs from "./pages/admin/AdminGateLogs";
import AdminFoodSales from "./pages/admin/AdminFoodSales";
import AdminFoodOrders from "./pages/admin/AdminFoodOrders";
import AdminEmployees from "./pages/admin/AdminEmployees";
import AdminRoster from "./pages/admin/AdminRoster";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminLeaveManagement from "./pages/admin/AdminLeaveManagement";
import AdminPayroll from "./pages/admin/AdminPayroll";
import AdminPerformance from "./pages/admin/AdminPerformance";

import AdminEventPackages from "./pages/admin/AdminEventPackages";
import AdminEventCalendar from "./pages/admin/AdminEventCalendar";
import AdminSettings from "./pages/admin/AdminSettings";
import SettingsGeneral from "./pages/admin/settings/SettingsGeneral";
import SettingsBusiness from "./pages/admin/settings/SettingsBusiness";
import SettingsPricing from "./pages/admin/settings/SettingsPricing";
import SettingsNotifications from "./pages/admin/settings/SettingsNotifications";
import SettingsEmail from "./pages/admin/settings/SettingsEmail";
import SettingsSms from "./pages/admin/settings/SettingsSms";
import SettingsPayment from "./pages/admin/settings/SettingsPayment";
import AdminReports from "./pages/admin/AdminReports";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminMemberships from "./pages/admin/AdminMemberships";
import AdminMemberEntry from "./pages/admin/AdminMemberEntry";
import AdminMembershipPackages from "./pages/admin/AdminMembershipPackages";
import AdminExpenses from "./pages/admin/AdminExpenses";
import AdminExpenseCategories from "./pages/admin/AdminExpenseCategories";
import AdminDailyCashSummary from "./pages/admin/AdminDailyCashSummary";
import AdminProfitReports from "./pages/admin/AdminProfitReports";
import AdminRides from "./pages/admin/AdminRides";

import AdminNotificationLogs from "./pages/admin/AdminNotificationLogs";
import AdminHeroCards from "./pages/admin/AdminHeroCards";
import AdminHeroSlides from "./pages/admin/AdminHeroSlides";
import AdminHomepage from "./pages/admin/AdminHomepage";
import AdminAboutContact from "./pages/admin/AdminAboutContact";
import AdminSeoBranding from "./pages/admin/AdminSeoBranding";
import AdminFoodPOS from "./pages/admin/AdminFoodPOS";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminSmsCampaigns from "./pages/admin/AdminSmsCampaigns";
import AdminSocialMedia from "./pages/admin/AdminSocialMedia";
import AdminIncome from "./pages/admin/AdminIncome";
import AdminIncomeCategories from "./pages/admin/AdminIncomeCategories";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/play-booking" element={<PlayBooking />} />
                <Route path="/birthday-events" element={<BirthdayEvents />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                
                {/* Admin routes with sidebar layout */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardContent />} />
                  <Route path="create-ticket" element={<PermissionGuard module="ticketing"><AdminCreateTicket /></PermissionGuard>} />
                  <Route path="ticket-list" element={<PermissionGuard module="ticketing"><AdminTicketing /></PermissionGuard>} />
                  <Route path="membership-packages" element={<PermissionGuard module="membership"><AdminMembershipPackages /></PermissionGuard>} />
                  <Route path="memberships" element={<PermissionGuard module="membership"><AdminMemberships /></PermissionGuard>} />
                  <Route path="member-entry" element={<PermissionGuard module="membership"><AdminMemberEntry /></PermissionGuard>} />
                  <Route path="gate-logs" element={<PermissionGuard module="ticketing"><AdminGateLogs /></PermissionGuard>} />
                  <Route path="food" element={<PermissionGuard module="foods"><AdminFoodSales /></PermissionGuard>} />
                  <Route path="food-orders" element={<PermissionGuard module="foods"><AdminFoodOrders /></PermissionGuard>} />
                  <Route path="food-pos" element={<PermissionGuard module="foods"><AdminFoodPOS /></PermissionGuard>} />
                  <Route path="coupons" element={<PermissionGuard module="foods"><AdminCoupons /></PermissionGuard>} />
                  <Route path="employees" element={<PermissionGuard module="hr"><AdminEmployees /></PermissionGuard>} />
                  <Route path="roster" element={<PermissionGuard module="hr"><AdminRoster /></PermissionGuard>} />
                  <Route path="attendance" element={<PermissionGuard module="hr"><AdminAttendance /></PermissionGuard>} />
                  <Route path="leaves" element={<PermissionGuard module="hr"><AdminLeaveManagement /></PermissionGuard>} />
                  <Route path="payroll" element={<PermissionGuard module="hr"><AdminPayroll /></PermissionGuard>} />
                  <Route path="performance" element={<PermissionGuard module="hr"><AdminPerformance /></PermissionGuard>} />
                  <Route path="bookings" element={<PermissionGuard module="bookings"><AdminBookings /></PermissionGuard>} />
                  <Route path="events" element={<PermissionGuard module="events"><AdminEvents /></PermissionGuard>} />
                  <Route path="event-packages" element={<PermissionGuard module="events"><AdminEventPackages /></PermissionGuard>} />
                  <Route path="event-calendar" element={<PermissionGuard module="events"><AdminEventCalendar /></PermissionGuard>} />
                  <Route path="leads" element={<PermissionGuard module="marketing"><AdminLeads /></PermissionGuard>} />
                  <Route path="promotions" element={<PermissionGuard module="marketing"><AdminPromotions /></PermissionGuard>} />
                  <Route path="sms-campaigns" element={<PermissionGuard module="marketing"><AdminSmsCampaigns /></PermissionGuard>} />
                  <Route path="social-media" element={<PermissionGuard module="marketing"><AdminSocialMedia /></PermissionGuard>} />
                  <Route path="reports" element={<PermissionGuard module="reports"><AdminReports /></PermissionGuard>} />
                  <Route path="profit" element={<PermissionGuard module="accounts"><AdminProfitReports /></PermissionGuard>} />
                  <Route path="expenses" element={<PermissionGuard module="accounts"><AdminExpenses /></PermissionGuard>} />
                  <Route path="expense-categories" element={<PermissionGuard module="accounts"><AdminExpenseCategories /></PermissionGuard>} />
                  <Route path="income" element={<PermissionGuard module="accounts"><AdminIncome /></PermissionGuard>} />
                  <Route path="income-categories" element={<PermissionGuard module="accounts"><AdminIncomeCategories /></PermissionGuard>} />
                  <Route path="daily-cash" element={<PermissionGuard module="accounts"><AdminDailyCashSummary /></PermissionGuard>} />
                  <Route path="rides" element={<PermissionGuard module="ticketing"><AdminRides /></PermissionGuard>} />
                  <Route path="notifications" element={<PermissionGuard module="notifications"><AdminNotificationLogs /></PermissionGuard>} />
                  <Route path="homepage" element={<PermissionGuard module="website"><AdminHomepage /></PermissionGuard>} />
                  <Route path="about-contact" element={<PermissionGuard module="website"><AdminAboutContact /></PermissionGuard>} />
                  <Route path="seo-branding" element={<PermissionGuard module="website"><AdminSeoBranding /></PermissionGuard>} />
                  <Route path="users" element={<PermissionGuard module="user-management" superAdminOnly><AdminUsers /></PermissionGuard>} />
                  <Route path="roles" element={<PermissionGuard module="role-permission" superAdminOnly><AdminRoles /></PermissionGuard>} />
                  <Route path="settings" element={<PermissionGuard module="settings"><AdminSettings /></PermissionGuard>} />
                  <Route path="settings/general" element={<PermissionGuard module="settings"><SettingsGeneral /></PermissionGuard>} />
                  <Route path="settings/business" element={<PermissionGuard module="settings"><SettingsBusiness /></PermissionGuard>} />
                  <Route path="settings/pricing" element={<PermissionGuard module="settings"><SettingsPricing /></PermissionGuard>} />
                  <Route path="settings/notifications" element={<PermissionGuard module="settings"><SettingsNotifications /></PermissionGuard>} />
                  <Route path="settings/email" element={<PermissionGuard module="settings"><SettingsEmail /></PermissionGuard>} />
                  <Route path="settings/sms" element={<PermissionGuard module="settings"><SettingsSms /></PermissionGuard>} />
                  <Route path="settings/payment" element={<PermissionGuard module="settings"><SettingsPayment /></PermissionGuard>} />
                </Route>
                
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancel" element={<PaymentCancel />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
