import { Navbar } from "@/components/Navbar";
import { PricingSection } from "@/components/PricingSection";
import { BookingSection } from "@/components/BookingSection";
import { TrustSection } from "@/components/TrustSection";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { MobileBottomNav } from "@/components/MobileBottomNav";

const PlayBooking = () => {
  return (
    <PageTransition>
      <SEOHead page="play-booking" />
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />
        <main className="pt-20">
          <PricingSection />
          <BookingSection />
          <TrustSection />
        </main>
        <Footer />
        {/* Extra spacing for bottom nav - booking has its own sticky panel */}
        <div className="lg:hidden h-4" />
        <MobileBottomNav />
      </div>
    </PageTransition>
  );
};

export default PlayBooking;
