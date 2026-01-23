import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
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
import AdminGateLogs from "./pages/admin/AdminGateLogs";
import AdminFoodSales from "./pages/admin/AdminFoodSales";
import AdminEmployees from "./pages/admin/AdminEmployees";
import AdminRoster from "./pages/admin/AdminRoster";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminReports from "./pages/admin/AdminReports";
import AdminUsers from "./pages/admin/AdminUsers";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
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
                  <Route path="ticketing" element={<AdminTicketing />} />
                  <Route path="gate-logs" element={<AdminGateLogs />} />
                  <Route path="food" element={<AdminFoodSales />} />
                  <Route path="employees" element={<AdminEmployees />} />
                  <Route path="roster" element={<AdminRoster />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="events" element={<AdminEvents />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancel" element={<PaymentCancel />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
