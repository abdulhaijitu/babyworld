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
import AdminFoodSales from "./pages/admin/AdminFoodSales";
import AdminEmployees from "./pages/admin/AdminEmployees";

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
                  <Route path="food" element={<AdminFoodSales />} />
                  <Route path="employees" element={<AdminEmployees />} />
                  <Route path="bookings" element={<div className="p-8"><h1 className="text-2xl font-bold">Bookings</h1><p className="text-muted-foreground mt-2">Coming soon...</p></div>} />
                  <Route path="events" element={<div className="p-8"><h1 className="text-2xl font-bold">Events</h1><p className="text-muted-foreground mt-2">Coming soon...</p></div>} />
                  <Route path="settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground mt-2">Coming soon...</p></div>} />
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
