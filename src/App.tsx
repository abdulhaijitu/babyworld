import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import AdminReports from "./pages/admin/AdminReports";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminMemberships from "./pages/admin/AdminMemberships";
import AdminMemberEntry from "./pages/admin/AdminMemberEntry";
import AdminMembershipPackages from "./pages/admin/AdminMembershipPackages";
import AdminExpenses from "./pages/admin/AdminExpenses";
import AdminExpenseCategories from "./pages/admin/AdminExpenseCategories";
import AdminProfitReports from "./pages/admin/AdminProfitReports";
import AdminRides from "./pages/admin/AdminRides";
import AdminRideReviews from "./pages/admin/AdminRideReviews";
import AdminNotificationLogs from "./pages/admin/AdminNotificationLogs";
import AdminHeroCards from "./pages/admin/AdminHeroCards";
import AdminHeroSlides from "./pages/admin/AdminHeroSlides";
import AdminHomepage from "./pages/admin/AdminHomepage";
import AdminFoodPOS from "./pages/admin/AdminFoodPOS";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminSmsCampaigns from "./pages/admin/AdminSmsCampaigns";
import AdminSocialMedia from "./pages/admin/AdminSocialMedia";

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
                  <Route path="create-ticket" element={<AdminCreateTicket />} />
                  <Route path="ticket-list" element={<AdminTicketing />} />
                  <Route path="membership-packages" element={<AdminMembershipPackages />} />
                  <Route path="memberships" element={<AdminMemberships />} />
                  <Route path="member-entry" element={<AdminMemberEntry />} />
                  <Route path="gate-logs" element={<AdminGateLogs />} />
                  <Route path="food" element={<AdminFoodSales />} />
                  <Route path="food-orders" element={<AdminFoodOrders />} />
                  <Route path="food-pos" element={<AdminFoodPOS />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="employees" element={<AdminEmployees />} />
                  <Route path="roster" element={<AdminRoster />} />
                  <Route path="attendance" element={<AdminAttendance />} />
                  <Route path="leaves" element={<AdminLeaveManagement />} />
                  <Route path="payroll" element={<AdminPayroll />} />
                  <Route path="performance" element={<AdminPerformance />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="events" element={<AdminEvents />} />
                  
                  <Route path="event-packages" element={<AdminEventPackages />} />
                  <Route path="event-calendar" element={<AdminEventCalendar />} />
                  <Route path="leads" element={<AdminLeads />} />
                  <Route path="promotions" element={<AdminPromotions />} />
                  <Route path="sms-campaigns" element={<AdminSmsCampaigns />} />
                  <Route path="social-media" element={<AdminSocialMedia />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="profit" element={<AdminProfitReports />} />
                  <Route path="expenses" element={<AdminExpenses />} />
                  <Route path="expense-categories" element={<AdminExpenseCategories />} />
                  <Route path="rides" element={<AdminRides />} />
                  <Route path="ride-reviews" element={<AdminRideReviews />} />
                  <Route path="notifications" element={<AdminNotificationLogs />} />
                  <Route path="homepage" element={<AdminHomepage />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="settings" element={<AdminSettings />} />
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
