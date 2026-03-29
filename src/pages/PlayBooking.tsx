import { Navbar } from "@/components/Navbar";
import { PricingSection } from "@/components/PricingSection";
import { BookingSection } from "@/components/BookingSection";
import { TrustSection } from "@/components/TrustSection";
import { PlayFAQ } from "@/components/PlayFAQ";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { NewsBar } from "@/components/NewsBar";

const PlayBooking = () => {
  return (
    <PageTransition>
      <SEOHead page="play-booking" />
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />
        <NewsBar />
        <main>
          <PricingSection />
          <BookingSection />
          <PlayFAQ />
          <TrustSection />
        </main>
        <Footer />
        <div className="lg:hidden h-20" />
        <WhatsAppButton variant="floating" />
        <MobileBottomNav />
      </div>
    </PageTransition>
  );
};

export default PlayBooking;
